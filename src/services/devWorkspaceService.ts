import { Workspace } from "@/types/workspace";

const DEV_WORKSPACES_KEY = "dev_workspaces";

export const devWorkspaceService = {
  async getWorkspaces(): Promise<Workspace[]> {
    const workspaces = localStorage.getItem(DEV_WORKSPACES_KEY);
    if (!workspaces) {
      // Initialize with a default workspace if none exist
      const defaultWorkspace: Workspace = {
        id: "ws-1",
        shortName: "משרד",
        longName: "משרד ראשי",
        englishName: "Main Office",
        adminEmail: "admin@example.com",
        dataFileUrl: "https://example.com/data.json",
      };
      await this.saveWorkspaces([defaultWorkspace]);
      return [defaultWorkspace];
    }
    return JSON.parse(workspaces);
  },

  async saveWorkspaces(workspaces: Workspace[]): Promise<void> {
    localStorage.setItem(DEV_WORKSPACES_KEY, JSON.stringify(workspaces));
  },

  async addWorkspace(workspace: Omit<Workspace, "id">): Promise<Workspace> {
    const workspaces = await this.getWorkspaces();
    const newWorkspace: Workspace = {
      ...workspace,
      id: `ws-${Date.now()}`,
    };
    await this.saveWorkspaces([...workspaces, newWorkspace]);
    return newWorkspace;
  },

  async updateWorkspace(workspace: Workspace): Promise<void> {
    const workspaces = await this.getWorkspaces();
    const updatedWorkspaces = workspaces.map((w) =>
      w.id === workspace.id ? workspace : w
    );
    await this.saveWorkspaces(updatedWorkspaces);
  },

  async deleteWorkspace(workspaceId: string): Promise<void> {
    const workspaces = await this.getWorkspaces();
    const updatedWorkspaces = workspaces.filter((w) => w.id !== workspaceId);
    await this.saveWorkspaces(updatedWorkspaces);
  },
}; 