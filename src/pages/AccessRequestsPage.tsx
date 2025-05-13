import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { userService } from "@/services/userService";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";
import { motion } from "framer-motion"

interface AccessRequest {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  requestedWorkspaceId: string;
  reason: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function AccessRequestsPage() {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processedRequests, setProcessedRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRequests();
  }, [currentWorkspace?.id]);

  const loadRequests = async () => {
    try {
      const allRequests = await userService.getAccessRequests();
      // Filter by current workspace
      const filtered = currentWorkspace
        ? (allRequests || []).filter((r: AccessRequest) => r.requestedWorkspaceId === currentWorkspace.id)
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
      await userService.updateAccessRequestStatus(requestId, "approved");
      setProcessedRequests(prev => new Set([...prev, requestId]));
      await loadRequests();
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
      await userService.updateAccessRequestStatus(requestId, "rejected");
      setProcessedRequests(prev => new Set([...prev, requestId]));
      await loadRequests();
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

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">בקשות גישה</h1>
        <p className="text-muted-foreground">
          ניהול בקשות גישה למערכת
        </p>
      </div> */}

      <Card className="min-h-[57access0px]">
        <CardHeader>
          <div>
            <CardTitle>בקשות גישה</CardTitle>
            <CardDescription>
              רשימת כל בקשות הגישה למערכת
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div >
            <div className="w-full">
              {requests.length === 0 ? (
                <div className="rounded-md border flex items-center justify-center min-h-[400px] px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center"
                  >
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                      <Users className="w-10 h-10 mb-2 text-gray-400" />
                      <p className="text-lg font-medium">אין בקשות גישה למרחב זה</p>
                      <p className="text-sm mt-1">לא נמצאו בקשות גישה עבור מרחב העבודה הנוכחי</p>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <ScrollArea className="h-[450px] w-full" dir="rtl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>שם</TableHead>
                        <TableHead>אימייל</TableHead>
                        <TableHead>מחלקה</TableHead>
                        <TableHead>מספר עובד</TableHead>
                        <TableHead>סיבת הבקשה</TableHead>
                        <TableHead>תאריך בקשה</TableHead>
                        <TableHead>פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.name}</TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell>{request.department}</TableCell>
                          <TableCell>{request.employeeId}</TableCell>
                          <TableCell>{request.reason}</TableCell>
                          <TableCell>
                            {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", { locale: he })}
                          </TableCell>
                          <TableCell>
                            {!processedRequests.has(request.id) && (
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
                </ScrollArea>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 