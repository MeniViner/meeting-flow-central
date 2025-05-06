import { MeetingRequest } from "@/types";

// In-memory storage for development
let meetingRequests: MeetingRequest[] = [];

export const devMeetingService = {
  async getRequests(): Promise<MeetingRequest[]> {
    return meetingRequests;
  },

  async createRequest(request: MeetingRequest): Promise<MeetingRequest> {
    meetingRequests.push(request);
    return request;
  },

  async updateRequest(requestId: string, updatedRequest: MeetingRequest): Promise<MeetingRequest> {
    const index = meetingRequests.findIndex(r => r.id === requestId);
    if (index === -1) {
      throw new Error("Request not found");
    }
    meetingRequests[index] = updatedRequest;
    return updatedRequest;
  },

  async deleteRequest(requestId: string): Promise<void> {
    meetingRequests = meetingRequests.filter(r => r.id !== requestId);
  },

  // Helper function to reset the development data
  resetData() {
    meetingRequests = [];
  }
}; 