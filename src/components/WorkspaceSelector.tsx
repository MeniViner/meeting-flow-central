import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export default function WorkspaceSelector() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, isLoading } = useWorkspace();

  if (isLoading || workspaces.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        dir="rtl"
        value={currentWorkspace?.id}
        onValueChange={(value) => {
          const workspace = workspaces.find((w) => w.id === value);
          if (workspace) {
            setCurrentWorkspace(workspace);
          }
        }}
        >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="בחר סביבת עבודה" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.longName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 