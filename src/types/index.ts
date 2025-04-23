export type UserRole = "user" | "admin";

export type RequestStatus = "pending" | "approved" | "scheduled" | "completed" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

export interface MeetingRequest {
  id: string;
  title: string;
  description?: string;
  requesterId: string;
  requesterName: string;
  documents: Document[];
  deadline: Date;
  status: RequestStatus;
  createdAt: Date;
  scheduledTime?: Date;
  adminNotes?: string;
  meetingSummaryDescription?: string;
  meetingSummaryFile?: {
    name: string;
    url: string;
    type: string;
  };
}

export interface FilterOptions {
  status?: RequestStatus;
  deadline?: Date;
  searchTerm?: string;
}
