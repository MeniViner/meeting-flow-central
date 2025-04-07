
import { useState } from "react";
import { MeetingRequest, RequestStatus, FilterOptions } from "@/types";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { DateDisplay } from "@/components/DateDisplay";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RequestListProps {
  requests: MeetingRequest[];
  showFilters?: boolean;
}

export function RequestList({ requests, showFilters = true }: RequestListProps) {
  const [selectedRequest, setSelectedRequest] = useState<MeetingRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  
  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.description && request.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חפש בקשות..."
              className="pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as RequestStatus | "all")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="סנן לפי סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="pending">ממתין</SelectItem>
              <SelectItem value="approved">מאושר</SelectItem>
              <SelectItem value="scheduled">מתוזמן</SelectItem>
              <SelectItem value="completed">הושלם</SelectItem>
              <SelectItem value="rejected">נדחה</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">לא נמצאו בקשות פגישה.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate">{request.title}</CardTitle>
                  <RequestStatusBadge status={request.status} />
                </div>
                <CardDescription className="flex items-center mt-1">
                  <Calendar className="h-3.5 w-3.5 ml-1" />
                  <DateDisplay date={request.createdAt} className="text-xs" />
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {request.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.description}
                    </p>
                  )}
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 ml-1" />
                    <span>תאריך יעד: </span>
                    <DateDisplay date={request.deadline} className="mr-1" />
                  </div>
                  
                  {request.documents.length > 0 && (
                    <div className="flex items-center mt-1">
                      <FileText className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">
                        {request.documents.length} {request.documents.length === 1 ? "מסמך" : "מסמכים"}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedRequest(request)}
                >
                  הצג פרטים
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        {selectedRequest && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedRequest.title}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center justify-between mt-2">
                  <DateDisplay 
                    date={selectedRequest.createdAt} 
                    showIcon 
                  />
                  <RequestStatusBadge status={selectedRequest.status} />
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedRequest.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">תיאור</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-1">תאריך יעד</h4>
                <DateDisplay date={selectedRequest.deadline} showIcon />
              </div>
              
              {selectedRequest.scheduledTime && (
                <div>
                  <h4 className="text-sm font-medium mb-1">זמן מתוזמן</h4>
                  <DateDisplay date={selectedRequest.scheduledTime} showIcon showTime />
                </div>
              )}
              
              {selectedRequest.adminNotes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">הערות מנהל</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.adminNotes}</p>
                </div>
              )}
              
              {selectedRequest.meetingSummary && (
                <div>
                  <h4 className="text-sm font-medium mb-1">סיכום פגישה</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.meetingSummary}</p>
                </div>
              )}
              
              {selectedRequest.documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">מסמכים</h4>
                  <ul className="space-y-2">
                    {selectedRequest.documents.map((doc) => (
                      <li 
                        key={doc.id}
                        className="flex items-center p-2 border rounded-md text-sm"
                      >
                        <FileText className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span className="truncate">{doc.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
