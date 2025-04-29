import { useState } from "react";
import { MeetingRequest } from "@/types";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { DateDisplay } from "@/components/DateDisplay";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FileText, Clock, Check, X, Upload, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RequestStepper } from "@/components/RequestStepper";
import { toast } from "@/components/ui/use-toast";

interface RequestDetailsProps {
  request: MeetingRequest;
  onStatusChange?: () => void;
}

export function RequestDetails({ request, onStatusChange }: RequestDetailsProps) {
  const { updateRequestStatus, scheduleMeeting, addMeetingSummary, isLoading, addNotification, user } = useApp();
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || "");
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(request.scheduledTime);
  const [meetingSummaryFile, setMeetingSummaryFile] = useState<File | null>(null);
  
  const handleApprove = async () => {
    if (!meetingDate) return;
    await scheduleMeeting(request.id, meetingDate, adminNotes);
    if (onStatusChange) onStatusChange();
  };
  
  const handleReject = async () => {
    await updateRequestStatus(request.id, "rejected", adminNotes);
    if (onStatusChange) onStatusChange();
  };
  
  const handleAddSummary = async () => {
    if (!meetingSummaryFile) return;
    await addMeetingSummary(request.id, meetingSummaryFile);
    if (onStatusChange) onStatusChange();
  };

  return (
    <div className="space-y-6">
      <RequestStepper status={request.status} />
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{request.title}</h3>
        <RequestStatusBadge status={request.status} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium mb-1">מבקש</h4>
          <p className="text-sm text-muted-foreground">{request.requesterName}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">תאריך הגשה</h4>
          <DateDisplay date={request.createdAt} showIcon />
        </div>
        
        {!request.scheduledTime && (
          <div>
            <h4 className="text-sm font-medium mb-1">מועד אחרון</h4>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <DateDisplay date={request.deadline} />
            </div>
          </div>
        )}
        
        {request.scheduledTime && (
          <div>
            <h4 className="text-sm font-medium mb-1">זמן מתוכנן</h4>
            <DateDisplay date={request.scheduledTime} showIcon showTime />
          </div>
        )}
      </div>
      
      {request.description && (
        <div>
          <h4 className="text-sm font-medium mb-1">תיאור</h4>
          <p className="text-sm text-muted-foreground">{request.description}</p>
        </div>
      )}
      
      {request.documents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">מסמכים</h4>
          <ul className="space-y-2">
            {request.documents.map((doc) => (
              <li 
                key={doc.id}
                className="flex items-center p-2 border rounded-md text-sm"
              >
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="truncate">{doc.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {request.status === "pending" && (
        <>
          <div className="flex flex-row gap-2 items-end mb-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">בחר תאריך לפגישה</h4>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={meetingDate ? meetingDate.toISOString().slice(0, 10) : ""}
                onChange={e => {
                  const dateStr = e.target.value;
                  if (dateStr) {
                    const timeStr = meetingDate ? meetingDate.toTimeString().slice(0,5) : "00:00";
                    setMeetingDate(new Date(`${dateStr}T${timeStr}`));
                  } else {
                    setMeetingDate(undefined);
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">בחר שעה לפגישה</h4>
              <input
                type="time"
                className="border rounded px-2 py-1 w-full"
                value={meetingDate ? meetingDate.toTimeString().slice(0,5) : ""}
                onChange={e => {
                  const timeStr = e.target.value;
                  if (timeStr && meetingDate) {
                    const dateStr = meetingDate.toISOString().slice(0,10);
                    setMeetingDate(new Date(`${dateStr}T${timeStr}`));
                  }
                }}
              />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">הערות מנהל</h4>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="הוסף הערות לגבי הבקשה"
              rows={3}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button 
              onClick={handleApprove} 
              className="flex-1" 
              disabled={isLoading || !meetingDate || !new Date(meetingDate).toISOString().slice(0,10) || !new Date(meetingDate).toTimeString().slice(0,5)}
            >
              {isLoading ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              אשר ותזמן פגישה
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReject} 
              className="flex-1" 
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              דחה
            </Button>
          </div>
        </>
      )}
      
      {request.status === "scheduled" && user?.role === "admin" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-2 items-end mb-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">ערוך תאריך פגישה</h4>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={meetingDate ? meetingDate.toISOString().slice(0, 10) : ""}
                onChange={e => {
                  const dateStr = e.target.value;
                  if (dateStr) {
                    const timeStr = meetingDate ? meetingDate.toTimeString().slice(0,5) : "00:00";
                    setMeetingDate(new Date(`${dateStr}T${timeStr}`));
                  } else {
                    setMeetingDate(undefined);
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">ערוך שעה לפגישה</h4>
              <input
                type="time"
                className="border rounded px-2 py-1 w-full"
                value={meetingDate ? meetingDate.toTimeString().slice(0,5) : ""}
                onChange={e => {
                  const timeStr = e.target.value;
                  if (timeStr && meetingDate) {
                    const dateStr = meetingDate.toISOString().slice(0,10);
                    setMeetingDate(new Date(`${dateStr}T${timeStr}`));
                  }
                }}
              />
            </div>
          </div>
          <Button
            onClick={async () => {
              if (meetingDate) {
                await scheduleMeeting(request.id, meetingDate, adminNotes);
                if (onStatusChange) onStatusChange();
              }
            }}
            disabled={isLoading || !meetingDate}
          >
            עדכן זמן פגישה
          </Button>
        </div>
      )}
      
      {(request.status === "completed" || request.status === "rejected") && (
        <>
          {request.adminNotes && (
            <div>
              <h4 className="text-sm font-medium mb-1">הערות מנהל</h4>
              <p className="text-sm text-muted-foreground">{request.adminNotes}</p>
            </div>
          )}
          
          {request.meetingSummaryFile && (
            <div>
              <h4 className="text-sm font-medium mb-1">קובץ סיכום פגישה</h4>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => window.open(request.meetingSummaryFile.url, '_blank')}
              >
                <Download className="h-4 w-4" />
                <span>הורד קובץ</span>
              </Button>
            </div>
          )}
        </>
      )}
      
      {request.status === "ended" && !request.meetingSummaryFile && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-4 flex flex-col gap-2">
          <strong>לתשומת לבך:</strong> טרם הועלה קובץ סיכום פגישה.
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => {
              addNotification({
                userId: request.requesterId,
                message: "נא להעלות קובץ סיכום פגישה לבקשה שלך." });
              toast({ title: "התראה נשלחה", description: "נשלחה התראה למשתמש להעלות קובץ סיכום." });
            }}
          >
            שלח התראה למשתמש
          </Button>
        </div>
      )}
      {request.meetingSummaryFile && (
        <div>
          <h4 className="text-sm font-medium mb-1">קובץ סיכום פגישה</h4>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.open(request.meetingSummaryFile.url, '_blank')}
          >
            <span>הורד קובץ</span>
          </Button>
        </div>
      )}
    </div>
  );
}
