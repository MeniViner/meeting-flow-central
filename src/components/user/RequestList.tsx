import { useState } from "react";
import { MeetingRequest, RequestStatus, FilterOptions } from "@/types";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { DateDisplay } from "@/components/DateDisplay";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Calendar, Clock, LayoutGrid, LayoutList, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RequestStepper } from "@/components/RequestStepper";
import { useApp } from "@/contexts/AppContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area"


interface RequestListProps {
  requests: MeetingRequest[];
  showFilters?: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}
// מציג רשימה של הבקשות שהוגשו על ידי המשתמש הנוכחי
export function RequestList({ requests, showFilters = true, searchTerm, setSearchTerm }: RequestListProps) {
  const { addMeetingSummary } = useApp();
  const [selectedRequest, setSelectedRequest] = useState<MeetingRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [meetingSummaryFile, setMeetingSummaryFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.description && request.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toggle view mode */}
      <div className="flex absolute  top-[230px] gap-1 border rounded-md w-fit mb-2">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("grid")}
          className="rounded-r-none"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "table" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("table")}
          className="rounded-l-none"
        >
          <LayoutList className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
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
              <SelectItem value="scheduled">מתוזמן</SelectItem>
              <SelectItem value="completed">הושלם</SelectItem>
              <SelectItem value="rejected">נדחה</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {filteredRequests.length === 0 ? (


        <div className="rounded-md border flex items-center justify-center min-h-[200px] px-4" >
          <div className="flex flex-col items-center justify-center text-muted-foreground text-center py-8">
            <Calendar className="w-10 h-10 mb-2 text-gray-400" />
            <p className="text-lg font-medium">לא נמצאו בקשות פגישה</p>
            <p className="text-sm mt-1">נסה לשנות את הסינון או ליצור בקשה חדשה</p>
            {/* <Button className="mt-4" onClick={() => setOpen(true)}>
              צור בקשה חדשה
            </Button> */}
          </div>
        </div>

      ) : viewMode === "table" ? (
        <div className="rounded-md border" dir="rtl">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>כותרת</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>תאריך יצירה</TableHead>
                  <TableHead>תאריך יעד</TableHead>
                  <TableHead>מסמכים</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell><RequestStatusBadge status={request.status} /></TableCell>
                    <TableCell><DateDisplay date={request.createdAt} /></TableCell>
                    <TableCell><DateDisplay date={request.deadline} /></TableCell>
                    <TableCell>
                      {request.documents.length > 0 ? (
                        <Badge variant="secondary">{request.documents.length}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">אין</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        הצג פרטים
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      ) : (
        <div className="rounded-md border" >
          <ScrollArea className="h-[500px]" dir="rtl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden" >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate">{request.title}</CardTitle>
                      <RequestStatusBadge status={request.status} />
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span className="mr-1" >תאריך הגשה: </span>
                        <DateDisplay date={request.createdAt}  />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      {request.description && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Info className="h-3.5 w-3.5 mr-1" />
                          <span className="mr-1">תיאור: </span>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {request.description}
                          </p>
                        </div>
                      )}
                      
                      {request.documents.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <FileText className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                            <span className="mr-1">מסמכים: </span>
                          </div>
                          <div className="flex flex-col gap-1 pl-5">
                            {request.documents.map((doc, index) => (
                              <span key={index} className="text-xs text-muted-foreground truncate mr-1">
                                {doc.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span className="mr-1">תאריך יעד: </span>
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
          </ScrollArea>
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
            <RequestStepper status={selectedRequest.status} />
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
              
              {selectedRequest.status === "ended" && !selectedRequest.meetingSummaryFile && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-4 flex flex-col gap-2">
                  <strong>לתשומת לבך:</strong> טרם הועלה קובץ סיכום פגישה. נא להעלות קובץ סיכום.
                  <input
                    type="file"
                    id="meetingSummary"
                    className="mt-2"
                    onChange={e => setMeetingSummaryFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <Button
                    className="w-fit mt-2"
                    onClick={async () => {
                      if (meetingSummaryFile) {
                        await addMeetingSummary(selectedRequest.id, meetingSummaryFile);
                        setMeetingSummaryFile(null);
                      }
                    }}
                    disabled={!meetingSummaryFile}
                  >
                    העלה וסיים פגישה
                  </Button>
                </div>
              )}
              {selectedRequest.meetingSummaryFile && (
                <div>
                  <h4 className="text-sm font-medium mb-1">קובץ סיכום פגישה</h4>
                  <div className="text-sm text-muted-foreground">
                    {selectedRequest.meetingSummaryFile.name}
                  </div>
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
