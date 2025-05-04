import { Badge } from "@/components/ui/badge";
import { RequestStatus } from "@/types";
import { cn } from "@/lib/utils";

interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "outline",
      className: "bg-yellow-100 text-status-pending border-status-pending"
    },
    scheduled: {
      label: "Scheduled",
      variant: "outline",
      className: "bg-blue-100 text-status-scheduled border-status-scheduled"
    },
    completed: {
      label: "Completed",
      variant: "outline",
      className: "bg-purple-100 text-status-completed border-status-completed"
    },
    rejected: {
      label: "Rejected",
      variant: "outline",
      className: "bg-red-100 text-status-rejected border-status-rejected"
    },
    ended: {
      label: "Ended",
      variant: "outline",
      className: "bg-orange-100 text-orange-800 border-orange-800"
    }
  };

  const config = statusConfig[status];

  if (!config) {
    // Fallback for unknown status
    return (
      <Badge variant="outline" className={className}>
        Unknown Status
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
