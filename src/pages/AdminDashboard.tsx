// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { AdminRequestList } from "@/components/admin/AdminRequestList";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { DateDisplay } from "@/components/DateDisplay";
import { MeetingRequest, RequestStatus } from "@/types";
import { Clock, AlertTriangle, CalendarDays, Hourglass, Clock1, ClockAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyTimelineCalendar, MeetingSlot } from "@/components/admin/WeeklyTimelineCalendar";
import { isValid, format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RequestDetails } from "@/components/admin/RequestDetails";
import { FixedTutorialButton } from '@/components/tutorial/FixedTutorialButton';
import { useTutorial, adminTutorialPath } from '@/contexts/TutorialContext';


export default function AdminDashboard() {
  const { requests, user } = useApp();


    
  const { isActive, currentStep, nextStep } = useTutorial(); // Get tutorial state and functions

  // Effect to advance tutorial when the create request modal opens
  useEffect(() => {
    if (isActive && open && adminTutorialPath.steps[currentStep]?.id === 'create-request') {
      // Automatically move to the next step (form explanation)
      nextStep();
    }
  }, [isActive, open, currentStep, nextStep]); // Add dependencies


  // Allow access in development mode or if user is admin
  const isAdmin = process.env.NODE_ENV === "development" || user?.globalRole === "owner" || user?.globalRole === "administrator";

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

  // Real scheduled meetings for the weekly calendar
  const meetingSlots: MeetingSlot[] = requests
    .filter(r => r.status === "scheduled" && r.scheduledTime && r.scheduledEndTime)
    .map(r => {
      const dateObj = new Date(r.scheduledTime!);
      const endTimeObj = new Date(r.scheduledEndTime!);
      if (!isValid(dateObj) || !isValid(endTimeObj)) return null;
      return {
        date: format(dateObj, "dd/MM/yyyy"),
        time: format(dateObj, "HH:mm"),
        label: `${format(dateObj, "HH:mm")} - ${format(endTimeObj, "HH:mm")} ${r.title ? `- ${r.title}` : ""}`,
      };
    })
    .filter(Boolean) as MeetingSlot[];

  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRequest | null>(null);

  const handleSlotClick = (slot: MeetingSlot) => {
    const found = requests.find(r =>
      r.status === "scheduled" &&
      r.scheduledTime &&
      r.scheduledEndTime &&
      format(new Date(r.scheduledTime), "dd/MM/yyyy") === slot.date &&
      format(new Date(r.scheduledTime), "HH:mm") === slot.time
    );
    if (found) setSelectedMeeting(found);
  };

  return (
    <div className="space-y-6" >
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">לוח בקרה</h1>
        <p className="text-muted-foreground">
          ניהול בקשות פגישה
        </p>
      </div> */}
      <FixedTutorialButton page="admin" />

      <Tabs defaultValue="admin" >
        <TabsList data-tutorial="admin-dashboard">
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="weekly">לוח שבועי</TabsTrigger>
          <TabsTrigger value="requests" >כל הבקשות</TabsTrigger>
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
                <CardTitle className="flex items-center" dir="rtl">
                  {/* <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" /> */}
                  {/* <Hourglass className="h-5 w-5 mr-2 text-yellow-500" /> */}
                  <ClockAlert className="h-5 w-5 mr-2 text-yellow-500" />


                  <span>מועדים קרובים</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-muted-foreground">אין מועדים קרובים</p>
                ) : (
                  <ul className="space-y-4" dir="rtl">
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
                          <p className="font-medium text-right" dir="rtl">{request.title}</p>
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
                <CardTitle className="flex items-center" dir="rtl">
                  <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
                  <span>פגישות קרובות</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMeetings.length === 0 ? (
                  <p className="text-muted-foreground">אין פגישות קרובות</p>
                ) : (
                  <ul className="space-y-4" dir="rtl">
                    {upcomingMeetings.map((request) => (
                      <li key={request.id} className="flex items-start gap-4">
                        <div className="min-w-[130px]">
                          <DateDisplay
                            date={request.scheduledTime!}
                            className="font-medium"
                            showTime
                          />
                        </div>
                        <div>
                          <p className="font-medium text-right" dir="rtl">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            מבקש: {request.requesterName}
                          </p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
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

          <Card dir="rtl">
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

        <TabsContent value="requests" data-tutorial="admin-requests">
          <AdminRequestList requests={requests} />
        </TabsContent>

        <TabsContent value="weekly">
          <WeeklyTimelineCalendar meetingSlots={meetingSlots} onSlotClick={handleSlotClick} />
        </TabsContent>
      </Tabs>
      <Dialog open={!!selectedMeeting} onOpenChange={open => !open && setSelectedMeeting(null)}>
        {selectedMeeting && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>פרטי פגישה</DialogTitle>
            </DialogHeader>
            <RequestDetails request={selectedMeeting} />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
