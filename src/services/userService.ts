import { User, UserRole, WorkspaceAccess, AccessRequest } from "@/types";
import { txtStore } from "./txtStore";

class UserService {
  private readonly USERS_KEY = "allUsers";
  private readonly ACCESS_REQUESTS_KEY = "accessRequests";

  // Get all users
  async getAllUsers(): Promise<User[]> {
    return await txtStore.getStrictSP<User[]>(this.USERS_KEY) || [];
  }

  // Get user by employee ID
  async getUserByEmployeeId(employeeId: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.employeeId === employeeId) || null;
  }

  // Get user's role in a specific workspace
  async getUserWorkspaceRole(employeeId: string, workspaceId: string): Promise<UserRole | null> {
    const user = await this.getUserByEmployeeId(employeeId);
    if (!user) return null;

    // If user is an owner, they have full access to all workspaces
    if (user.globalRole === "owner") return "owner";

    // Check workspace-specific role
    const workspaceAccess = user.workspaceAccess.find(wa => wa.workspaceId === workspaceId);
    return workspaceAccess?.role || null;
  }

  // Add or update user
  async upsertUser(userData: Partial<User> & { employeeId: string }): Promise<User> {
    const users = await this.getAllUsers();
    const existingUser = users.find(u => u.employeeId === userData.employeeId);

    const now = new Date().toISOString();
    let updatedUser: User;

    if (existingUser) {
      // Update existing user
      updatedUser = {
        ...existingUser,
        ...userData,
        updatedAt: now
      };
    } else {
      // Create new user
      updatedUser = {
        id: `user-${Date.now()}`,
        employeeId: userData.employeeId,
        name: userData.name || "",
        email: userData.email || "",
        department: userData.department || "",
        status: "active",
        lastLogin: now,
        globalRole: userData.globalRole || "regular",
        workspaceAccess: userData.workspaceAccess || [],
        createdAt: now,
        updatedAt: now
      };
    }

    // Update storage
    const updatedUsers = existingUser
      ? users.map(u => u.employeeId === userData.employeeId ? updatedUser : u)
      : [...users, updatedUser];

    await txtStore.updateStrictSP(this.USERS_KEY, updatedUsers);
    return updatedUser;
  }

  // Add user to workspace
  async addUserToWorkspace(employeeId: string, workspaceId: string, role: UserRole): Promise<User> {
    const user = await this.getUserByEmployeeId(employeeId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already has access to this workspace
    const existingAccess = user.workspaceAccess.find(wa => wa.workspaceId === workspaceId);
    if (existingAccess) {
      // Update existing role
      const updatedAccess = user.workspaceAccess.map(wa =>
        wa.workspaceId === workspaceId ? { ...wa, role } : wa
      );
      return this.upsertUser({
        employeeId,
        workspaceAccess: updatedAccess
      });
    } else {
      // Add new workspace access
      return this.upsertUser({
        employeeId,
        workspaceAccess: [...user.workspaceAccess, { workspaceId, role }]
      });
    }
  }

  // Remove user from workspace
  async removeUserFromWorkspace(employeeId: string, workspaceId: string): Promise<User> {
    const user = await this.getUserByEmployeeId(employeeId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedAccess = user.workspaceAccess.filter(wa => wa.workspaceId !== workspaceId);
    return this.upsertUser({
      employeeId,
      workspaceAccess: updatedAccess
    });
  }

  // Get all access requests
  async getAccessRequests(): Promise<AccessRequest[]> {
    return await txtStore.getStrictSP<AccessRequest[]>(this.ACCESS_REQUESTS_KEY) || [];
  }

  // Get access requests for a specific workspace
  async getWorkspaceAccessRequests(workspaceId: string): Promise<AccessRequest[]> {
    const requests = await this.getAccessRequests();
    return requests.filter(r => r.requestedWorkspaceId === workspaceId);
  }

  // Create access request
  async createAccessRequest(requestData: Omit<AccessRequest, "id" | "status" | "createdAt" | "updatedAt">): Promise<AccessRequest> {
    const requests = await this.getAccessRequests();
    const now = new Date().toISOString();

    const newRequest: AccessRequest = {
      id: `req-${Date.now()}`,
      ...requestData,
      status: "pending",
      createdAt: now,
      updatedAt: now
    };

    await txtStore.updateStrictSP(this.ACCESS_REQUESTS_KEY, [...requests, newRequest]);
    return newRequest;
  }

  // Update access request status
  async updateAccessRequestStatus(requestId: string, status: "approved" | "rejected", notes?: string): Promise<AccessRequest> {
    const requests = await this.getAccessRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) {
      throw new Error("Access request not found");
    }

    const updatedRequest: AccessRequest = {
      ...request,
      status,
      notes,
      updatedAt: new Date().toISOString()
    };

    const updatedRequests = requests.map(r => r.id === requestId ? updatedRequest : r);
    await txtStore.updateStrictSP(this.ACCESS_REQUESTS_KEY, updatedRequests);

    // If approved, add user to workspace
    if (status === "approved") {
      await this.addUserToWorkspace(request.employeeId, request.requestedWorkspaceId, "regular");
    }

    return updatedRequest;
  }
}

export const userService = new UserService(); 