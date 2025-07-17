// src // compon // DateDisplay
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateDisplayProps {
  date: Date | string;
  format?: string;
  className?: string;
  showIcon?: boolean;
  showTime?: boolean;
}

export function DateDisplay({
  date,
  format: formatString = "PPP",
  className,
  showIcon = false,
  showTime = false,
}: DateDisplayProps) {
  if (!date) {
    return null;
  }
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    return null; // Don't render anything if the date is invalid
  }
  const dateFormat = showTime ? "PPP p" : formatString;
  
  return (
    <div className={cn("flex items-center text-sm", className)}>
      {showIcon && <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />}
      <time dateTime={dateObj.toISOString()}>{format(dateObj, dateFormat, { locale: he })}</time>
    </div>
  );
}
