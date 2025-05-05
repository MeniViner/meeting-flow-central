import { useWorkspace } from "@/contexts/WorkspaceContext";

// Base URLs for SharePoint text files in production
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://MY.ORGANIZATION.COM/sites/more_nevochim/Shared%20Documents/data'
  : '';

interface StorageData {
  [key: string]: any;
}

// Helper to parse text content into object
function parseTextContent(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Helper to stringify object to text content
function stringifyData(data: any): string {
  return JSON.stringify(data, null, 2);
}

export class TxtStore {
  private storage: StorageData = {};

  private getWorkspaceKey(key: string, workspaceId?: string): string {
    return workspaceId ? `${workspaceId}:${key}` : key;
  }

  async getStrictSP<T>(key: string, workspaceId?: string): Promise<T | null> {
    try {
      if (process.env.NODE_ENV === 'development') {
        const workspaceKey = this.getWorkspaceKey(key, workspaceId);
        const data = localStorage.getItem(workspaceKey);
        return data ? JSON.parse(data) : null;
      } else {
        // Production: Fetch from SharePoint
        const workspaceKey = this.getWorkspaceKey(key, workspaceId);
        const res = await fetch(`${BASE_URL}/${workspaceKey}.txt`, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
          },
        });
        const text = await res.text();
        return parseTextContent(text);
      }
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }

  async updateStrictSP(key: string, value: any, workspaceId?: string): Promise<void> {
    try {
      const workspaceKey = this.getWorkspaceKey(key, workspaceId);
      
      if (process.env.NODE_ENV === 'development') {
        localStorage.setItem(workspaceKey, JSON.stringify(value));
      } else {
        // Production: Update SharePoint file
        const response = await fetch(`${BASE_URL}/${workspaceKey}.txt`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: stringifyData(value),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update file: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error(`Error updating data for key ${key}:`, error);
      throw error;
    }
  }

  async appendStrictSP<T>(key: string, data: T, workspaceId?: string): Promise<void> {
    try {
      const workspaceKey = this.getWorkspaceKey(key, workspaceId);
      const currentData = await this.getStrictSP<T[]>(workspaceKey) || [];
      const updatedData = [...currentData, data];
      await this.updateStrictSP(workspaceKey, updatedData);
    } catch (error) {
      console.error(`Error appending data for key ${key}:`, error);
      throw error;
    }
  }

  async deleteStrictSP(key: string, filterId?: string, workspaceId?: string): Promise<void> {
    try {
      const workspaceKey = this.getWorkspaceKey(key, workspaceId);
      
      if (filterId) {
        const currentData = await this.getStrictSP<any[]>(workspaceKey);
        if (Array.isArray(currentData)) {
          const filteredData = currentData.filter(item => item.id !== filterId);
          await this.updateStrictSP(workspaceKey, filteredData);
        }
      } else {
        // If no filterId, clear the file
        await this.updateStrictSP(workspaceKey, []);
      }
    } catch (error) {
      console.error(`Error deleting data for key ${key}:`, error);
      throw error;
    }
  }
}

export const txtStore = new TxtStore(); 