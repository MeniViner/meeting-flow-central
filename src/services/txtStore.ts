interface StorageData {
  [key: string]: any;
}

class TxtStore {
  private storage: StorageData = {};

  async getStrictSP(key: string): Promise<any> {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }

  async updateStrictSP(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error updating data for key ${key}:`, error);
      throw error;
    }
  }
}

export const txtStore = new TxtStore(); 