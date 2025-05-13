import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { userService } from "@/services/userService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AccessRequest } from "@/types";

export function AccessRequestList() {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadRequests();
  }, [currentWorkspace?.id]);

  const loadRequests = async () => {
    if (!currentWorkspace) return;
    try {
      const allRequests = await userService.getAccessRequests();
      const workspaceRequests = allRequests.filter(r => r.requestedWorkspaceId === currentWorkspace.id);
      setRequests(workspaceRequests);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: AccessRequest) => {
    try {
      await userService.updateAccessRequestStatus(request.id, "approved", notes);
      toast({
        title: "בקשה אושרה",
        description: "המשתמש נוסף למרחב העבודה בהצלחה"
      });
      setSelectedRequest(null);
      setNotes("");
      loadRequests();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (request: AccessRequest) => {
    try {
      await userService.updateAccessRequestStatus(request.id, "rejected", notes);
      toast({
        title: "בקשה נדחתה",
        description: "הבקשה נדחתה בהצלחה"
      });
      setSelectedRequest(null);
      setNotes("");
      loadRequests();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>בקשות גישה</CardTitle>
          <CardDescription>אין בקשות גישה ממתינות</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>בקשות גישה</CardTitle>
          <CardDescription>בקשות גישה ממתינות למרחב העבודה</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>מספר עובד</TableHead>
                <TableHead>דוא"ל</TableHead>
                <TableHead>מחלקה</TableHead>
                <TableHead>תאריך בקשה</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(request => (
                <TableRow key={request.id}>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.employeeId}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={request.status === "pending" ? "default" : request.status === "approved" ? "secondary" : "destructive"}>
                      {request.status === "pending" ? "ממתין" : request.status === "approved" ? "אושר" : "נדחה"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          צפה בפרטים
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedRequest && (
        <Card>
          <CardHeader>
            <CardTitle>טיפול בבקשה</CardTitle>
            <CardDescription>
              {selectedRequest.name} - {selectedRequest.employeeId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="הוסף הערות (אופציונלי)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setNotes("");
                }}
              >
                ביטול
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedRequest)}
              >
                דחה
              </Button>
              <Button
                onClick={() => handleApprove(selectedRequest)}
              >
                אשר
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 