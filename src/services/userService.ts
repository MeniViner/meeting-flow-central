import { User, UserRole, WorkspaceAccess, AccessRequest } from "@/types";
import { txtStore } from "@/services/txtStore";

const USERS_KEY = "users";
const ACCESS_REQUESTS_KEY = "access_requests";
const WORKSPACE_USERS_KEY = "workspace_users";

class UserService {
  // --- LocalStorage helpers (for development) ---
  private getUsersFromStorage(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsersToStorage(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private getAccessRequestsFromStorage(): AccessRequest[] {
    const requestsJson = localStorage.getItem(ACCESS_REQUESTS_KEY);
    return requestsJson ? JSON.parse(requestsJson) : [];
  }

  private saveAccessRequestsToStorage(requests: AccessRequest[]): void {
    localStorage.setItem(ACCESS_REQUESTS_KEY, JSON.stringify(requests));
  }

  // --- Main API ---
  async getAllUsers(): Promise<User[]> {
    if (process.env.NODE_ENV === "development") {
      return this.getUsersFromStorage();
    } else {
      return (await txtStore.getStrictSP<User[]>(USERS_KEY)) || [];
    }
  }

  async getUserByEmployeeId(employeeId: string): Promise<User | null> {
    if (process.env.NODE_ENV === "development") {
      const users = this.getUsersFromStorage();
      return users.find(user => user.employeeId === employeeId) || null;
    } else {
      const users = (await txtStore.getStrictSP<User[]>(USERS_KEY)) || [];
      return users.find(user => user.employeeId === employeeId) || null;
    }
  }

  async getWorkspaceUsers(workspaceId: string): Promise<User[]> {
    if (process.env.NODE_ENV === "development") {
      const users = this.getUsersFromStorage();
      return users.filter(user => 
        Array.isArray(user.workspaceAccess) &&
        user.workspaceAccess.some(access => access.workspaceId === workspaceId)
      );
    } else {
      const workspaceUsersKey = `users_${workspaceId}`;
      return (await txtStore.getStrictSP<User[]>(workspaceUsersKey)) || [];
    }
  }

  async addUserToWorkspace(employeeId: string, workspaceId: string, role: UserRole): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      const users = this.getUsersFromStorage();
      const userIndex = users.findIndex(user => user.employeeId === employeeId);
      if (userIndex === -1) throw new Error("User not found");
      const user = users[userIndex];
      const existingAccessIndex = user.workspaceAccess.findIndex(
        access => access.workspaceId === workspaceId
      );
      if (existingAccessIndex !== -1) {
        user.workspaceAccess[existingAccessIndex].role = role;
      } else {
        user.workspaceAccess.push({ workspaceId, role });
      }
      this.saveUsersToStorage(users);
    } else {
      // In production, add user to workspace-specific TXT file
      const users = (await txtStore.getStrictSP<User[]>(USERS_KEY)) || [];
      const user = users.find(u => u.employeeId === employeeId);
      if (!user) throw new Error("User not found");
      const workspaceUsersKey = `users_${workspaceId}`;
      let workspaceUsers = (await txtStore.getStrictSP<User[]>(workspaceUsersKey)) || [];
      // Check if user already exists in workspace
      const exists = workspaceUsers.some(u => u.employeeId === employeeId);
      if (!exists) {
        // Add user to workspace with the specified role
        const userForWorkspace = { ...user, workspaceAccess: [{ workspaceId, role }] };
        workspaceUsers.push(userForWorkspace);
        await txtStore.updateStrictSP(workspaceUsersKey, workspaceUsers);
      } else {
        // Update role if already exists
        workspaceUsers = workspaceUsers.map(u =>
          u.employeeId === employeeId
            ? { ...u, workspaceAccess: [{ workspaceId, role }] }
            : u
        );
        await txtStore.updateStrictSP(workspaceUsersKey, workspaceUsers);
      }
    }
  }

  async removeUserFromWorkspace(employeeId: string, workspaceId: string): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      const users = this.getUsersFromStorage();
      const userIndex = users.findIndex(user => user.employeeId === employeeId);
      if (userIndex === -1) throw new Error("User not found");
      const user = users[userIndex];
      user.workspaceAccess = user.workspaceAccess.filter(
        access => access.workspaceId !== workspaceId
      );
      this.saveUsersToStorage(users);
    } else {
      const workspaceUsersKey = `users_${workspaceId}`;
      let workspaceUsers = (await txtStore.getStrictSP<User[]>(workspaceUsersKey)) || [];
      workspaceUsers = workspaceUsers.filter(u => u.employeeId !== employeeId);
      await txtStore.updateStrictSP(workspaceUsersKey, workspaceUsers);
    }
  }

  // --- Access Requests (keep in localStorage for dev, txtStore for prod) ---
  async createAccessRequest(request: Omit<AccessRequest, "id" | "status" | "createdAt" | "updatedAt">): Promise<AccessRequest> {
    if (process.env.NODE_ENV === "development") {
      const requests = this.getAccessRequestsFromStorage();
      const newRequest: AccessRequest = {
        ...request,
        id: crypto.randomUUID(),
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      requests.push(newRequest);
      this.saveAccessRequestsToStorage(requests);
      return newRequest;
    } else {
      const requests = (await txtStore.getStrictSP<AccessRequest[]>(ACCESS_REQUESTS_KEY)) || [];
      const newRequest: AccessRequest = {
        ...request,
        id: crypto.randomUUID(),
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      requests.push(newRequest);
      await txtStore.updateStrictSP(ACCESS_REQUESTS_KEY, requests);
      return newRequest;
    }
  }

  async getAccessRequests(): Promise<AccessRequest[]> {
    if (process.env.NODE_ENV === "development") {
      return this.getAccessRequestsFromStorage();
    } else {
      return (await txtStore.getStrictSP<AccessRequest[]>(ACCESS_REQUESTS_KEY)) || [];
    }
  }

  async updateAccessRequestStatus(
    requestId: string,
    status: "approved" | "rejected",
    notes?: string
  ): Promise<AccessRequest> {
    if (process.env.NODE_ENV === "development") {
      const requests = this.getAccessRequestsFromStorage();
      const requestIndex = requests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) throw new Error("Access request not found");
      const request = requests[requestIndex];
      request.status = status;
      request.notes = notes;
      request.updatedAt = new Date().toISOString();
      if (status === "approved") {
        // Consistent logic: add user to workspace, create if not exists
        let user = this.getUsersFromStorage().find(u => u.employeeId === request.employeeId);
        let allUsers = this.getUsersFromStorage();
        if (user) {
          // Add workspace access if not present
          const hasAccess = user.workspaceAccess.some(
            wa => wa.workspaceId === request.requestedWorkspaceId
          );
          if (!hasAccess) {
            user.workspaceAccess.push({
              workspaceId: request.requestedWorkspaceId,
              role: "regular" as UserRole
            });
            allUsers = allUsers.map(u =>
              u.employeeId === user!.employeeId ? user! : u
            );
            this.saveUsersToStorage(allUsers);
          }
        } else {
          // Create new user with request details
          const newUser = {
            id: `user-${Date.now()}`,
            employeeId: request.employeeId,
            name: request.name,
            email: request.email,
            department: request.department,
            status: "active" as const,
            lastLogin: new Date().toLocaleString(),
            globalRole: "regular" as UserRole,
            workspaceAccess: [{ workspaceId: request.requestedWorkspaceId, role: "regular" as UserRole }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          allUsers.push(newUser);
          this.saveUsersToStorage(allUsers);
        }
      }
      this.saveAccessRequestsToStorage(requests);
      return request;
    } else {
      const requests = (await txtStore.getStrictSP<AccessRequest[]>(ACCESS_REQUESTS_KEY)) || [];
      const requestIndex = requests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) throw new Error("Access request not found");
      const request = requests[requestIndex];
      request.status = status;
      request.notes = notes;
      request.updatedAt = new Date().toISOString();
      if (status === "approved") {
        // Consistent logic: add user to workspace, create if not exists
        let allUsers = (await txtStore.getStrictSP<User[]>(USERS_KEY)) || [];
        let user = allUsers.find(u => u.employeeId === request.employeeId);
        if (user) {
          // Add workspace access if not present
          const hasAccess = user.workspaceAccess.some(
            wa => wa.workspaceId === request.requestedWorkspaceId
          );
          if (!hasAccess) {
            user.workspaceAccess.push({
              workspaceId: request.requestedWorkspaceId,
              role: "regular" as UserRole
            });
            allUsers = allUsers.map(u =>
              u.employeeId === user!.employeeId ? user! : u
            );
            await txtStore.updateStrictSP(USERS_KEY, allUsers);
          }
        } else {
          // Create new user with request details
          const newUser = {
            id: `user-${Date.now()}`,
            employeeId: request.employeeId,
            name: request.name,
            email: request.email,
            department: request.department,
            status: "active" as const,
            lastLogin: new Date().toLocaleString(),
            globalRole: "regular" as UserRole,
            workspaceAccess: [{ workspaceId: request.requestedWorkspaceId, role: "regular" as UserRole }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          allUsers.push(newUser);
          await txtStore.updateStrictSP(USERS_KEY, allUsers);
        }
      }
      await txtStore.updateStrictSP(ACCESS_REQUESTS_KEY, requests);
      return request;
    }
  }

  // Add this public method
  async updateAllUsers(users: User[]): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      this.saveUsersToStorage(users);
    } else {
      await txtStore.updateStrictSP(USERS_KEY, users);
    }
  }
}

export const userService = new UserService(); 