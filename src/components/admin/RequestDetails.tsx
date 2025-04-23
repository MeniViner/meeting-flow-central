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

interface RequestDetailsProps {
  request: MeetingRequest;
  onStatusChange?: () => void;
}

export function RequestDetails({ request, onStatusChange }: RequestDetailsProps) {
  const { updateRequestStatus, scheduleMeeting, addMeetingSummary, isLoading } = useApp();
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || "");
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(request.scheduledTime);
  const [meetingSummaryFile, setMeetingSummaryFile] = useState<File | null>(null);
  const [meetingSummaryDescription, setMeetingSummaryDescription] = useState(request.meetingSummaryDescription || "");
  
  const handleApprove = async () => {
    await updateRequestStatus(request.id, "approved", adminNotes);
    if (onStatusChange) onStatusChange();
  };
  
  const handleReject = async () => {
    await updateRequestStatus(request.id, "rejected", adminNotes);
    if (onStatusChange) onStatusChange();
  };
  
  const handleSchedule = async () => {
    if (!meetingDate) return;
    await scheduleMeeting(request.id, meetingDate);
    if (onStatusChange) onStatusChange();
  };
  
  const handleAddSummary = async () => {
    if (!meetingSummaryFile) return;
    await addMeetingSummary(request.id, meetingSummaryFile, meetingSummaryDescription);
    if (onStatusChange) onStatusChange();
  };

  return (
    <div className="space-y-6">
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
        
        <div>
          <h4 className="text-sm font-medium mb-1">מועד אחרון</h4>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <DateDisplay date={request.deadline} />
          </div>
        </div>
        
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
          <div>
            <h4 className="text-sm font-medium mb-2">הערות מנהל</h4>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="הוסף הערות לגבי הבקשה"
              rows={3}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleApprove} 
              className="flex-1" 
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              אשר
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
      
      {request.status === "approved" && (
        <>
          <div>
            <h4 className="text-sm font-medium mb-2">תזמון פגישה</h4>
            <div className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !meetingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {meetingDate ? (
                      format(meetingDate, "PPP 'at' p")
                    ) : (
                      <span>בחר תאריך ושעה</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={meetingDate}
                    onSelect={setMeetingDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              <Button 
                onClick={handleSchedule} 
                disabled={!meetingDate || isLoading} 
                className="w-full"
              >
                {isLoading ? (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <CalendarIcon className="mr-2 h-4 w-4" />
                )}
                תזמן פגישה
              </Button>
            </div>
          </div>
        </>
      )}
      
      {request.status === "scheduled" && (
        <>
          <div>
            <h4 className="text-sm font-medium mb-2">סיכום פגישה</h4>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">תיאור קצר</h4>
                <Textarea
                  value={meetingSummaryDescription}
                  onChange={(e) => setMeetingSummaryDescription(e.target.value)}
                  placeholder="הוסף תיאור קצר לסיכום הפגישה"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">קובץ סיכום</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="meetingSummary"
                    className="hidden"
                    onChange={(e) => setMeetingSummaryFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <label
                    htmlFor="meetingSummary"
                    className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                  >
                    <Upload className="h-4 w-4" />
                    <span>בחר קובץ</span>
                  </label>
                  {meetingSummaryFile && (
                    <span className="text-sm text-muted-foreground">
                      {meetingSummaryFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleAddSummary} 
            disabled={!meetingSummaryFile || !meetingSummaryDescription.trim() || isLoading}
          >
            {isLoading ? (
              <LoadingSpinner className="mr-2 h-4 w-4" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            השלם פגישה
          </Button>
        </>
      )}
      
      {(request.status === "completed" || request.status === "rejected") && (
        <>
          {request.adminNotes && (
            <div>
              <h4 className="text-sm font-medium mb-1">הערות מנהל</h4>
              <p className="text-sm text-muted-foreground">{request.adminNotes}</p>
            </div>
          )}
          
          {request.meetingSummaryDescription && (
            <div>
              <h4 className="text-sm font-medium mb-1">תיאור סיכום פגישה</h4>
              <p className="text-sm text-muted-foreground">{request.meetingSummaryDescription}</p>
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
    </div>
  );
}
