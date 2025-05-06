import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, MeetingRequest, RequestStatus, Document } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { txtStore } from "@/services/txtStore";
import { useNavigate } from "react-router-dom";
import { WorkspaceProvider, useWorkspace } from "./WorkspaceContext";
import { userService } from "@/services/userService";
import { devMeetingService } from "@/services/devMeetingService";

interface Notification {
  id: string;
  userId: string;
  message: string;
  createdAt: Date;
  read?: boolean;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  requests: MeetingRequest[];
  isLoading: boolean;
  logout: () => void;
  submitRequest: (request: Omit<MeetingRequest, "id" | "createdAt" | "requesterId" | "requesterName" | "status">) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus, notes?: string) => Promise<void>;
  scheduleMeeting: (requestId: string, scheduledTime: Date, adminNotes?: string) => Promise<void>;
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

// Helper function to get card ID (mock for development)
const getCardId = async (): Promise<string | null> => {
  // In development, return a mock card ID
  if (process.env.NODE_ENV === "development") {
    return "DEV-12345";
  }
  // In production, implement actual card reading logic
  // TODO: Implement actual card reading logic
  return null;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { currentWorkspace } = useWorkspace();

  // Check user access and load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (process.env.NODE_ENV === "development") {
          // In development, always use admin user
          setUser(DEV_ADMIN_USER);
        } else {
          // In production, check employee ID
          const employeeId = await getEmployeeId();
          if (!employeeId) {
            // No employee ID found, show landing page
            navigate("/landing");
            return;
          }

          // Check if user exists
          const user = await userService.getUserByEmployeeId(employeeId);
          if (!user) {
            // User doesn't exist, show landing page
            navigate("/landing");
            return;
          }

          // Update last login
          await userService.upsertUser({
            employeeId,
            lastLogin: new Date().toISOString()
          });

          setUser(user);
        }

        // Load meeting requests if user has access to current workspace
        if (currentWorkspace) {
          const userRole = process.env.NODE_ENV === "development" 
            ? "owner" 
            : await userService.getUserWorkspaceRole(user?.employeeId || "", currentWorkspace.id);

          if (userRole) {
            const loadedRequests = await txtStore.getStrictSP<MeetingRequest[]>("meetingRequests", currentWorkspace.id) || [];
            const cleanedRequests = loadedRequests.map(r => ({ ...r, status: fixStatus(r.status) }));
            const needsSave = cleanedRequests.some((r, i) => r.status !== loadedRequests[i].status);
            if (needsSave) {
              await txtStore.updateStrictSP("meetingRequests", cleanedRequests, currentWorkspace.id);
            }
            setRequests(cleanedRequests);
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
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

  // Helper function to get employee ID (mock for development)
  const getEmployeeId = async (): Promise<string | null> => {
    if (process.env.NODE_ENV === "development") {
      return "DEV-12345";
    }
    // TODO: Implement actual employee ID reading logic
    return null;
  };

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

  const checkUserAccess = async (): Promise<void> => {
    try {
      const employeeId = await getEmployeeId();
      if (!employeeId) {
        throw new Error("לא נמצא מזהה עובד");
      }

      // Load users from storage
      const user = await userService.getUserByEmployeeId(employeeId);
      if (!user) {
        throw new Error("אין לך הרשאה לגשת למערכת");
      }

      setUser(user);
    } catch (error) {
      console.error("Error checking user access:", error);
      toast({
        title: "שגיאת התחברות",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive",
      });
      navigate("/landing");
      throw error;
    }
  };

  const devLoginAsAdmin = () => {
    setUser(DEV_ADMIN_USER);
    toast({
      title: "התחברת כמנהל מערכת",
      description: "ברוך הבא, מנהל מערכת!",
    });
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
        createdAt: new Date(),
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

  const scheduleMeeting = async (requestId: string, scheduledTime: Date, adminNotes?: string) => {
    setIsLoading(true);
    try {
      // Update state
      const updatedRequests = requests.map(req =>
        req.id === requestId
          ? { ...req, scheduledTime, status: "scheduled" as RequestStatus, adminNotes }
          : req
      );
      setRequests(updatedRequests);

      // Persist to storage
      await txtStore.updateStrictSP("meetingRequests", updatedRequests, currentWorkspace?.id);

      // Notify user
      if (user) {
        addNotification({
          userId: user.id,
          message: "הפגישה שלך תוזמנה. בדוק את פרטי הבקשה.",
        });
      }
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
      
      // Update state
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              meetingSummaryFile: { 
                name: fileName,
                url: fileName,
                type: file.type,
                uploadedAt: new Date()
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
    isAuthenticated: !!user,
    requests,
    isLoading,
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