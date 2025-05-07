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
import { useToast } from "@/components/ui/use-toast";
import { isBefore, isSameDay } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { he } from "date-fns/locale";

interface RequestDetailsProps {
  request: MeetingRequest;
  onStatusChange?: () => void;
}

// Add helper for local date input value
function toLocalDateInputValue(date: Date | string | undefined) {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function RequestDetails({ request, onStatusChange }: RequestDetailsProps) {
  const { updateRequestStatus, scheduleMeeting, addMeetingSummary, isLoading, addNotification, user, requests } = useApp();
  const { toast } = useToast();
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || "");
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(
    request.scheduledTime ? new Date(request.scheduledTime) : undefined
  );
  const [meetingSummaryFile, setMeetingSummaryFile] = useState<File | null>(null);
  const [dateInput, setDateInput] = useState(meetingDate ? meetingDate : null);
  const [hourInput, setHourInput] = useState(meetingDate ? meetingDate.getHours().toString().padStart(2, '0') : "00");
  const [minuteInput, setMinuteInput] = useState(meetingDate ? meetingDate.getMinutes().toString().padStart(2, '0') : "00");
  
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

  // Helper to check for double-booking
  const checkDoubleBooking = (date: Date) => {
    return requests.some(r =>
      r.id !== request.id &&
      r.status === "scheduled" &&
      r.scheduledTime &&
      isSameDay(new Date(r.scheduledTime), date) &&
      new Date(r.scheduledTime).getHours() === date.getHours()
    );
  };

  // Handler for date input (using DatePicker)
  const handleDateChange = (date: Date | null) => {
    setDateInput(date);
    if (date && hourInput && minuteInput) {
      const [hours, minutes] = [parseInt(hourInput), parseInt(minuteInput)];
      const localDate = new Date(date);
      localDate.setHours(hours);
      localDate.setMinutes(minutes);
      setMeetingDate(localDate);
      if (checkDoubleBooking(localDate)) {
        toast({
          title: "אזהרה",
          description: "כבר קיימת פגישה בשעה זו ביום זה.",
          variant: "destructive",
        });
      }
    } else {
      setMeetingDate(undefined);
    }
  };

  // Handler for custom time select
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    setHourInput(newHour);
    updateMeetingDateWithTime(newHour, minuteInput);
  };
  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    setMinuteInput(newMinute);
    updateMeetingDateWithTime(hourInput, newMinute);
  };
  const updateMeetingDateWithTime = (hour: string, minute: string) => {
    if (dateInput) {
      const year = dateInput.getFullYear();
      const month = dateInput.getMonth();
      const day = dateInput.getDate();
      const localDate = new Date(year, month, day, parseInt(hour), parseInt(minute));
      setMeetingDate(localDate);
      if (checkDoubleBooking(localDate)) {
        toast({
          title: "אזהרה",
          description: "כבר קיימת פגישה בשעה זו ביום זה.",
          variant: "destructive",
        });
      }
    } else {
      setMeetingDate(undefined);
    }
  };

  // Handler for rescheduling
  const handleReschedule = async () => {
    if (meetingDate) {
      await scheduleMeeting(request.id, meetingDate, adminNotes);
      const date = new Date(meetingDate);
      const timeStr = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
      const dateStr = date.toLocaleDateString('he-IL');
      addNotification({
        userId: request.requesterId,
        message: `הפגישה שלך תוזמנה מחדש ל-${timeStr}, ${dateStr}`,
      });
      toast({
        title: "הפגישה תוזמנה מחדש",
        description: "המשתמש קיבל התראה על שינוי המועד.",
      });
      if (onStatusChange) onStatusChange();
    }
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
        {request.description && (
          <div>
            <h4 className="text-sm font-medium mb-1">תיאור</h4>
            <p className="text-sm text-muted-foreground">{request.description}</p>
          </div>
        )}
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
              <DatePicker
                selected={dateInput}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="border rounded px-2 py-1 w-full"
                placeholderText="בחר תאריך"
                locale={he}
              />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">בחר שעה לפגישה</h4>
              <div className="inline-flex items-center gap-2 border rounded px-2 py-1">
                <select value={minuteInput} onChange={handleMinuteChange} className="appearance-none bg-transparent border-none focus:outline-none">
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                  <span>:</span>
                <select value={hourInput} onChange={handleHourChange} className="appearance-none bg-transparent border-none focus:outline-none">
                  {[...Array(24).keys()].map(h => (
                    <option key={h} value={h.toString().padStart(2, '0')}>
                      {h.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
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
      
      {request.status === "scheduled" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-2 items-end mb-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">ערוך תאריך פגישה</h4>
              <DatePicker
                selected={dateInput}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="border rounded px-2 py-1 w-full"
                placeholderText="בחר תאריך"
                locale={he}
              />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">ערוך שעה לפגישה</h4>
              <div className="inline-flex-reverse items-center gap-2 border rounded px-2 py-1">
                <select value={minuteInput} onChange={handleMinuteChange} className="appearance-none bg-transparent border-none focus:outline-none">
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select value={hourInput} onChange={handleHourChange} className="appearance-none bg-transparent border-none focus:outline-none">
                  {[...Array(24).keys()].map(h => (
                    <option key={h} value={h.toString().padStart(2, '0')}>
                      {h.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <Button
            onClick={handleReschedule}
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
              <div className="text-sm text-muted-foreground">
                {request.meetingSummaryFile.name}
              </div>
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
