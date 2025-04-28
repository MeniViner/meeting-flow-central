let mockStorage: Record<string, any> = {};

export const txtStore = {
  // Mock SharePoint createStrictSP
  createStrictSP: async (key: string, data: any): Promise<void> => {
    mockStorage[key] = data;
    return Promise.resolve();
  },
  // Mock SharePoint getStrictSP
  getStrictSP: async (key: string): Promise<any> => {
    return Promise.resolve(mockStorage[key] || []);
  },
  // Mock SharePoint updateStrictSP
  updateStrictSP: async (key: string, data: any): Promise<void> => {
    mockStorage[key] = data;
    return Promise.resolve();
  },
  // Mock SharePoint appendStrictSP
  appendStrictSP: async (key: string, data: any): Promise<void> => {
    const existing = mockStorage[key] || [];
    mockStorage[key] = [...existing, data];
    return Promise.resolve();
  }
};

export const getCurrentUserCardId = (): string => {
  // In development, we'll use a mock card ID
  // In production, this will be replaced with actual card reading logic
  return "DEV-12345";
};
// ... existing code ... 