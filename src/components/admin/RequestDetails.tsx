// src/components/admin/RequestDetails.tsx
import { useState, useMemo } from "react";
import { MeetingRequest } from "@/types";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { DateDisplay } from "@/components/DateDisplay";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [hourInputEnd, setHourInputEnd] = useState(request.scheduledEndTime ? new Date(request.scheduledEndTime).getHours().toString().padStart(2, '0') : (meetingDate ? (new Date(meetingDate.getTime() + 60 * 60 * 1000)).getHours().toString().padStart(2, '0') : "01")); // Default to 1 hour after start or existing end time
  const [minuteInputEnd, setMinuteInputEnd] = useState(request.scheduledEndTime ? new Date(request.scheduledEndTime).getMinutes().toString().padStart(2, '0') : (meetingDate ? meetingDate.getMinutes().toString().padStart(2, '0') : "00"));

  const handleApprove = async () => {
    if (!meetingDate) return;
    const scheduledEndTime = new Date(dateInput!);
    scheduledEndTime.setHours(parseInt(hourInputEnd));
    scheduledEndTime.setMinutes(parseInt(minuteInputEnd));

    if (scheduledEndTime <= meetingDate) {
      toast({
        title: "שגיאה",
        description: "שעת סיום הפגישה חייבת להיות לאחר שעת ההתחלה.",
        variant: "destructive",
      });
      return;
    }

    await scheduleMeeting(request.id, meetingDate, scheduledEndTime, adminNotes);
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
  const checkDoubleBooking = (startDate: Date, endDate: Date) => {
    return requests.some(r => {
      if (r.id === request.id || r.status !== "scheduled" || !r.scheduledTime || !r.scheduledEndTime) {
        return false;
      }
      const existingStart = new Date(r.scheduledTime);
      const existingEnd = new Date(r.scheduledEndTime);

      // Check for overlap: (startA < endB) && (endA > startB)
      return (startDate < existingEnd) && (endDate > existingStart);
    });
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
      if (checkDoubleBooking(localDate, new Date(localDate.setHours(parseInt(hourInputEnd), parseInt(minuteInputEnd))))) {
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
    updateMeetingDateWithTime(newHour, minuteInput, hourInputEnd, minuteInputEnd);
  };
  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    setMinuteInput(newMinute);
    updateMeetingDateWithTime(hourInput, newMinute, hourInputEnd, minuteInputEnd);
  };

  const handleHourChangeEnd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    setHourInputEnd(newHour);
    updateMeetingDateWithTime(hourInput, minuteInput, newHour, minuteInputEnd);
  };

  const handleMinuteChangeEnd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    setMinuteInputEnd(newMinute);
    updateMeetingDateWithTime(hourInput, minuteInput, hourInputEnd, newMinute);
  };

  const updateMeetingDateWithTime = (hour: string, minute: string, hourEnd: string, minuteEnd: string) => {
    if (dateInput) {
      const year = dateInput.getFullYear();
      const month = dateInput.getMonth();
      const day = dateInput.getDate();
      const localDate = new Date(year, month, day, parseInt(hour), parseInt(minute));
      const localDateEnd = new Date(year, month, day, parseInt(hourEnd), parseInt(minuteEnd));

      if (localDateEnd <= localDate) {
        toast({
          title: "אזהרה",
          description: "שעת סיום הפגישה חייבת להיות לאחר שעת ההתחלה.",
          variant: "destructive",
        });
        setMeetingDate(undefined);
        return;
      }

      setMeetingDate(localDate);
      if (checkDoubleBooking(localDate, localDateEnd)) {
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
      const date = new Date(meetingDate);
      const scheduledEndTime = new Date(dateInput!);
      scheduledEndTime.setHours(parseInt(hourInputEnd));
      scheduledEndTime.setMinutes(parseInt(minuteInputEnd));

      if (scheduledEndTime <= date) {
        toast({
          title: "שגיאה",
          description: "שעת סיום הפגישה חייבת להיות לאחר שעת ההתחלה.",
          variant: "destructive",
        });
        return;
      }
      await scheduleMeeting(request.id, meetingDate, scheduledEndTime, adminNotes);
      const startTimeStr = format(date, "HH:mm", { locale: he });
      const endTimeStr = format(scheduledEndTime, "HH:mm", { locale: he });
      const dateStr = format(date, "dd/MM/yyyy", { locale: he });
      addNotification({
        userId: request.requesterId,
        message: `הפגישה שלך תוזמנה מחדש ל-${dateStr} בין השעות ${startTimeStr} - ${endTimeStr}`,
      });
      toast({
        title: "הפגישה תוזמנה מחדש",
        description: "המשתמש קיבל התראה על שינוי המועד.",
      });
      if (onStatusChange) onStatusChange();
    }
  };

  const requestStatus: import("@/types").RequestStatus = request.status;

  const isMeetingDateTimeValid = useMemo(() => {
    if (!dateInput || !hourInput || !minuteInput || !hourInputEnd || !minuteInputEnd) {
      return false;
    }
    const start = new Date(dateInput);
    start.setHours(parseInt(hourInput), parseInt(minuteInput));
    const end = new Date(dateInput);
    end.setHours(parseInt(hourInputEnd), parseInt(minuteInputEnd));
    return end > start;
  }, [dateInput, hourInput, minuteInput, hourInputEnd, minuteInputEnd]);

  return (
    <div className="space-y-6">
      <RequestStepper status={request.status} />
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-right" dir="rtl">{request.title}</h3>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium mb-1">מבקש</h4>
          <p className="text-sm text-muted-foreground">{request.requesterName || "אין מבקש"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">תיאור</h4>
          <p className="text-sm text-muted-foreground">{request.description || "אין תיאור"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">תאריך הגשה</h4>
          <DateDisplay date={request.createdAt} showIcon />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">מועד אחרון</h4>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            {request.deadline ? (
              <DateDisplay date={request.deadline} />
            ) : (
              <span className="text-muted-foreground">אין מועד אחרון</span>
            )}
          </div>
        </div>

        {/* <div>
          <h4 className="text-sm font-medium mb-1">זמן מתוכנן</h4>
          {request.scheduledTime ? (
            <DateDisplay date={request.scheduledTime} showIcon showTime />
          ) : (
            <span className="text-muted-foreground">אין זמן מתוכנן</span>
          )}
        </div> */}
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">מסמכים</h4>
        {request.documents.length > 0 ? (
          <ScrollArea className="h-[110px] rounded-md border p-2">
            <ul className="space-y-1">
              {request.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center p-1 border rounded-md text-sm"
                >
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate mr-1">{doc.name}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground">אין מסמכים</p>
        )}
      </div>

      {request.status === "pending" && (
        <>
          <div className="flex-1">
            <h4 className="text-sm font-medium mb-2">בחר תאריך לפגישה</h4>
            <DatePicker
              selected={dateInput}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="border rounded px-2 py-1 w-full"
              placeholderText="בחר תאריך"
              locale={he}
              minDate={new Date()}
            />
          </div>

          <div className="flex flex-row gap-2 items-end mb-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">בחר שעת התחלה לפגישה</h4>
              <div className="flex flex-row items-center justify-center gap-2 border rounded-lg px-3 py-2 shadow-sm">
                <div className="relative w-14">
                  <select
                    value={minuteInput}
                    onChange={handleMinuteChange}
                    className="appearance-none bg-transparent border-none focus:outline-none w-full font-mono"
                    size={3}
                  >
                    {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                      <option
                        key={m}
                        value={m}
                        className={m === minuteInput ? "bg-blue-100 text-blue-600 font-medium" : ""}
                      >
                        {m}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <span className="text-lg font-medium mx-1 text-blue-700 ">:</span>
                <div className="relative w-14">
                  <select
                    value={hourInput}
                    onChange={handleHourChange}
                    className="appearance-none bg-transparent border-none focus:outline-none w-full font-mono "
                    size={3}
                  >
                    {[...Array(24).keys()].map(h => {
                      const hour = h.toString().padStart(2, '0');
                      return (
                        <option
                          key={hour}
                          value={hour}
                          className={hour === hourInput ? "bg-blue-100 text-blue-600 font-medium" : ""}
                        >
                          {hour}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">בחר שעת סיום לפגישה</h4>
              <div className="flex flex-row items-center justify-center gap-2 border rounded-lg px-3 py-2 shadow-sm">
                <div className="relative w-14">
                  <select
                    value={minuteInputEnd}
                    onChange={handleMinuteChangeEnd}
                    className="appearance-none bg-transparent border-none focus:outline-none w-full font-mono"
                    size={3}
                  >
                    {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                      <option
                        key={m}
                        value={m}
                        className={m === minuteInputEnd ? "bg-blue-100 text-blue-600 font-medium" : ""}
                      >
                        {m}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <span className="text-lg font-medium mx-1 text-blue-700 ">:</span>
                <div className="relative w-14">
                  <select
                    value={hourInputEnd}
                    onChange={handleHourChangeEnd}
                    className="appearance-none bg-transparent border-none focus:outline-none w-full font-mono "
                    size={3}
                  >
                    {[...Array(24).keys()].map(h => {
                      const hour = h.toString().padStart(2, '0');
                      return (
                        <option
                          key={hour}
                          value={hour}
                          className={hour === hourInputEnd ? "bg-blue-100 text-blue-600 font-medium" : ""}
                        >
                          {hour}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <div>
              <h4 className="text-sm font-medium mb-2">הערות מנהל</h4>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="הוסף הערות לגבי הבקשה"
                rows={3}
              />
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

          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              onClick={handleApprove}
              className="flex-1"
              disabled={isLoading || !meetingDate || !isMeetingDateTimeValid || checkDoubleBooking(meetingDate, new Date(dateInput!).setHours(parseInt(hourInputEnd), parseInt(minuteInputEnd)) as any)}
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
                minDate={new Date()}
              />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">ערוך שעת התחלה לפגישה</h4>
              <div className="flex flex-row items-center justify-center gap-2 border rounded-lg px-3 py-2 shadow-sm">
                <div className="relative w-14">
                  <select
                    value={minuteInput}
                    onChange={handleMinuteChange}
                    className="appearance-none bg-transparent border-none focus:outline-none w-full font-mono"
                    size={3}
                  >
                    {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                      <option
                        key={m}
                        value={m}
                        className={m === minuteInput ? "bg-blue-100 text-blue-600 font-medium" : ""}
                      >
                        {m}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <span className="text-lg font-medium mx-1 text-blue-700 ">:</span>
                <div className="relative w-14">
                  <select
                    value={hourInput}
                    onChange={handleHourChange}
                    className="appearance-none bg-transparent border-none focus:outline-none w-full font-mono"
                    size={3}
                  >
                    {[...Array(24).keys()].map(h => {
                      const hour = h.toString().padStart(2, '0');
                      return (
                        <option
                          key={hour}
                          value={hour}
                          className={hour === hourInput ? "bg-blue-100 text-blue-600 font-medium" : ""}
                        >
                          {hour}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">ערוך שעת סיום לפגישה</h4>
              <div className="flex flex-row items-center justify-center gap-2 border rounded-lg px-3 py-2 shadow-sm">
                <div className="relative w-14">
                  <select
                    value={minuteInputEnd}
                    onChange={handleMinuteChangeEnd}
                    className="appearance-none bg-transparent border-none focus:outline-none w-full font-mono"
                    size={3}
                  >
                    {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                      <option
                        key={m}
                        value={m}
                        className={m === minuteInputEnd ? "bg-blue-100 text-blue-600 font-medium" : ""}
                      >
                        {m}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <span className="text-lg font-medium mx-1 text-blue-700 ">:</span>
                <div className="relative w-14">
                  <select
                    value={hourInputEnd}
                    onChange={handleHourChangeEnd}
                    className="appearance-none bg-transparent border-none focus:outline-none w-full font-mono"
                    size={3}
                  >
                    {[...Array(24).keys()].map(h => {
                      const hour = h.toString().padStart(2, '0');
                      return (
                        <option
                          key={hour}
                          value={hour}
                          className={hour === hourInputEnd ? "bg-blue-100 text-blue-600 font-medium" : ""}
                        >
                          {hour}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleReschedule}
            disabled={isLoading || !meetingDate || !isMeetingDateTimeValid || checkDoubleBooking(meetingDate, new Date(dateInput!).setHours(parseInt(hourInputEnd), parseInt(minuteInputEnd)) as any)}
          >
            עדכן זמן פגישה
          </Button>
        </div>
      )}

      {(requestStatus === "completed" || requestStatus === "rejected") && (
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
              {request.meetingSummaryFile.type === "text/plain" ? (
                <div className="text-sm text-muted-foreground">
                  {request.meetingSummaryFile.name}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => window.open(request.meetingSummaryFile.url, '_blank')}
                >
                  <span>הורד קובץ</span>
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {requestStatus === "ended" && !request.meetingSummaryFile && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-4 flex flex-col gap-2">
          <strong>לתשומת לבך:</strong> טרם הועלה קובץ סיכום פגישה.
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => {
              addNotification({
                userId: request.requesterId,
                message: "נא להעלות קובץ סיכום פגישה לבקשה שלך."
              });
              toast({ title: "התראה נשלחה", description: "נשלחה התראה למשתמש להעלות קובץ סיכום." });
            }}
          >
            שלח התראה למשתמש
          </Button>
        </div>
      )}

      {request.scheduledTime && (
        <div>
          <h4 className="text-sm font-medium mb-1">זמן מתוכנן</h4>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <time dateTime={new Date(request.scheduledTime).toISOString()}>
              {`${format(new Date(request.scheduledTime), "HH:mm", { locale: he })} - ${format(new Date(request.scheduledEndTime!), "HH:mm", { locale: he })}`}
            </time>
          </div>
        </div>
      )}

    </div>
  );
}
