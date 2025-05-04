export type UserRole = "admin" | "editor" | "viewer";

export type RequestStatus = "pending" | "scheduled" | "ended" | "completed" | "rejected";

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
  meetingSummaryFile?: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  };
  summaryReminderSent?: boolean;
}

export interface FilterOptions {
  status?: RequestStatus;
  deadline?: Date;
  searchTerm?: string;
}

export interface Workspace {
  id: string;
  shortName: string;
  longName: string;
  englishName: string;
  adminEmail: string;
  dataFileUrl: string;
}
