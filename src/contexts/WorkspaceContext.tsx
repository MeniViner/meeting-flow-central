import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Workspace } from "@/types/workspace";
import { txtStore } from "@/services/txtStore";
import { devWorkspaceService } from "@/services/devWorkspaceService";

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  isLoading: boolean;
  addWorkspace: (workspace: Omit<Workspace, "id">) => Promise<Workspace>;
  updateWorkspace: (workspace: Workspace) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      let loadedWorkspaces: Workspace[] = [];

      if (import.meta.env.VITE_NODE_ENV === "development") {
        loadedWorkspaces = await devWorkspaceService.getWorkspaces();
      } else {
        const workspaces = await txtStore.getStrictSP<Workspace[]>("workspaces");
        loadedWorkspaces = workspaces || [];
      }

      setWorkspaces(loadedWorkspaces);

      // First try to get last visited workspace from localStorage
      const lastVisitedWorkspaceId = localStorage.getItem("lastVisitedWorkspaceId");
      if (lastVisitedWorkspaceId) {
        const lastVisitedWorkspace = loadedWorkspaces.find(w => w.id === lastVisitedWorkspaceId);
        if (lastVisitedWorkspace) {
          setCurrentWorkspace(lastVisitedWorkspace);
          return;
        }
      }

      // If no last visited workspace, try to get from currentWorkspaceId
      const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
      if (savedWorkspaceId) {
        const savedWorkspace = loadedWorkspaces.find(w => w.id === savedWorkspaceId);
        if (savedWorkspace) {
          setCurrentWorkspace(savedWorkspace);
          return;
        }
      }

      // If no saved workspace is found and we have workspaces, set the first one
      if (!currentWorkspace && loadedWorkspaces.length > 0) {
        setCurrentWorkspace(loadedWorkspaces[0]);
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
      setWorkspaces([]); // Ensure we set an empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem("currentWorkspaceId", workspace.id);
    localStorage.setItem("lastVisitedWorkspaceId", workspace.id);
  };

  const handleAddWorkspace = async (workspace: Omit<Workspace, "id">) => {
    let newWorkspace: Workspace;
    
    if (import.meta.env.VITE_NODE_ENV === "development") {
      newWorkspace = await devWorkspaceService.addWorkspace(workspace);
    } else {
      newWorkspace = {
        ...workspace,
        id: `ws-${Date.now()}`,
      };
      await txtStore.updateStrictSP("workspaces", [...workspaces, newWorkspace]);
    }

    setWorkspaces(prev => [...prev, newWorkspace]);
    return newWorkspace;
  };

  const handleUpdateWorkspace = async (workspace: Workspace) => {
    if (import.meta.env.VITE_NODE_ENV === "development") {
      await devWorkspaceService.updateWorkspace(workspace);
    } else {
      const updatedWorkspaces = workspaces.map(w => 
        w.id === workspace.id ? workspace : w
      );
      await txtStore.updateStrictSP("workspaces", updatedWorkspaces);
    }

    setWorkspaces(prev => prev.map(w => w.id === workspace.id ? workspace : w));
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (import.meta.env.VITE_NODE_ENV === "development") {
      await devWorkspaceService.deleteWorkspace(workspaceId);
    } else {
      const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceId);
      await txtStore.updateStrictSP("workspaces", updatedWorkspaces);
    }

    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    
    // If the deleted workspace was the current one, set a new current workspace
    if (currentWorkspace?.id === workspaceId) {
      const newCurrentWorkspace = workspaces.find(w => w.id !== workspaceId);
      if (newCurrentWorkspace) {
        handleSetCurrentWorkspace(newCurrentWorkspace);
      } else {
        setCurrentWorkspace(null);
        localStorage.removeItem("currentWorkspaceId");
      }
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspace: handleSetCurrentWorkspace,
        isLoading,
        addWorkspace: handleAddWorkspace,
        updateWorkspace: handleUpdateWorkspace,
        deleteWorkspace: handleDeleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
} 