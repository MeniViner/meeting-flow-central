
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
  addMeetingSummary: (requestId: string, summary: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data for development
const MOCK_USERS: User[] = [
  { id: "1", name: "John Smith", email: "john@example.com", role: "user" },
  { id: "2", name: "Jane Doe", email: "jane@example.com", role: "admin" },
];

const MOCK_REQUESTS: MeetingRequest[] = [
  {
    id: "1",
    title: "Quarterly Budget Review",
    description: "Review Q2 budget allocations and plan for Q3",
    requesterId: "1",
    requesterName: "John Smith",
    documents: [
      { 
        id: "doc1", 
        name: "Q2 Budget Report.pdf", 
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
    title: "Marketing Campaign Discussion",
    description: "Discuss upcoming product launch campaign",
    requesterId: "1",
    requesterName: "John Smith",
    documents: [
      { 
        id: "doc2", 
        name: "Campaign Outline.docx", 
        url: "#", 
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
        uploadedAt: new Date(2023, 3, 18) 
      }
    ],
    deadline: new Date(2023, 4, 15),
    status: "approved",
    createdAt: new Date(2023, 3, 18),
    adminNotes: "Approved. Please prepare presentation slides.",
  },
  {
    id: "3",
    title: "Product Development Meeting",
    description: "Discuss new feature implementation timeline",
    requesterId: "1",
    requesterName: "John Smith",
    documents: [
      { 
        id: "doc3", 
        name: "Feature Specs.xlsx", 
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
    title: "Team Building Event Planning",
    description: "Discuss options for team-building activities",
    requesterId: "1",
    requesterName: "John Smith",
    documents: [],
    deadline: new Date(2023, 5, 15),
    status: "completed",
    createdAt: new Date(2023, 3, 22),
    scheduledTime: new Date(2023, 4, 1, 10, 0),
    meetingSummary: "Decided on outdoor adventure activities for team building. Budget approved.",
  },
  {
    id: "5",
    title: "HR Policy Update Discussion",
    description: "Review proposed changes to remote work policy",
    requesterId: "1",
    requesterName: "John Smith",
    documents: [
      { 
        id: "doc4", 
        name: "Policy Draft.pdf", 
        url: "#", 
        type: "application/pdf", 
        uploadedAt: new Date(2023, 3, 25) 
      }
    ],
    deadline: new Date(2023, 4, 20),
    status: "rejected",
    createdAt: new Date(2023, 3, 25),
    adminNotes: "Need more details on implementation plan. Please resubmit.",
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
          title: "Logged in successfully",
          description: `Welcome back, ${user.name}!`,
        });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const submitRequest = async (requestData: Omit<MeetingRequest, "id" | "createdAt" | "requesterId" | "requesterName" | "status">) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a request",
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
        title: "Request submitted",
        description: "Your meeting request has been submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
        title: "Status updated",
        description: `Request has been ${status}`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
        title: "Meeting scheduled",
        description: `Meeting has been scheduled successfully`,
      });
    } catch (error) {
      toast({
        title: "Scheduling failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addMeetingSummary = async (requestId: string, summary: string) => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, meetingSummary: summary, status: "completed" } 
            : req
        )
      );

      toast({
        title: "Summary added",
        description: "Meeting summary has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to add summary",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
