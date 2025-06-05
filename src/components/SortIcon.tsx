// components/SortIcon.tsx
import { ChevronUp, ChevronDown } from "lucide-react";
import { FaSortUp, FaSortDown } from "react-icons/fa";


export default function SortIcon({
  active,
  order,
}: {
  active: boolean;
  order: "asc" | "desc";
}) {
  return (
    <span className="ml-1 flex flex-col items-center">
      <FaSortUp
        size={8}
        className={`transition-colors ${
          active && order === "asc" ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <FaSortDown
        size={8}
        className={`transition-colors -mt-4 ${
          active && order === "desc" ? "text-primary" : "text-muted-foreground"
        }`}
      />
    </span>
  );
}
