export type UserRole = "admin" | "editor" | "viewer";

export type RequestStatus = "pending" | "approved" | "rejected" | "scheduled" | "completed";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  lastLogin: string;
  cardId: string;
  department: string;
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
  description: string;
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
