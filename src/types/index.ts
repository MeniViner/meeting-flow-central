// src/types/index.ts
export type UserRole = "owner" | "administrator" | "editor" | "regular";

export type RequestStatus = "pending" | "scheduled" | "ended" | "completed" | "rejected";

export interface WorkspaceAccess {
  workspaceId: string;
  role: UserRole;
}

export interface User {
  id: string;
  employeeId: string; // Company employee ID
  spsClaimId: string; // Added for SP authentication
  name: string;
  email: string;
  department: string;
  status: "active" | "inactive";
  lastLogin?: string;
  globalRole: UserRole;
  workspaceAccess: WorkspaceAccess[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
  uploadedBy?: string; // Optional field for document ownership
}

export interface MeetingRequest {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  documents: Document[];
  deadline: string;
  status: RequestStatus;
  createdAt: string;
  scheduledTime?: string;
  scheduledEndTime?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  adminNotes?: string;
  meetingSummaryFile?: {
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  };
  summaryReminderSent?: boolean;
}

export interface FilterOptions {
  status?: RequestStatus;
  deadline?: string;
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

export interface AccessRequest {
  id: string;
  employeeId: string;
  spsClaimId: string; // Added for SP authentication
  name: string;
  email: string;
  department: string;
  requestedWorkspaceId: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  requestName?: string;
  createdAt: Date;
  read?: boolean;
}
