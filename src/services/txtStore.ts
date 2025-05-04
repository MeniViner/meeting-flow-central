import { useWorkspace } from "@/contexts/WorkspaceContext";

interface StorageData {
  [key: string]: any;
}

export class TxtStore {
  private storage: StorageData = {};

  async getStrictSP<T>(key: string, workspaceId?: string): Promise<T | null> {
    try {
      const workspaceKey = workspaceId ? `${workspaceId}:${key}` : key;
      const data = localStorage.getItem(workspaceKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }

  async updateStrictSP(key: string, value: any, workspaceId?: string): Promise<void> {
    try {
      const workspaceKey = workspaceId ? `${workspaceId}:${key}` : key;
      localStorage.setItem(workspaceKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error updating data for key ${key}:`, error);
      throw error;
    }
  }

  async appendStrictSP<T>(key: string, data: T): Promise<void> {
    try {
      const currentData = await this.getStrictSP<T[]>(key) || [];
      const updatedData = [...currentData, data];
      await this.updateStrictSP(key, updatedData);
    } catch (error) {
      console.error(`Error appending data for key ${key}:`, error);
      throw error;
    }
  }
}

export const txtStore = new TxtStore(); 