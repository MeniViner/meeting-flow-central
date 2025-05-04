import { User } from "@/types/user";

const DEV_USERS_KEY = "dev_users";

export const devUserService = {
  async getUsers(): Promise<User[]> {
    const users = localStorage.getItem(DEV_USERS_KEY);
    if (!users) {
      // Initialize with a default admin user if none exist
      const defaultUser: User = {
        id: "user-1",
        name: "מנהל מערכת",
        email: "admin@example.com",
        role: "admin",
        workspaceId: "ws-1", // Default workspace ID
      };
      await this.saveUsers([defaultUser]);
      return [defaultUser];
    }
    return JSON.parse(users);
  },

  async saveUsers(users: User[]): Promise<void> {
    localStorage.setItem(DEV_USERS_KEY, JSON.stringify(users));
  },

  async addUser(user: Omit<User, "id">): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
    };
    await this.saveUsers([...users, newUser]);
    return newUser;
  },

  async updateUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const updatedUsers = users.map((u) =>
      u.id === user.id ? user : u
    );
    await this.saveUsers(updatedUsers);
  },

  async deleteUser(userId: string): Promise<void> {
    const users = await this.getUsers();
    const updatedUsers = users.filter((u) => u.id !== userId);
    await this.saveUsers(updatedUsers);
  },

  async getUsersByWorkspace(workspaceId: string): Promise<User[]> {
    const users = await this.getUsers();
    return users.filter(user => user.workspaceId === workspaceId);
  }
}; 