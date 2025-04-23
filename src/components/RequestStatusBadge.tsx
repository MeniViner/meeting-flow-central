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
    approved: {
      label: "Approved",
      variant: "outline",
      className: "bg-green-100 text-status-approved border-status-approved"
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
    }
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
