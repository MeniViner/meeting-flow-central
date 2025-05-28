import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useEffect } from "react";

export default function WorkspaceSelector() {
  const { workspaces = [], currentWorkspace, setCurrentWorkspace, isLoading } = useWorkspace();
  const { user } = useApp();

  // Filter workspaces to only show those the user has access to
  const accessibleWorkspaces = workspaces.filter(workspace => 
    user?.workspaceAccess?.some(access => access.workspaceId === workspace.id)
  );

  // If user only has access to one workspace, automatically select it
  useEffect(() => {
    if (accessibleWorkspaces.length === 1 && !currentWorkspace) {
      setCurrentWorkspace(accessibleWorkspaces[0]);
    }
  }, [accessibleWorkspaces, currentWorkspace, setCurrentWorkspace]);

  // Don't show selector if user only has access to one workspace
  if (isLoading || !workspaces || accessibleWorkspaces.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        dir="rtl"
        value={currentWorkspace?.id}
        onValueChange={(value) => {
          const workspace = accessibleWorkspaces.find((w) => w.id === value);
          if (workspace) {
            setCurrentWorkspace(workspace);
            // Save last visited workspace to localStorage
            localStorage.setItem("lastVisitedWorkspaceId", workspace.id);
          }
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="בחר סביבת עבודה" />
        </SelectTrigger>
        <SelectContent>
          {accessibleWorkspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              <div className="flex flex-col gap-1">
                {workspace.shortName}
                <span className="text-xs text-muted-foreground">
                  {workspace.longName}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 