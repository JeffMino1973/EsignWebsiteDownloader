import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download as DownloadType } from "@shared/schema";
import { DownloadForm } from "@/components/download-form";
import { ProgressCard } from "@/components/progress-card";
import { DownloadHistory } from "@/components/download-history";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Home() {
  const { toast } = useToast();

  // Fetch all downloads with real-time polling
  const { data: downloads = [], isLoading } = useQuery<DownloadType[]>({
    queryKey: ["/api/downloads"],
    refetchInterval: (query) => {
      const data = query.state.data as DownloadType[] | undefined;
      // Poll every 2 seconds if there are active downloads
      const hasActiveDownloads = data?.some(
        (d) => d.status === "downloading" || d.status === "pending"
      );
      return hasActiveDownloads ? 2000 : false;
    },
  });

  // Start download mutation
  const startDownloadMutation = useMutation({
    mutationFn: async (data: { url: string; crawlDepth: number; maxPages: number }) => {
      return await apiRequest("POST", "/api/downloads", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      toast({
        title: "Download started",
        description: "Your website download has been queued",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete download mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/downloads/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      toast({
        title: "Download deleted",
        description: "The download has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDownloadStart = (url: string, crawlDepth: number, maxPages: number) => {
    startDownloadMutation.mutate({ url, crawlDepth, maxPages });
  };

  const handleDownloadZip = (id: string) => {
    window.open(`/api/downloads/${id}/zip`, "_blank");
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const activeDownloads = downloads.filter(
    (d) => d.status === "downloading" || d.status === "pending"
  );

  const hasAnyDownloads = downloads.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-foreground"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold" data-testid="text-app-title">
                Website Downloader
              </h1>
              <p className="text-sm text-muted-foreground">
                Download complete websites with ease
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Download Form Section */}
        <section>
          <div className="max-w-2xl mx-auto">
            <DownloadForm
              onDownloadStart={handleDownloadStart}
              isDownloading={startDownloadMutation.isPending}
            />
          </div>
        </section>

        {/* Active Downloads Section */}
        {activeDownloads.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Active Downloads</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Downloads currently in progress
              </p>
            </div>
            <div className="grid gap-4">
              {activeDownloads.map((download) => (
                <ProgressCard key={download.id} download={download} />
              ))}
            </div>
          </section>
        )}

        {/* Download History Section */}
        {hasAnyDownloads ? (
          <section>
            <DownloadHistory
              downloads={downloads}
              onDownloadZip={handleDownloadZip}
              onDelete={handleDelete}
            />
          </section>
        ) : (
          !isLoading && <EmptyState />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Download websites for offline viewing and archival purposes
          </p>
        </div>
      </footer>
    </div>
  );
}
