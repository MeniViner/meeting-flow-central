import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, MeetingRequest, RequestStatus, Document } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { txtStore, getCurrentUserCardId } from "@/services/txtStore";
import { useNavigate } from "react-router-dom";

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
  scheduleMeeting: (requestId: string, scheduledTime: Date) => Promise<void>;
  addMeetingSummary: (requestId: string, file: File, description: string) => Promise<void>;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load initial data and check user access
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await checkUserAccess();
        // Load other initial data here
        setRequests([]); // Replace with actual data loading
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const checkUserAccess = async () => {
    setIsLoading(true);
    try {
      const cardId = getCurrentUserCardId();
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
        description: `הבקשה ${status === "approved" ? "אושרה" : status === "rejected" ? "נדחתה" : "עודכנה"}`,
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

  const scheduleMeeting = async (requestId: string, scheduledTime: Date) => {
    setIsLoading(true);

    try {
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, scheduledTime, status: "scheduled" } 
            : req
        )
      );

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

  const addMeetingSummary = async (requestId: string, file: File, description: string) => {
    setIsLoading(true);

    try {
      const mockFileUrl = "https://example.com/meeting-summary.pdf";
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, summary: { fileUrl: mockFileUrl, description } } 
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
    devLoginAsAdmin: process.env.NODE_ENV === "development" ? devLoginAsAdmin : undefined,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}