export type UserRole = "owner" | "administrator" | "regular";

export type RequestStatus = "pending" | "scheduled" | "ended" | "completed" | "rejected";

export interface WorkspaceAccess {
  workspaceId: string;
  role: UserRole;
}

export interface User {
  id: string;
  employeeId: string; // Company employee ID
  name: string;
  email: string;
  department: string;
  status: "active" | "inactive";
  lastLogin: string;
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

export interface AccessRequest {
  id: string;
  employeeId: string;
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
