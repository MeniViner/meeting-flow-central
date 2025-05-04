import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, MeetingRequest, RequestStatus, Document } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { txtStore } from "@/services/txtStore";
import { useNavigate } from "react-router-dom";
import { WorkspaceProvider } from "./WorkspaceContext";

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
  checkUserAccess: () => Promise<void>;
  logout: () => void;
  submitRequest: (request: Omit<MeetingRequest, "id" | "createdAt" | "requesterId" | "requesterName" | "status">) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus, notes?: string) => Promise<void>;
  scheduleMeeting: (requestId: string, scheduledTime: Date, adminNotes?: string) => Promise<void>;
  addMeetingSummary: (requestId: string, file: File, description?: string) => Promise<void>;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  // Development only
  devLoginAsAdmin?: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Development admin user with full access
const DEV_ADMIN_USER: User = {
  id: "dev-admin",
  name: "מנהל מערכת",
  role: "admin",
  email: "admin@example.com",
  department: "מחלקת מערכות מידע",
  status: "active",
  lastLogin: new Date().toLocaleString(),
  cardId: "DEV-12345",
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load initial data and check user access
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await checkUserAccess();
        // Load meeting requests from storage
        let loadedRequests = await txtStore.getStrictSP("meetingRequests");
        if (!loadedRequests) loadedRequests = [];
        // Fix legacy/invalid statuses
        const cleanedRequests = loadedRequests.map(r => ({ ...r, status: fixStatus(r.status) }));
        // If any were fixed, save back to storage
        const needsSave = cleanedRequests.some((r, i) => r.status !== loadedRequests[i].status);
        if (needsSave) {
          await txtStore.updateStrictSP("meetingRequests", cleanedRequests);
        }
        setRequests(cleanedRequests);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

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

  const checkUserAccess = async () => {
    setIsLoading(true);
    try {
      const cardId = "DEV-12345"; // TODO: Replace with real card ID logic if needed
      const users = await txtStore.getStrictSP("users");
      
      const user = users.find((u: User) => u.cardId === cardId);
      
      if (user) {
        setUser(user);
        toast({
          title: "התחברת בהצלחה",
          description: `ברוך הבא, ${user.name}!`,
        });
      } else {
        setUser(null);
        // Redirect to landing page for unregistered users
        navigate("/landing");
      }
    } catch (error) {
      console.error("Error checking user access:", error);
      setUser(null);
      navigate("/landing");
    } finally {
      setIsLoading(false);
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

      setRequests(prev => [newRequest, ...prev]);
      
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
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status, adminNotes: notes || req.adminNotes } 
            : req
        )
      );

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
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, scheduledTime, status: "scheduled", adminNotes }
            : req
        )
      );
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
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                meetingSummaryFile: { 
                  name: fileName,
                  url: fileName,
                  type: file.type,
                  uploadedAt: new Date()
                }, 
                status: "completed" 
              } 
            : req
        )
      );

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

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    requests,
    isLoading,
    checkUserAccess,
    logout,
    submitRequest,
    updateRequestStatus,
    scheduleMeeting,
    addMeetingSummary,
    notifications,
    addNotification,
    devLoginAsAdmin: process.env.NODE_ENV === "development" ? devLoginAsAdmin : undefined,
  };

  return (
    <WorkspaceProvider>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </WorkspaceProvider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}