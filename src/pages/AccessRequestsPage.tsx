import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { txtStore } from "@/services/txtStore";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  department: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  cardId: string;
}

export default function AccessRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const requestsList = await txtStore.getStrictSP("accessRequests");
      setRequests(requestsList || []);
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
        r.id === requestId ? { ...r, status: "approved" } : r
      );

      // Save changes
      await txtStore.updateStrictSP("accessRequests", updatedRequests);
      await txtStore.appendStrictSP("users", newUser);

      setRequests(updatedRequests);

      toast({
        title: "בקשה אושרה",
        description: "המשתמש נוסף למערכת בהצלחה",
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
      setRequests(updatedRequests);

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
      case "approved":
        return "default";
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
      case "approved":
        return "אושר";
      case "rejected":
        return "נדחה";
      default:
        return status;
    }
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
          <div className="h-[600px] overflow-y-auto">
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
                      {request.status === "pending" && (
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
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 