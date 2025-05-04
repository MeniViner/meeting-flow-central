import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/user";
import { txtStore } from "@/services/txtStore";
import { devUserService } from "@/services/devUserService";
import { useWorkspace } from "./WorkspaceContext";

interface UserContextType {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  addUser: (user: Omit<User, "id">) => Promise<User>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (currentWorkspace) {
      loadUsers();
    }
  }, [currentWorkspace]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      let loadedUsers: User[] = [];

      if (process.env.NODE_ENV === "development") {
        loadedUsers = await devUserService.getUsersByWorkspace(currentWorkspace!.id);
      } else {
        const workspaceUsersKey = `users_${currentWorkspace!.id}`;
        loadedUsers = await txtStore.getStrictSP<User[]>(workspaceUsersKey) || [];
      }

      setUsers(loadedUsers);

      // Set current user from localStorage if exists
      const savedUserId = localStorage.getItem("currentUserId");
      if (savedUserId) {
        const savedUser = loadedUsers.find(u => u.id === savedUserId);
        if (savedUser) {
          setCurrentUser(savedUser);
        }
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (user: Omit<User, "id">) => {
    if (!currentWorkspace) throw new Error("No workspace selected");

    let newUser: User;
    
    if (process.env.NODE_ENV === "development") {
      newUser = await devUserService.addUser({
        ...user,
        workspaceId: currentWorkspace.id,
      });
    } else {
      newUser = {
        ...user,
        id: `user-${Date.now()}`,
        workspaceId: currentWorkspace.id,
      };
      const workspaceUsersKey = `users_${currentWorkspace.id}`;
      const currentUsers = await txtStore.getStrictSP<User[]>(workspaceUsersKey) || [];
      await txtStore.updateStrictSP(workspaceUsersKey, [...currentUsers, newUser]);
    }

    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const handleUpdateUser = async (user: User) => {
    if (!currentWorkspace) throw new Error("No workspace selected");

    if (process.env.NODE_ENV === "development") {
      await devUserService.updateUser(user);
    } else {
      const workspaceUsersKey = `users_${currentWorkspace.id}`;
      const currentUsers = await txtStore.getStrictSP<User[]>(workspaceUsersKey) || [];
      const updatedUsers = currentUsers.map(u => u.id === user.id ? user : u);
      await txtStore.updateStrictSP(workspaceUsersKey, updatedUsers);
    }

    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentWorkspace) throw new Error("No workspace selected");

    if (process.env.NODE_ENV === "development") {
      await devUserService.deleteUser(userId);
    } else {
      const workspaceUsersKey = `users_${currentWorkspace.id}`;
      const currentUsers = await txtStore.getStrictSP<User[]>(workspaceUsersKey) || [];
      const updatedUsers = currentUsers.filter(u => u.id !== userId);
      await txtStore.updateStrictSP(workspaceUsersKey, updatedUsers);
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    
    // If the deleted user was the current one, clear the current user
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      localStorage.removeItem("currentUserId");
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        isLoading,
        addUser: handleAddUser,
        updateUser: handleUpdateUser,
        deleteUser: handleDeleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
} 