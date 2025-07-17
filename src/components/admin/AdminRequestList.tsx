// src/components/admin/AdminRequestList.tsx
import { useState } from "react";
import { MeetingRequest, RequestStatus } from "@/types";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { DateDisplay } from "@/components/DateDisplay";
import { RequestDetails } from "@/components/admin/RequestDetails";
import {
 Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from "@/components/ui/card";
import {
 Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
 Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
 Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Calendar as CalendarIcon, Clock, LayoutGrid, LayoutList, Info, PersonStanding, UserRound, CalendarClock, Check, X, CalendarPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/contexts/AppContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import ProfessionalTimePicker from '../ProfessionalTimePicker';

interface AdminRequestListProps {
  requests: MeetingRequest[];
}

export function AdminRequestList({ requests }: AdminRequestListProps) {
  const { updateRequestStatus, scheduleMeeting } = useApp();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<MeetingRequest | null>(null);
  const [requestToSchedule, setRequestToSchedule] = useState<MeetingRequest | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleStartTime, setScheduleStartTime] = useState<string>("");
  const [scheduleEndTime, setScheduleEndTime] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Helper to get current time in HH:mm format, rounded up to next 5 minutes
  function getCurrentTimeHHMM5() {
    const now = new Date();
    let minutes = now.getMinutes();
    let roundedMinutes = Math.ceil(minutes / 5) * 5;
    let hour = now.getHours();
    if (roundedMinutes === 60) {
      hour += 1;
      roundedMinutes = 0;
    }
    return `${hour.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
  }

  // Helper to check if selected date is today
  function isToday(date?: Date) {
    if (!date) return false;
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  // Validation state
  const [timeError, setTimeError] = useState<string>("");

  const handleApprove = async (request: MeetingRequest) => {
    if (!request.preferredStartTime || !request.preferredEndTime) {
      toast({
        title: "שגיאה באישור בקשה",
        description: "לא ניתן לאשר בקשה ללא זמני התחלה וסיום מועדפים.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "אישור פגישה",
      description: `האם לאשר ולקבוע את הפגישה למועד המבוקש (${request.preferredStartTime} - ${request.preferredEndTime})?`,
      action: <Button onClick={async () => {
        const scheduleDate = new Date(request.deadline);
        const [startHour, startMinute] = request.preferredStartTime!.split(':').map(Number);
        const scheduledTime = new Date(scheduleDate);
        scheduledTime.setHours(startHour, startMinute, 0, 0);

        const [endHour, endMinute] = request.preferredEndTime!.split(':').map(Number);
        const scheduledEndTime = new Date(scheduleDate);
        scheduledEndTime.setHours(endHour, endMinute, 0, 0);

        await scheduleMeeting(request.id, scheduledTime, scheduledEndTime, request.adminNotes);

        toast({
          title: "הפגישה נקבעה",
          description: `הפגישה "${request.title}" נקבעה בהצלחה.`,
        });
      }}>אשר וקבע</Button>,
    });
  }

  const handleReject = async (requestId: string, requestTitle: string) => {
    toast({
      title: "דחיית בקשה",
      description: `האם אתה בטוח שברצונך לדחות את הבקשה "${requestTitle}"?`,
      action: <Button variant="destructive" onClick={async () => {
        await updateRequestStatus(requestId, "rejected");
        toast({
          title: "הבקשה נדחתה",
          description: `הבקשה "${requestTitle}" נדחתה.`,
        });
      }}>דחה</Button>,
    });
  };

  const handleOpenScheduleDialog = (request: MeetingRequest) => {
    setRequestToSchedule(request);
    // Pre-fill with preferred times if they exist, otherwise from scheduled time if it exists.
    if (request.deadline) setScheduleDate(new Date(request.deadline));
    const preferredDate = request.deadline ? new Date(request.deadline) : new Date();

    if (request.preferredStartTime) {
        setScheduleStartTime(request.preferredStartTime);
    } else if (request.scheduledTime) {
        setScheduleStartTime(format(new Date(request.scheduledTime), "HH:mm"));
    } else {
        setScheduleStartTime("");
    }

    if (request.preferredEndTime) {
        setScheduleEndTime(request.preferredEndTime);
    } else if (request.scheduledEndTime) {
        setScheduleEndTime(format(new Date(request.scheduledEndTime), "HH:mm"));
    } else {
        setScheduleEndTime("");
    }
    
    setAdminNotes(request.adminNotes || "");
  };

  const handleScheduleSubmit = async () => {
    if (requestToSchedule && scheduleDate && scheduleStartTime && scheduleEndTime) {
      const [startHour, startMinute] = scheduleStartTime.split(':').map(Number);
      const scheduledTime = new Date(scheduleDate);
      scheduledTime.setHours(startHour, startMinute, 0, 0);

      const [endHour, endMinute] = scheduleEndTime.split(':').map(Number);
      const scheduledEndTime = new Date(scheduleDate);
      scheduledEndTime.setHours(endHour, endMinute, 0, 0);

      await scheduleMeeting(requestToSchedule.id, scheduledTime, scheduledEndTime, adminNotes);
      
      // Close dialog and reset state
      setRequestToSchedule(null);
      setScheduleDate(undefined);
      setScheduleStartTime("");
      setScheduleEndTime("");
      setAdminNotes("");
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.description && request.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort requests: pending first, then scheduled, then ended, then completed, then rejected
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const statusOrder: Record<RequestStatus, number> = {
      pending: 0,
      scheduled: 1,
      ended: 2,
      completed: 3,
      rejected: 4,
    };
    
    // First sort by status
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    // For the same status, sort by submission date
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const renderActions = (request: MeetingRequest) => {
    const actions: React.ReactNode[] = [];
  
    if (request.status === 'pending') {
      if (request.preferredStartTime && request.preferredEndTime) {
        actions.push(
          <Button key="approve" variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={(e) => { e.stopPropagation(); handleApprove(request); }}>
            <Check className="w-4 h-4 mr-1" />
            אישור
          </Button>
        );
      }
      actions.push(
        <Button key="reschedule" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenScheduleDialog(request); }}>
          <CalendarPlus className="w-4 h-4 mr-1" />
          קבע מועד
        </Button>
      );
    }
  
    if (request.status === 'scheduled') {
      actions.push(
        <Button key="reschedule" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenScheduleDialog(request); }}>
          <CalendarPlus className="w-4 h-4 mr-1" />
          שינוי מועד
        </Button>
      );
    }
  
    if (request.status === 'pending' || request.status === 'scheduled') {
      actions.push(
        <Button key="reject" variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleReject(request.id, request.title); }}>
          <X className="w-4 h-4 mr-1" />
          דחייה
        </Button>
      );
    }
  
    return <div className="flex items-center justify-end gap-1">{actions}</div>;
  };

  return (
    <div className="space-y-6">
      <Card className="min-h-[540px]">
        <CardHeader className="pb-3 ">
          <CardTitle>ניהול בקשות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                dir="rtl"
                placeholder="חיפוש לפי כותרת, מבקש או תיאור..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                dir="rtl"
              >
                <SelectTrigger className="w-full sm:w-[180px] flex flex-row-reverse justify-end">
                  <SelectValue placeholder="מיון לפי תאריך"/>
                </SelectTrigger>
                <SelectContent className="w-full sm:w-[180px]">
                  <SelectItem value="desc">חדש לישן</SelectItem>
                  <SelectItem value="asc">ישן לחדש</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as RequestStatus | "all")}
                dir="rtl"
              >
                <SelectTrigger className="w-full sm:w-[180px] flex flex-row-reverse justify-end">
                  <SelectValue placeholder="סנן לפי סטטוס"/>
                </SelectTrigger>
                <SelectContent  className="w-full sm:w-[180px]">
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="scheduled">מתוזמן</SelectItem>
                  <SelectItem value="ended">הסתיים (ממתין לסיכום)</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="rejected">נדחה</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1 border rounded-md" data-tutorial="admin-view">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                  id="admin-view-list"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                  id="admin-view-grid"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="rounded-md border">
              <ScrollArea className="min-h-[350px]">
                <Table>
                  <TableHeader data-tutorial="admin-table-headers">
                    <TableRow >
                      <TableHead className="w-[200px] text-right" data-tutorial="admin-actions">פעולות</TableHead>
                      <TableHead data-tutorial="admin-documents">מסמכים</TableHead>
                      <TableHead data-tutorial="admin-scheduled">מועד שנקבע</TableHead>
                      <TableHead data-tutorial="admin-status">סטטוס</TableHead>
                      <TableHead data-tutorial="admin-deadline">מועד מבוקש</TableHead>
                      <TableHead data-tutorial="admin-requester">מבקש</TableHead>
                      <TableHead className="w-[280px]" data-tutorial="admin-title">כותרת</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center">
                            <CalendarIcon className="w-10 h-10 mb-2 text-gray-400" />
                            <p className="text-lg font-medium">לא נמצאו בקשות פגישה</p>
                            <p className="text-sm mt-1">נסה לשנות את הסינון </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) :
                      sortedRequests.map((request) => (
                        <TableRow 
                          key={request.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <TableCell data-tutorial="admin-actions">{renderActions(request)}</TableCell>
                          <TableCell dir="rtl" data-tutorial="admin-documents">
                            {request.documents.length > 0 ? (
                              <Badge variant="secondary" className="flex items-center w-fit">
                                <FileText className="h-3 w-3 mr-1" />
                                {request.documents.length}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground mr-5">אין</span>
                            )}
                          </TableCell>
                          <TableCell dir="rtl" data-tutorial="admin-scheduled">
                            {request.scheduledTime && (() => {
                              const d = new Date(request.scheduledTime);
                              const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
                              const [day, month] = d.toLocaleDateString('he-IL').split('.');
                              const endTime = request.scheduledEndTime ? new Date(request.scheduledEndTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false }) : "";
                              return (
                                <span className="flex items-center gap-1">
                                  <CalendarClock className="h-4 w-4 mr-1 text-blue-500  " />
                                  <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold">
                                    {time}{endTime && ` - ${endTime}`}
                                  </span>
                                  <span className="rounded-full bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-bold">
                                    {day}/{month}
                                  </span>
                                </span>
                              );
                            })()}
                          </TableCell>
                          <TableCell data-tutorial="admin-status">
                            <RequestStatusBadge status={request.status} />
                          </TableCell>
                          <TableCell dir="rtl" data-tutorial="admin-deadline">
                            <DateDisplay date={request.deadline} />
                          </TableCell>
                          <TableCell data-tutorial="admin-requester">{request.requesterName}</TableCell>
                          <TableCell className="font-medium text-right" dir="rtl" data-tutorial="admin-title">
                            {request.title}
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          ) : (
            <div className="rounded-md border">
              <ScrollArea className="min-h-[250px]" dir="rtl">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
                  {sortedRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 col-span-full text-muted-foreground text-center">
                      <CalendarIcon className="w-10 h-10 mb-2 text-gray-400" />
                      <p className="text-lg font-medium">לא נמצאו בקשות פגישה</p>
                      <p className="text-sm mt-1">נסה לשנות את הסינון </p>
                    </div>
                  ) : (
                    sortedRequests.map((request) => (
                      <Card 
                        key={request.id} 
                        className="overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-xl"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <CardHeader className="pb-2 cursor-pointer">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg truncate text-right" dir="rtl">{request.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              {request.scheduledTime && (() => {
                                const d = new Date(request.scheduledTime);
                                const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
                                const [day, month] = d.toLocaleDateString('he-IL').split('.');
                                const endTime = request.scheduledEndTime ? new Date(request.scheduledEndTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false }) : "";
                                return (
                                  <span className="flex items-center gap-1">
                                    <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold">
                                      {time}{endTime && ` - ${endTime}`}
                                    </span>
                                    <span className="rounded-full bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-bold">
                                      {day}/{month}
                                    </span>
                                  </span>
                                );
                              })()}
                              <RequestStatusBadge status={request.status} />
                            </div>
                          </div>
                          <CardDescription className="text-sm text-right pt-1" dir="rtl">{request.requesterName}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 flex-grow cursor-pointer">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">מועד מבוקש:</span>
                            <DateDisplay date={request.deadline} />
                          </div>
                          {(request.preferredStartTime || request.preferredEndTime) && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span className="font-semibold">זמן מועדף:</span>
                                <span>{request.preferredStartTime} - {request.preferredEndTime}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm text-muted-foreground">
                              <span className="font-semibold">מסמכים:</span>
                              <span>{request.documents.length}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="p-2 border-t bg-slate-50 group-hover:bg-slate-100 transition-colors">
                          {renderActions(request)}
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={open => !open && setSelectedRequest(null)}>
        {selectedRequest && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>פרטי בקשה</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh]">
                <RequestDetails request={selectedRequest} />
            </ScrollArea>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Scheduling Dialog */}
      <Dialog open={!!requestToSchedule} onOpenChange={open => !open && setRequestToSchedule(null)}>
        {requestToSchedule && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {requestToSchedule.status === 'pending' ? 'אישור וקביעת פגישה' : 'שינוי מועד פגישה'}
              </DialogTitle>
              <CardDescription>עבור בקשה: "{requestToSchedule.title}"</CardDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4" dir="rtl">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="schedule-date" className="text-right">תאריך</Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-right font-normal", !scheduleDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {scheduleDate ? format(scheduleDate, "PPP", { locale: he }) : <span>בחר תאריך</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        initialFocus
                        locale={he}
                        disabled={{ before: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-time" className="text-right">שעת התחלה</Label>
                <ProfessionalTimePicker
                  id="start-time"
                  label=""
                  value={scheduleStartTime}
                  onChange={(newTime) => {
                    setScheduleStartTime(newTime);
                    if (scheduleEndTime && newTime >= scheduleEndTime) {
                      setScheduleEndTime("");
                    }
                  }}
                  disablePastTimes={isToday(scheduleDate)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-time" className="text-right">שעת סיום</Label>
                <ProfessionalTimePicker
                  id="end-time"
                  label=""
                  value={scheduleEndTime}
                  onChange={(newTime) => {
                    setScheduleEndTime(newTime);
                  }}
                  disablePastTimes={isToday(scheduleDate)}
                  minTime={scheduleStartTime}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="admin-notes" className="text-right">הערות</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="הערות פנימיות למנהלים (יופיע בפרטי הפגישה)"
                />
              </div>
              {timeError && (
                <div className="col-span-4 text-red-600 text-sm text-right mt-1">{timeError}</div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">ביטול</Button>
              </DialogClose>
              <Button onClick={handleScheduleSubmit}>
                {requestToSchedule.status === 'pending' ? 'אישור וקביעה' : 'עדכון מועד'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
