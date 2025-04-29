import { useApp } from "@/contexts/AppContext";
import { AdminRequestList } from "@/components/admin/AdminRequestList";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { DateDisplay } from "@/components/DateDisplay";
import { RequestStatus } from "@/types";
import { Clock, AlertTriangle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { requests, user } = useApp();
  
  // Allow access in development mode or if user is admin
  const isAdmin = process.env.NODE_ENV === "development" || user?.role === "admin";
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">אין גישה</h1>
          <p className="text-muted-foreground">
            אין לך הרשאה לצפות בלוח הבקרה
          </p>
        </div>
      </div>
    );
  }
  
  // Group requests by status
  const pendingRequests = requests.filter(r => r.status === "pending");
  const scheduledRequests = requests.filter(r => r.status === "scheduled");
  const endedRequests = requests.filter(r => r.status === "ended");
  
  // Find upcoming deadlines
  const upcomingDeadlines = [...requests]
    .filter(r => r.status !== "completed" && r.status !== "rejected")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);
  
  // Find upcoming meetings
  const upcomingMeetings = [...requests]
    .filter(r => r.status === "scheduled" && r.scheduledTime && new Date(r.scheduledTime) > new Date())
    .sort((a, b) => new Date(a.scheduledTime!).getTime() - new Date(b.scheduledTime!).getTime())
    .slice(0, 5);

  const statusCounts: Record<RequestStatus, number> = {
    pending: pendingRequests.length,
    scheduled: scheduledRequests.length,
    ended: endedRequests.length,
    completed: requests.filter(r => r.status === "completed").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">לוח בקרה</h1>
        <p className="text-muted-foreground">
          ניהול בקשות פגישה
        </p>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="requests">כל הבקשות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Card key={status}>
                <CardHeader className="pb-2">
                  <RequestStatusBadge 
                    status={status as RequestStatus} 
                    className="w-fit"
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {status === "pending" ? "ממתינות" :
                     status === "scheduled" ? "מתוזמנות" :
                     status === "ended" ? "הסתיימו (ממתינות לסיכום)" :
                     status === "completed" ? "הושלמו" :
                     "נדחו"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                  <span>מועדים קרובים</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-muted-foreground">אין מועדים קרובים</p>
                ) : (
                  <ul className="space-y-4">
                    {upcomingDeadlines.map((request) => (
                      <li key={request.id} className="flex items-start space-x-4">
                        <div className="min-w-[100px]">
                          <DateDisplay 
                            date={request.deadline} 
                            className={cn(
                              "font-medium",
                              new Date(request.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
                                ? "text-red-500"
                                : ""
                            )} 
                          />
                        </div>
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            מבקש: {request.requesterName}
                          </p>
                          <div className="mt-1">
                            <RequestStatusBadge status={request.status} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
                  <span>פגישות קרובות</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMeetings.length === 0 ? (
                  <p className="text-muted-foreground">אין פגישות קרובות</p>
                ) : (
                  <ul className="space-y-4">
                    {upcomingMeetings.map((request) => (
                      <li key={request.id} className="flex items-start space-x-4">
                        <div className="min-w-[130px]">
                          <DateDisplay 
                            date={request.scheduledTime!} 
                            className="font-medium"
                            showTime
                          />
                        </div>
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            מבקש: {request.requesterName}
                          </p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              מועד אחרון: <DateDisplay date={request.deadline} />
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>בקשות אחרונות</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminRequestList 
                requests={[...requests]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)} 
              />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                מציג 5 בקשות אחרונות. צפה בכל הבקשות בלשונית הבקשות.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="requests">
          <AdminRequestList requests={requests} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
