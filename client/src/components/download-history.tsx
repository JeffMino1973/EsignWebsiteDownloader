import { Download as DownloadType } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { FileTree } from "./file-tree";
import { useState } from "react";
import { format } from "date-fns";

interface DownloadHistoryProps {
  downloads: DownloadType[];
  onDownloadZip: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DownloadHistory({ downloads, onDownloadZip, onDelete }: DownloadHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completedDownloads = downloads.filter(d => d.status === "completed");

  if (completedDownloads.length === 0) {
    return null;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Download History</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Your completed downloads
        </p>
      </div>
      
      <div className="space-y-4">
        {completedDownloads.map((download) => {
          const isExpanded = expandedId === download.id;
          
          return (
            <Card key={download.id} className="border-border" data-testid={`card-download-${download.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg break-all" data-testid={`text-history-url-${download.id}`}>
                    {download.url}
                  </CardTitle>
                  <CardDescription className="mt-2 flex flex-wrap items-center gap-3">
                    <StatusBadge status={download.status} />
                    <span className="text-xs" data-testid={`text-history-count-${download.id}`}>
                      {download.totalFiles} files
                    </span>
                    {download.fileSize > 0 && (
                      <span className="text-xs" data-testid={`text-history-size-${download.id}`}>
                        {formatFileSize(download.fileSize)}
                      </span>
                    )}
                    {download.completedAt && (
                      <span className="text-xs" data-testid={`text-history-date-${download.id}`}>
                        {format(new Date(download.completedAt), "MMM d, yyyy h:mm a")}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {download.zipPath && (
                    <Button
                      size="sm"
                      onClick={() => onDownloadZip(download.id)}
                      data-testid={`button-download-zip-${download.id}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      ZIP
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(download.id)}
                    data-testid={`button-delete-${download.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {Array.isArray(download.files) && download.files.length > 0 && (
                <>
                  <CardContent className="pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : download.id)}
                      className="w-full justify-start"
                      data-testid={`button-toggle-files-${download.id}`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 mr-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
                      {isExpanded ? "Hide" : "Show"} file structure
                    </Button>
                  </CardContent>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <FileTree files={download.files as any} />
                    </CardContent>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
