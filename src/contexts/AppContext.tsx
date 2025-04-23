import React, { createContext, useContext, useState, useEffect } from "react";
import { User, MeetingRequest, RequestStatus, Document } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface AppContextType {
  currentUser: User | null;
  requests: MeetingRequest[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  submitRequest: (request: Omit<MeetingRequest, "id" | "createdAt" | "requesterId" | "requesterName" | "status">) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus, notes?: string) => Promise<void>;
  scheduleMeeting: (requestId: string, scheduledTime: Date) => Promise<void>;
  addMeetingSummary: (requestId: string, file: File, description: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data for development
const MOCK_USERS: User[] = [
  { id: "1", name: "ישראל ישראלי", email: "israel@example.com", role: "user" },
  { id: "2", name: "שרה כהן", email: "sarah@example.com", role: "admin" },
];

const MOCK_REQUESTS: MeetingRequest[] = [
  {
    id: "1",
    title: "סקירת תקציב רבעונית",
    description: "סקירת הקצבות תקציב Q2 ותכנון Q3",
    requesterId: "1",
    requesterName: "ישראל ישראלי",
    documents: [
      { 
        id: "doc1", 
        name: "דוח תקציב Q2.pdf", 
        url: "#", 
        type: "application/pdf", 
        uploadedAt: new Date(2023, 3, 15) 
      }
    ],
    deadline: new Date(2023, 5, 30),
    status: "pending",
    createdAt: new Date(2023, 3, 15),
  },
  {
    id: "2",
    title: "דיון על קמפיין שיווקי",
    description: "דיון על קמפיין השקה של המוצר",
    requesterId: "1",
    requesterName: "ישראל ישראלי",
    documents: [
      { 
        id: "doc2", 
        name: "מתאר קמפיין.docx", 
        url: "#", 
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
        uploadedAt: new Date(2023, 3, 18) 
      }
    ],
    deadline: new Date(2023, 4, 15),
    status: "approved",
    createdAt: new Date(2023, 3, 18),
    adminNotes: "אושר. אנא הכין שקופיות מצגת.",
  },
  {
    id: "3",
    title: "פגישת פיתוח מוצר",
    description: "דיון על לוח זמנים ליישום תכונה חדשה",
    requesterId: "1",
    requesterName: "ישראל ישראלי",
    documents: [
      { 
        id: "doc3", 
        name: "מפרט תכונות.xlsx", 
        url: "#", 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        uploadedAt: new Date(2023, 3, 20) 
      }
    ],
    deadline: new Date(2023, 4, 10),
    status: "scheduled",
    createdAt: new Date(2023, 3, 20),
    scheduledTime: new Date(2023, 4, 5, 14, 0),
  },
  {
    id: "4",
    title: "תכנון אירוע גיבוש צוות",
    description: "דיון על אפשרויות לפעילויות גיבוש צוות",
    requesterId: "1",
    requesterName: "ישראל ישראלי",
    documents: [],
    deadline: new Date(2023, 5, 15),
    status: "completed",
    createdAt: new Date(2023, 3, 22),
    scheduledTime: new Date(2023, 4, 1, 10, 0),
    meetingSummaryDescription: "הוחלט על פעילויות הרפתקאות בחוץ לגיבוש צוות. התקציב אושר.",
    meetingSummaryFile: {
      name: "סיכום פגישת גיבוש צוות.pdf",
      url: "https://example.com/files/summary.pdf",
      type: "application/pdf"
    }
  },
  {
    id: "5",
    title: "דיון על עדכון מדיניות משאבי אנוש",
    description: "סקירת שינויים מוצעים במדיניות עבודה מרחוק",
    requesterId: "1",
    requesterName: "ישראל ישראלי",
    documents: [
      { 
        id: "doc4", 
        name: "טיוטת מדיניות.pdf", 
        url: "#", 
        type: "application/pdf", 
        uploadedAt: new Date(2023, 3, 25) 
      }
    ],
    deadline: new Date(2023, 4, 20),
    status: "rejected",
    createdAt: new Date(2023, 3, 25),
    adminNotes: "דרושים פרטים נוספים על תכנית היישום. אנא הגש מחדש.",
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Simulate initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For development, auto-login as admin
      setCurrentUser(MOCK_USERS[1]);
      setRequests(MOCK_REQUESTS);
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user && password === "password") { // Mock password check
        setCurrentUser(user);
        setRequests(MOCK_REQUESTS);
        toast({
          title: "התחברת בהצלחה",
          description: `ברוך הבא, ${user.name}!`,
        });
      } else {
        throw new Error("פרטי התחברות לא תקינים");
      }
    } catch (error) {
      toast({
        title: "ההתחברות נכשלה",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setRequests([]);
    toast({
      title: "התנתקת",
      description: "התנתקת בהצלחה",
    });
  };

  const submitRequest = async (requestData: Omit<MeetingRequest, "id" | "createdAt" | "requesterId" | "requesterName" | "status">) => {
    if (!currentUser) {
      toast({
        title: "שגיאה",
        description: "עליך להתחבר כדי להגיש בקשה",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newRequest: MeetingRequest = {
        id: `req-${Date.now()}`,
        ...requestData,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real application, you would upload the file to a storage service
      // and get back a URL. For this example, we'll create a mock URL
      const mockFileUrl = `https://example.com/files/${file.name}`;

      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                meetingSummaryDescription: description,
                meetingSummaryFile: {
                  name: file.name,
                  url: mockFileUrl,
                  type: file.type
                },
                status: "completed" 
              } 
            : req
        )
      );

      toast({
        title: "הסיכום נוסף",
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
    currentUser,
    requests,
    isLoading,
    login,
    logout,
    submitRequest,
    updateRequestStatus,
    scheduleMeeting,
    addMeetingSummary,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp חייב להיות בשימוש בתוך AppProvider");
  }
  return context;
};
