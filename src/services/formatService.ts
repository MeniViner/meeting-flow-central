export interface Format {
  id: string;
  name: string;
  uploadDate: string;
  uploadedBy: string;
  downloadUrl: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';
const STORAGE_KEY = 'formats';

const isDevelopment = import.meta.env.DEV;

export const formatService = {
  async getFormats(): Promise<Format[]> {
    if (isDevelopment) {
      const storedFormats = localStorage.getItem(STORAGE_KEY);
      return storedFormats ? JSON.parse(storedFormats) : [];
    }

    const response = await fetch(`${API_URL}/formats`);
    if (!response.ok) throw new Error('Failed to fetch formats');
    return response.json();
  },

  async uploadFormat(file: File, name: string): Promise<Format> {
    if (isDevelopment) {
      const formats = await this.getFormats();
      const newFormat: Format = {
        id: crypto.randomUUID(),
        name,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'Current User', // In development, we'll just use a static name
        downloadUrl: URL.createObjectURL(file), // Create a local URL for the file
      };
      
      const updatedFormats = [...formats, newFormat];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFormats));
      return newFormat;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    const response = await fetch(`${API_URL}/formats`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload format');
    return response.json();
  },

  async deleteFormat(id: string): Promise<void> {
    if (isDevelopment) {
      const formats = await this.getFormats();
      const updatedFormats = formats.filter(format => format.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFormats));
      return;
    }

    const response = await fetch(`${API_URL}/formats/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete format');
  },
}; 