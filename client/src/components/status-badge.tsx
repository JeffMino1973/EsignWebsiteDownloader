import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Download } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "downloading":
        return {
          label: "Downloading",
          icon: Download,
          className: "bg-primary/10 text-primary border-primary/20 animate-pulse",
        };
      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle2,
          className: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
        };
      case "error":
        return {
          label: "Error",
          icon: XCircle,
          className: "bg-destructive/10 text-destructive border-destructive/20",
        };
      case "pending":
      default:
        return {
          label: "Pending",
          icon: Clock,
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className} data-testid={`badge-status-${status}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
