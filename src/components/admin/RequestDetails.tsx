
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
import { CalendarIcon, FileText, Clock, Check, X } from "lucide-react";
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
  const [meetingSummary, setMeetingSummary] = useState(request.meetingSummary || "");
  
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
    await addMeetingSummary(request.id, meetingSummary);
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
          <h4 className="text-sm font-medium mb-1">Requested By</h4>
          <p className="text-sm text-muted-foreground">{request.requesterName}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">Submission Date</h4>
          <DateDisplay date={request.createdAt} showIcon />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">Deadline</h4>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <DateDisplay date={request.deadline} />
          </div>
        </div>
        
        {request.scheduledTime && (
          <div>
            <h4 className="text-sm font-medium mb-1">Scheduled Time</h4>
            <DateDisplay date={request.scheduledTime} showIcon showTime />
          </div>
        )}
      </div>
      
      {request.description && (
        <div>
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-sm text-muted-foreground">{request.description}</p>
        </div>
      )}
      
      {request.documents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Documents</h4>
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
            <h4 className="text-sm font-medium mb-2">Admin Notes</h4>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this request"
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
              Approve
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
              Reject
            </Button>
          </div>
        </>
      )}
      
      {request.status === "approved" && (
        <>
          <div>
            <h4 className="text-sm font-medium mb-2">Schedule Meeting</h4>
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
                      <span>Select date and time</span>
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
                Schedule Meeting
              </Button>
            </div>
          </div>
        </>
      )}
      
      {request.status === "scheduled" && (
        <>
          <div>
            <h4 className="text-sm font-medium mb-2">Meeting Summary</h4>
            <Textarea
              value={meetingSummary}
              onChange={(e) => setMeetingSummary(e.target.value)}
              placeholder="Add meeting summary"
              rows={4}
            />
          </div>
          
          <Button 
            onClick={handleAddSummary} 
            disabled={!meetingSummary.trim() || isLoading}
          >
            {isLoading ? (
              <LoadingSpinner className="mr-2 h-4 w-4" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Complete Meeting
          </Button>
        </>
      )}
      
      {(request.status === "completed" || request.status === "rejected") && (
        <>
          {request.adminNotes && (
            <div>
              <h4 className="text-sm font-medium mb-1">Admin Notes</h4>
              <p className="text-sm text-muted-foreground">{request.adminNotes}</p>
            </div>
          )}
          
          {request.meetingSummary && (
            <div>
              <h4 className="text-sm font-medium mb-1">Meeting Summary</h4>
              <p className="text-sm text-muted-foreground">{request.meetingSummary}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
