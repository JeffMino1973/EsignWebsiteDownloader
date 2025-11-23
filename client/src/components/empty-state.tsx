import { Download, FolderDown } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" data-testid="empty-state">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
          <FolderDown className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Download className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">No downloads yet</h3>
      <p className="text-muted-foreground max-w-md">
        Enter a website URL above to start downloading. We'll fetch all the HTML, CSS, JavaScript, and images for you.
      </p>
    </div>
  );
}
