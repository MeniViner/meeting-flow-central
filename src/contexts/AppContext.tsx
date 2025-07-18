// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, MeetingRequest, RequestStatus, Document } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { txtStore } from "@/services/txtStore";
import { useNavigate } from "react-router-dom";
import { WorkspaceProvider, useWorkspace } from "./WorkspaceContext";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";

interface Notification {
  id: string;
  userId: string;
  message: string;
  requestName?: string;
  createdAt: Date;
  read?: boolean;
}

export interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  updateUser: (updatedUser: User) => void;
  updateUsers: (updatedUsers: User[]) => void;
  isLoading: boolean;
  requests: MeetingRequest[];
  setRequests: (requests: MeetingRequest[]) => void;
  isAuthenticated: boolean;
  logout: () => void;
  submitRequest: (request: Omit<MeetingRequest, "id" | "createdAt" | "requesterId" | "requesterName" | "status">) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus, notes?: string) => Promise<void>;
  scheduleMeeting: (requestId: string, scheduledTime: Date, scheduledEndTime: Date, adminNotes?: string) => Promise<void>;
  addMeetingSummary: (requestId: string, file: File, description?: string) => Promise<void>;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  // Development only
  devLoginAsAdmin?: () => void;
  updateRequest: (requestId: string, updatedRequest: MeetingRequest) => Promise<MeetingRequest>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Development admin user with full access
const DEV_ADMIN_USER: User = {
  id: "dev-admin",
  employeeId: "DEV-12345",
  spsClaimId: "dev-admin-claim",
  name: "מנהל מערכת",
  globalRole: "owner",
  email: "admin@example.com",
  department: "מחלקת מערכות מידע",
  status: "active",
  lastLogin: new Date().toISOString(),
  workspaceAccess: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Helper to fix legacy/invalid statuses
const fixStatus = (status: string): RequestStatus => {
  if (["pending", "scheduled", "ended", "completed", "rejected"].includes(status)) {
    return status as RequestStatus;
  }
  if (status === "approved") return "scheduled";
  // Add more mappings if needed
  return "pending";
};

const fixRequestDates = (request: any): MeetingRequest => {
  const fixed = { ...request };
  const dateFields: (keyof MeetingRequest)[] = ['createdAt', 'deadline', 'scheduledTime', 'scheduledEndTime'];
  
  dateFields.forEach(field => {
    if (fixed[field] && typeof fixed[field] !== 'string') {
      try {
        fixed[field] = new Date(fixed[field]).toISOString();
      } catch (e) {
        console.error(`Could not convert date for field ${field}`, fixed[field]);
      }
    }
  });

  if (fixed.documents && Array.isArray(fixed.documents)) {
    fixed.documents = fixed.documents.map((doc: any) => {
      if (doc.uploadedAt && typeof doc.uploadedAt !== 'string') {
        return { ...doc, uploadedAt: new Date(doc.uploadedAt).toISOString() };
      }
      return doc;
    });
  }

  if (fixed.meetingSummaryFile?.uploadedAt && typeof fixed.meetingSummaryFile.uploadedAt !== 'string') {
    fixed.meetingSummaryFile.uploadedAt = new Date(fixed.meetingSummaryFile.uploadedAt).toISOString();
  }

  return fixed as MeetingRequest;
}

// Helper function to get card ID (mock for development)
const getCardId = async (): Promise<string | null> => {
  // In development, return a mock card ID
  if (process.env.NODE_ENV === "development") {
    return "DEV-12345";
  }
  
  try {
    // Get current user info from SharePoint
    const currentUserInfo = await authService.getCurrentUser();
    console.log("Current user info from SharePoint:", currentUserInfo);
    
    if (!currentUserInfo) {
      console.log("No user info from SharePoint");
      return null;
    }
    
    // Try to get user from our system
    const user = await userService.getUserBySPSClaimId(currentUserInfo.spsClaimId);
    console.log("User from system:", user);
    
    if (!user) {
      console.log("User not found in system, redirecting to landing page");
      return null;
    }
    
    return user.employeeId;
  } catch (error) {
    console.error("Error getting card ID:", error);
    return null;
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  // Update a single user
  const updateUser = (updatedUser: User) => {
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
  };

  // Update multiple users
  const updateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Load current user
        const currentUser = await userService.getCurrentUser();
        if (process.env.NODE_ENV === "development" && !currentUser) {
          setUser(DEV_ADMIN_USER);
        } else {
          setUser(currentUser);
        }

        // Load all users
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers);

        // Load meeting requests if user has access to current workspace
        if (currentWorkspace) {
          console.log("AppContext.loadInitialData: Loading workspace data for:", currentWorkspace.id);
          const userRole = process.env.NODE_ENV === "development" 
            ? "owner" 
            : user?.workspaceAccess.find(access => access.workspaceId === currentWorkspace.id)?.role || null;
          
          console.log("AppContext.loadInitialData: User role in workspace:", userRole);

          if (userRole) {
            const loadedRequests = await txtStore.getStrictSP<any[]>("meetingRequests", currentWorkspace.id) || [];
            const cleanedRequests = loadedRequests.map(r => ({ ...fixRequestDates(r), status: fixStatus(r.status) }));
            
            const needsSave = JSON.stringify(loadedRequests) !== JSON.stringify(cleanedRequests);

            if (needsSave) {
              await txtStore.updateStrictSP("meetingRequests", cleanedRequests, currentWorkspace.id);
            }
            setRequests(cleanedRequests);
          }
        }
      } catch (error) {
        console.error("AppContext.loadInitialData: Error loading initial data:", error);
        toast({
          title: "שגיאה",
          description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [currentWorkspace?.id]);

  // Automatically move scheduled requests to 'ended' after meeting date
  useEffect(() => {
    const interval = setInterval(() => {
      setRequests(prev => prev.map(req => {
        // If meeting time has passed and not completed/rejected, set to 'ended'
        if (
          req.status === "scheduled" &&
          req.scheduledTime &&
          new Date(req.scheduledTime) < new Date()
        ) {
          return { ...req, status: "ended" };
        }
        // If already ended, check if 2 days passed and no summary file, set warning
        if (
          req.status === "ended" &&
          req.scheduledTime &&
          !req.summaryReminderSent &&
          !req.meetingSummaryFile &&
          (new Date().getTime() - new Date(req.scheduledTime).getTime() > 2 * 24 * 60 * 60 * 1000)
        ) {
          return { ...req, summaryReminderSent: true };
        }
        return req;
      }));
    }, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const devLoginAsAdmin = () => {
    setUser(DEV_ADMIN_USER);
    navigate("/");
  };

  const logout = () => {
    setUser(null);
    navigate("/landing");
    toast({
      title: "התנתקת",
      description: "התנתקת בהצלחה",
    });
  };

  const submitRequest = async (requestData: Omit<MeetingRequest, "id" | "createdAt" | "requesterId" | "requesterName" | "status">) => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "עליך להתחבר כדי להגיש בקשה",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newRequest: MeetingRequest = {
        id: `req-${Date.now()}`,
        ...requestData,
        requesterId: user.id,
        requesterName: user.name,
        status: "pending",
        createdAt: new Date().toISOString(),
        documents: requestData.documents.map(doc => ({
          ...doc,
          url: doc.name // Store only the file name
        }))
      };

      // Update state
      setRequests(prev => [newRequest, ...prev]);
      
      // Persist to storage
      await txtStore.appendStrictSP("meetingRequests", newRequest, currentWorkspace?.id);
      
      toast({
        title: "הבקשה הוגשה",
        description: "בקשת הפגישה שלך הוגשה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "ההגשה נכשלה",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: RequestStatus, notes?: string) => {
    setIsLoading(true);

    try {
      // Update state
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { ...req, status, adminNotes: notes || req.adminNotes } 
          : req
      );
      setRequests(updatedRequests);

      // Persist to storage
      await txtStore.updateStrictSP("meetingRequests", updatedRequests, currentWorkspace?.id);

      toast({
        title: "הסטטוס עודכן",
        description: `הבקשה ${status === "rejected" ? "נדחתה" : status === "scheduled" ? "תוזמנה" : status === "ended" ? "הסתיימה" : status === "completed" ? "הושלמה" : "עודכנה"}`,
      });
    } catch (error) {
      toast({
        title: "העדכון נכשל",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: `notif-${Date.now()}`,
        createdAt: new Date(),
        read: false,
      },
      ...prev,
    ]);
  };

  const scheduleMeeting = async (requestId: string, scheduledTime: Date, scheduledEndTime: Date, adminNotes?: string) => {
    setIsLoading(true);
    try {
      setRequests(prev => {
        const updatedRequests = prev.map(r =>
          r.id === requestId
            ? {
                ...r,
                status: "scheduled" as RequestStatus,
                scheduledTime: scheduledTime.toISOString(),
                scheduledEndTime: scheduledEndTime.toISOString(),
                adminNotes,
              }
            : r
        );
        txtStore.updateStrictSP("meetingRequests", updatedRequests, currentWorkspace.id);
        return updatedRequests;
      });

      toast({
        title: "הפגישה נקבעה",
        description: "הפגישה נקבעה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "קביעת הפגישה נכשלה",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addMeetingSummary = async (requestId: string, file: File, description?: string) => {
    setIsLoading(true);

    try {
      // Store only the file name
      const fileName = file.name;
      const fileType = file.type || "text/plain"; // Default to text/plain for text-only entries
      
      // Update state
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              meetingSummaryFile: { 
                name: fileName,
                url: fileName,
                type: fileType,
                uploadedAt: new Date().toISOString()
              }, 
              status: "completed" as RequestStatus
            } 
          : req
      );
      setRequests(updatedRequests);

      // Persist to storage
      await txtStore.updateStrictSP("meetingRequests", updatedRequests, currentWorkspace?.id);

      toast({
        title: "סיכום הפגישה נוסף",
        description: "סיכום הפגישה נוסף בהצלחה",
      });
    } catch (error) {
      toast({
        title: "הוספת הסיכום נכשלה",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequest = async (requestId: string, updatedRequest: MeetingRequest) => {
    try {
      // In both development and production, update the request in TXT
      const requests = await txtStore.getStrictSP<MeetingRequest[]>("meetingRequests", currentWorkspace?.id) || [];
      const updatedRequests = requests.map(r => 
        r.id === requestId ? updatedRequest : r
      );
      await txtStore.updateStrictSP("meetingRequests", updatedRequests, currentWorkspace?.id);

      // Update local state
      setRequests(prev => prev.map(r => 
        r.id === requestId ? updatedRequest : r
      ));

      return updatedRequest;
    } catch (error) {
      console.error("Error updating request:", error);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    users,
    setUsers,
    updateUser,
    updateUsers,
    isLoading,
    requests,
    setRequests,
    isAuthenticated: !!user,
    logout,
    submitRequest,
    updateRequestStatus,
    scheduleMeeting,
    addMeetingSummary,
    notifications,
    addNotification,
    devLoginAsAdmin: process.env.NODE_ENV === "development" ? devLoginAsAdmin : undefined,
    updateRequest,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}