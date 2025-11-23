import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDownloadSchema } from "@shared/schema";
import { downloadService } from "./download-service";
import * as fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all downloads
  app.get("/api/downloads", async (req, res) => {
    try {
      const downloads = await storage.getAllDownloads();
      res.json(downloads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new download
  app.post("/api/downloads", async (req, res) => {
    try {
      const result = insertDownloadSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: result.error.errors[0]?.message || "Invalid URL" 
        });
      }

      const download = await storage.createDownload(result.data);
      
      // Start download process in background
      downloadService.startDownload(download.id).catch(console.error);
      
      res.status(201).json(download);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific download
  app.get("/api/downloads/:id", async (req, res) => {
    try {
      const download = await storage.getDownload(req.params.id);
      
      if (!download) {
        return res.status(404).json({ error: "Download not found" });
      }
      
      res.json(download);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Download ZIP file
  app.get("/api/downloads/:id/zip", async (req, res) => {
    try {
      const zipPath = await downloadService.getZipPath(req.params.id);
      
      if (!zipPath || !fs.existsSync(zipPath)) {
        return res.status(404).json({ error: "ZIP file not found" });
      }

      const download = await storage.getDownload(req.params.id);
      const filename = download ? `${new URL(download.url).hostname}.zip` : "website.zip";
      
      res.download(zipPath, filename);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a download
  app.delete("/api/downloads/:id", async (req, res) => {
    try {
      const download = await storage.getDownload(req.params.id);
      
      if (!download) {
        return res.status(404).json({ error: "Download not found" });
      }

      // Delete files (optional - you might want to keep them)
      // For now, just remove from storage
      
      const deleted = await storage.deleteDownload(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Download not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
