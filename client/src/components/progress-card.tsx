import { Download as DownloadType } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Download as DownloadIcon } from "lucide-react";
import { StatusBadge } from "./status-badge";

interface ProgressCardProps {
  download: DownloadType;
  onCancel?: (id: string) => void;
}

export function ProgressCard({ download, onCancel }: ProgressCardProps) {
  const progress = download.totalFiles > 0 
    ? (download.downloadedFiles / download.totalFiles) * 100 
    : 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg truncate" data-testid={`text-download-url-${download.id}`}>
            {download.url}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <StatusBadge status={download.status} />
            <span className="text-sm text-muted-foreground" data-testid={`text-download-count-${download.id}`}>
              {download.downloadedFiles} / {download.totalFiles} files
            </span>
            {download.totalPages && download.totalPages > 1 && (
              <span className="text-sm text-muted-foreground" data-testid={`text-pages-count-${download.id}`}>
                {download.totalPages} pages
              </span>
            )}
          </div>
        </div>
        {download.status === "downloading" && onCancel && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onCancel(download.id)}
            data-testid={`button-cancel-${download.id}`}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {download.status === "downloading" && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" data-testid={`progress-${download.id}`} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}% complete</span>
              {download.fileSize > 0 && (
                <span data-testid={`text-size-${download.id}`}>{formatFileSize(download.fileSize)}</span>
              )}
            </div>
          </div>
        )}
        
        {download.status === "error" && download.error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md" data-testid={`text-error-${download.id}`}>
            {download.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
