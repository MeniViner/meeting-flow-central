import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { txtStore } from "@/services/txtStore";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  department: string;
  reason: string;
  status: "pending" | "scheduled" | "ended" | "completed" | "rejected";
  createdAt: Date;
  cardId: string;
  requestedWorkspaceId?: string;
}

export default function AccessRequestsPage() {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [currentWorkspace?.id]);

  const loadRequests = async () => {
    try {
      const requestsList = await txtStore.getStrictSP("accessRequests") as AccessRequest[];
      // Filter by current workspace
      const filtered = currentWorkspace
        ? (requestsList || []).filter((r: AccessRequest) => r.requestedWorkspaceId === currentWorkspace.id)
        : [];
      setRequests(filtered);
    } catch (error) {
      console.error("Error loading access requests:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת בקשות הגישה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Create new user from request
      const newUser = {
        id: `user-${Date.now()}`,
        name: request.name,
        email: request.email,
        role: "viewer" as const,
        status: "active" as const,
        lastLogin: new Date().toLocaleString(),
        cardId: request.cardId,
        department: request.department,
      };

      // Update request status
      const updatedRequests = requests.map(r =>
        r.id === requestId ? { ...r, status: "scheduled" } : r
      );

      // Save changes
      await txtStore.updateStrictSP("accessRequests", updatedRequests);
      await txtStore.appendStrictSP("users", newUser);

      setRequests(updatedRequests.map(r => ({ ...r, status: fixStatus(r.status) })));

      toast({
        title: "בקשה אושרה",
        description: "הבקשה תוזמנה והמשתמש נוסף למערכת בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה באישור הבקשה",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const updatedRequests = requests.map(r =>
        r.id === requestId ? { ...r, status: "rejected" } : r
      );

      await txtStore.updateStrictSP("accessRequests", updatedRequests);
      setRequests(updatedRequests.map(r => ({ ...r, status: fixStatus(r.status) })));

      toast({
        title: "בקשה נדחתה",
        description: "בקשת הגישה נדחתה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בדחיית הבקשה",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: AccessRequest["status"]) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "scheduled":
        return "secondary";
      case "ended":
        return "secondary";
      case "completed":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: AccessRequest["status"]) => {
    switch (status) {
      case "pending":
        return "ממתין";
      case "scheduled":
        return "מתוכננת";
      case "ended":
        return "הסתיימה";
      case "completed":
        return "הושלמה";
      case "rejected":
        return "נדחה";
      default:
        return status;
    }
  };

  const fixStatus = (status: string): AccessRequest["status"] => {
    if (["pending", "scheduled", "ended", "completed", "rejected"].includes(status)) {
      return status as AccessRequest["status"];
    }
    return "pending";
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">בקשות גישה</h1>
        <p className="text-muted-foreground">
          ניהול בקשות גישה למערכת
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>בקשות גישה</CardTitle>
            <CardDescription>
              רשימת כל בקשות הגישה למערכת
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                <Users className="w-10 h-10 mb-2 text-gray-400" />
                <p className="text-lg font-medium">אין בקשות גישה למרחב זה</p>
                <p className="text-sm mt-1">לא נמצאו בקשות גישה עבור מרחב העבודה הנוכחי</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>אימייל</TableHead>
                    <TableHead>מחלקה</TableHead>
                    <TableHead>מספר כרטיס</TableHead>
                    <TableHead>סיבת הבקשה</TableHead>
                    <TableHead>תאריך בקשה</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.name}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.department}</TableCell>
                      <TableCell>{request.cardId}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>
                        {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", { locale: he })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(request.status === "pending") ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              אישור
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              דחייה
                            </Button>
                          </div>
                        ) : (
                        
                            <div >
                            משתמש זה נוסף למערכת
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 