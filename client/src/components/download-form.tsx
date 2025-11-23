import { useState } from "react";
import { Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { insertDownloadSchema } from "@shared/schema";

interface DownloadFormProps {
  onDownloadStart: (url: string, crawlDepth: number, maxPages: number) => void;
  isDownloading: boolean;
}

export function DownloadForm({ onDownloadStart, isDownloading }: DownloadFormProps) {
  const [url, setUrl] = useState("");
  const [crawlDepth, setCrawlDepth] = useState("0");
  const [maxPages, setMaxPages] = useState("50");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = insertDownloadSchema.safeParse({ 
      url,
      crawlDepth: parseInt(crawlDepth),
      maxPages: parseInt(maxPages),
    });
    
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || "Invalid URL";
      setError(errorMessage);
      toast({
        title: "Invalid URL",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    onDownloadStart(url, parseInt(crawlDepth), parseInt(maxPages));
    setUrl("");
  };

  return (
    <Card className="border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Download Website</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter a website URL and configure download options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              className={error ? "border-destructive" : ""}
              disabled={isDownloading}
              data-testid="input-url"
            />
            {error && (
              <p className="text-sm text-destructive" data-testid="text-url-error">
                {error}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="crawl-depth">Crawl Depth</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      0 = Single page only<br />
                      1 = Follow links one level deep<br />
                      2-5 = Follow links multiple levels
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={crawlDepth}
                onValueChange={setCrawlDepth}
                disabled={isDownloading}
              >
                <SelectTrigger id="crawl-depth" data-testid="select-crawl-depth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Single Page (0)</SelectItem>
                  <SelectItem value="1">1 Level</SelectItem>
                  <SelectItem value="2">2 Levels</SelectItem>
                  <SelectItem value="3">3 Levels</SelectItem>
                  <SelectItem value="4">4 Levels</SelectItem>
                  <SelectItem value="5">5 Levels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="max-pages">Max Pages</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Maximum number of pages to download (prevents infinite crawling)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={maxPages}
                onValueChange={setMaxPages}
                disabled={isDownloading}
              >
                <SelectTrigger id="max-pages" data-testid="select-max-pages">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 pages</SelectItem>
                  <SelectItem value="25">25 pages</SelectItem>
                  <SelectItem value="50">50 pages</SelectItem>
                  <SelectItem value="100">100 pages</SelectItem>
                  <SelectItem value="200">200 pages</SelectItem>
                  <SelectItem value="500">500 pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isDownloading || !url.trim()}
            data-testid="button-download"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download Website"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
