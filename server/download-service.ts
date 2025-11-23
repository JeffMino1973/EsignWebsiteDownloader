import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";
import { storage } from "./storage";
import { Download, FileNode } from "@shared/schema";

const DOWNLOADS_DIR = path.join(process.cwd(), "downloads");
const TIMEOUT = 30000; // 30 seconds timeout

// Ensure downloads directory exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

interface PageToDownload {
  url: string;
  depth: number;
  filename: string;
}

interface Resource {
  url: string;
  filename: string;
}

export class DownloadService {
  private activeDownloads = new Map<string, boolean>();

  async startDownload(downloadId: string) {
    const download = await storage.getDownload(downloadId);
    if (!download) throw new Error("Download not found");

    if (this.activeDownloads.get(downloadId)) {
      throw new Error("Download already in progress");
    }

    this.activeDownloads.set(downloadId, true);

    // Start download in background
    this.processDownload(downloadId).catch(async (error) => {
      console.error(`Download ${downloadId} failed:`, error);
      await storage.updateDownload(downloadId, {
        status: "error",
        error: error.message || "Failed to download website",
      });
    }).finally(() => {
      this.activeDownloads.delete(downloadId);
    });
  }

  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove fragment
      parsed.hash = "";
      // Normalize trailing slash
      if (parsed.pathname.endsWith('/') && parsed.pathname !== '/') {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }
      // Lowercase hostname
      parsed.hostname = parsed.hostname.toLowerCase();
      return parsed.toString();
    } catch {
      return url;
    }
  }

  private isInternalUrl(startUrl: URL, targetUrl: URL): boolean {
    // Must be same origin
    if (startUrl.origin !== targetUrl.origin) {
      return false;
    }

    // For Google Sites, ensure we stay within the same site path
    if (startUrl.hostname.includes('sites.google.com')) {
      const startPath = startUrl.pathname.split('/').slice(0, 3).join('/');
      const targetPath = targetUrl.pathname.split('/').slice(0, 3).join('/');
      return startPath === targetPath;
    }

    return true;
  }

  private shouldSkipUrl(url: string): boolean {
    const lower = url.toLowerCase();
    return (
      lower.startsWith('mailto:') ||
      lower.startsWith('javascript:') ||
      lower.startsWith('tel:') ||
      lower.startsWith('data:') ||
      lower.startsWith('#')
    );
  }

  private isDownloadableFile(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|tar|gz|txt|csv|json|xml)$/i) !== null;
  }

  private isMediaFile(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|bmp|tiff|mp4|mp3|avi|mov|wmv|flv|wav|ogg|webm)$/i) !== null;
  }

  private getPageFilename(pageUrl: URL, index: number): string {
    if (index === 0) {
      return "index.html";
    }

    let pathname = pageUrl.pathname;
    if (pathname === '/' || pathname === '') {
      return `page-${index}.html`;
    }

    // Remove leading/trailing slashes
    pathname = pathname.replace(/^\/|\/$/g, '');
    
    // Replace slashes with hyphens, keep it clean
    const cleaned = pathname.replace(/\//g, '-').replace(/[^a-zA-Z0-9-_]/g, '-');
    
    if (cleaned.endsWith('.html') || cleaned.endsWith('.htm')) {
      return `pages/${cleaned}`;
    }
    
    return `pages/${cleaned}.html`;
  }

  private async processDownload(downloadId: string) {
    const download = await storage.getDownload(downloadId);
    if (!download) return;

    await storage.updateDownload(downloadId, { status: "downloading" });

    try {
      const startUrl = new URL(download.url);
      const downloadDir = path.join(DOWNLOADS_DIR, downloadId);
      
      // Create download directory
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const visited = new Set<string>();
      const queue: PageToDownload[] = [{
        url: download.url,
        depth: 0,
        filename: this.getPageFilename(startUrl, 0)
      }];
      
      const files: string[] = [];
      const allResources: Resource[] = [];
      let downloadedFiles = 0;
      let totalSize = 0;
      let pageIndex = 0;
      const crawlDepth = download.crawlDepth || 0;
      const maxPages = download.maxPages || 50;

      // BFS crawling
      while (queue.length > 0 && visited.size < maxPages) {
        const page = queue.shift()!;
        const normalizedUrl = this.normalizeUrl(page.url);

        if (visited.has(normalizedUrl)) {
          continue;
        }
        visited.add(normalizedUrl);

        try {
          console.log(`Downloading page ${visited.size}/${maxPages}: ${page.url}`);
          
          // Download the HTML page
          const response = await axios.get(page.url, { 
            timeout: TIMEOUT,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; WebsiteDownloader/1.0)',
            },
          });
          const html = response.data;
          const $ = cheerio.load(html);

          // Extract resources from this page
          const pageResources: Resource[] = [];
          const pageUrl = new URL(page.url);

          // Extract CSS files
          $('link[rel="stylesheet"]').each((_, elem) => {
            const href = $(elem).attr("href");
            if (href) {
              const resourceUrl = this.resolveUrl(pageUrl, href);
              const filename = this.getFilename(href, "css");
              pageResources.push({ url: resourceUrl, filename });
            }
          });

          // Extract JavaScript files
          $('script[src]').each((_, elem) => {
            const src = $(elem).attr("src");
            if (src) {
              const resourceUrl = this.resolveUrl(pageUrl, src);
              const filename = this.getFilename(src, "js");
              pageResources.push({ url: resourceUrl, filename });
            }
          });

          // Extract images
          $('img[src]').each((_, elem) => {
            const src = $(elem).attr("src");
            if (src) {
              const resourceUrl = this.resolveUrl(pageUrl, src);
              const filename = this.getFilename(src, "images");
              pageResources.push({ url: resourceUrl, filename });
            }
          });

          // Extract downloadable attachments from links
          $('a[href]').each((_, elem) => {
            const href = $(elem).attr("href");
            if (!href || this.shouldSkipUrl(href)) {
              return;
            }

            try {
              const linkUrl = new URL(href, page.url);
              
              // Check if it's a downloadable file or media file
              if (this.isDownloadableFile(linkUrl.toString()) || this.isMediaFile(linkUrl.toString())) {
                // Only download if it's from the same origin
                if (this.isInternalUrl(startUrl, linkUrl)) {
                  const resourceUrl = linkUrl.toString();
                  const filename = this.getFilename(href, "attachments");
                  pageResources.push({ url: resourceUrl, filename });
                }
              }
            } catch (error) {
              // Invalid URL, skip
            }
          });

          // Add to all resources (deduplicate later)
          allResources.push(...pageResources);

          // Save HTML file
          const pagePath = path.join(downloadDir, page.filename);
          const pageDir = path.dirname(pagePath);
          if (!fs.existsSync(pageDir)) {
            fs.mkdirSync(pageDir, { recursive: true });
          }
          
          fs.writeFileSync(pagePath, html);
          files.push(page.filename);
          totalSize += Buffer.byteLength(html);
          downloadedFiles++;

          // Update progress
          await storage.updateDownload(downloadId, {
            totalPages: visited.size,
            downloadedFiles,
            fileSize: totalSize,
          });

          // Extract links if we should crawl deeper
          if (page.depth < crawlDepth) {
            $('a[href]').each((_, elem) => {
              const href = $(elem).attr("href");
              if (!href || this.shouldSkipUrl(href)) {
                return;
              }

              try {
                const linkUrl = new URL(href, page.url);
                
                // Skip if it's a downloadable file or media (already handled as resources)
                if (this.isDownloadableFile(linkUrl.toString()) || this.isMediaFile(linkUrl.toString())) {
                  return;
                }
                
                if (this.isInternalUrl(startUrl, linkUrl)) {
                  const normalized = this.normalizeUrl(linkUrl.toString());
                  if (!visited.has(normalized)) {
                    pageIndex++;
                    queue.push({
                      url: linkUrl.toString(),
                      depth: page.depth + 1,
                      filename: this.getPageFilename(linkUrl, pageIndex)
                    });
                  }
                }
              } catch (error) {
                // Invalid URL, skip
              }
            });
          }

        } catch (error) {
          console.error(`Failed to download page ${page.url}:`, error);
          // Continue with other pages
        }
      }

      // Deduplicate resources
      const uniqueResources = new Map<string, Resource>();
      allResources.forEach(r => {
        if (!uniqueResources.has(r.url)) {
          uniqueResources.set(r.url, r);
        }
      });

      const resourcesList = Array.from(uniqueResources.values());
      const totalFiles = files.length + resourcesList.length;

      await storage.updateDownload(downloadId, {
        totalFiles,
        totalPages: visited.size,
      });

      // Download all resources
      for (const resource of resourcesList) {
        try {
          const resourceResponse = await axios.get(resource.url, {
            responseType: "arraybuffer",
            timeout: TIMEOUT,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; WebsiteDownloader/1.0)',
            },
          });

          const resourcePath = path.join(downloadDir, resource.filename);
          const resourceDir = path.dirname(resourcePath);
          
          if (!fs.existsSync(resourceDir)) {
            fs.mkdirSync(resourceDir, { recursive: true });
          }

          fs.writeFileSync(resourcePath, resourceResponse.data);
          files.push(resource.filename);
          totalSize += resourceResponse.data.length;
          downloadedFiles++;

          await storage.updateDownload(downloadId, {
            downloadedFiles,
            fileSize: totalSize,
          });
        } catch (error) {
          console.error(`Failed to download ${resource.url}:`, error);
          // Continue with other resources
        }
      }

      // Create file tree structure
      const fileTree = this.buildFileTree(files);

      // Create ZIP file
      const zipPath = await this.createZip(downloadId, downloadDir);

      // Update download as completed
      await storage.updateDownload(downloadId, {
        status: "completed",
        files: fileTree,
        zipPath,
        completedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(error.message || "Failed to download website");
    }
  }

  private resolveUrl(baseUrl: URL, relativeUrl: string): string {
    try {
      // Remove query parameters and fragments for cleaner URLs
      const cleanUrl = relativeUrl.split('?')[0].split('#')[0];
      
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        return cleanUrl;
      }
      if (cleanUrl.startsWith('//')) {
        return baseUrl.protocol + cleanUrl;
      }
      if (cleanUrl.startsWith('/')) {
        return `${baseUrl.protocol}//${baseUrl.host}${cleanUrl}`;
      }
      return `${baseUrl.protocol}//${baseUrl.host}${baseUrl.pathname}${cleanUrl}`;
    } catch {
      return relativeUrl;
    }
  }

  private getFilename(url: string, type: string): string {
    try {
      const cleanUrl = url.split('?')[0].split('#')[0];
      const urlPath = new URL(cleanUrl).pathname;
      const segments = urlPath.split('/').filter(Boolean);
      
      if (segments.length === 0) {
        return `${type}/resource-${Date.now()}`;
      }

      const filename = segments[segments.length - 1];
      
      // Create directory structure
      if (segments.length > 1) {
        const dir = segments.slice(0, -1).join('/');
        return `${dir}/${filename}`;
      }
      
      return filename;
    } catch {
      return `${type}/resource-${Date.now()}`;
    }
  }

  private buildFileTree(files: string[]): FileNode[] {
    const root: { [key: string]: any } = {};

    files.forEach((file) => {
      const parts = file.split('/');
      let current = root;

      parts.forEach((part, index) => {
        if (!current[part]) {
          if (index === parts.length - 1) {
            // It's a file
            current[part] = { _file: true };
          } else {
            // It's a folder
            current[part] = {};
          }
        }
        if (index < parts.length - 1) {
          current = current[part];
        }
      });
    });

    const buildNodes = (obj: any, basePath: string = ""): FileNode[] => {
      return Object.entries(obj).map(([name, value]) => {
        const fullPath = basePath ? `${basePath}/${name}` : name;
        
        if (value && typeof value === "object" && value._file) {
          return {
            name,
            path: fullPath,
            type: "file" as const,
          };
        } else {
          return {
            name,
            path: fullPath,
            type: "folder" as const,
            children: buildNodes(value, fullPath),
          };
        }
      });
    };

    return buildNodes(root);
  }

  private async createZip(downloadId: string, sourceDir: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const zipPath = path.join(DOWNLOADS_DIR, `${downloadId}.zip`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        resolve(zipPath);
      });

      archive.on("error", (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  async getZipPath(downloadId: string): Promise<string | null> {
    const download = await storage.getDownload(downloadId);
    if (!download || !download.zipPath) return null;
    return download.zipPath;
  }
}

export const downloadService = new DownloadService();
