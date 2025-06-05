import { useState } from "react";
import { MeetingRequest, RequestStatus, FilterOptions, Document } from "@/types";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { DateDisplay } from "@/components/DateDisplay";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Calendar, Clock, LayoutGrid, LayoutList, Info, Edit, CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RequestStepper } from "@/components/RequestStepper";
import { useApp } from "@/contexts/AppContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion"
import { EditRequestForm } from "./EditRequestForm";
import { FileUploader } from "@/components/FileUploader";



interface RequestListProps {
  requests: MeetingRequest[];
  showFilters?: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  viewMode: "grid" | "table";
}
// מציג רשימה של הבקשות שהוגשו על ידי המשתמש הנוכחי
export function RequestList({ requests, showFilters = true, searchTerm, setSearchTerm, viewMode }: RequestListProps) {
  const { addMeetingSummary, user } = useApp();
  const [selectedRequest, setSelectedRequest] = useState<MeetingRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<MeetingRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [meetingSummaryFile, setMeetingSummaryFile] = useState<Document | null>(null);
  
  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.description && request.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    const matchesUser = user ? request.requesterId === user.id : true;
    
    return matchesSearch && matchesStatus && matchesUser;
  });

  const canEditRequest = (request: MeetingRequest) => {
    return request.status === "pending" && !request.scheduledTime;
  };

  const handleMeetingSummaryChange = (files: Document[]) => {
    if (files.length > 0) {
      setMeetingSummaryFile(files[0]);
    } else {
      setMeetingSummaryFile(null);
    }
  };

  return (
    <div className="space-y-6">
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center"
          >
            <div className="flex flex-col items-center justify-center text-muted-foreground text-center py-8">
              <Calendar className="w-10 h-10 mb-2 text-gray-400" />
              <p className="text-lg font-medium">לא נמצאו בקשות פגישה</p>
              <p className="text-sm mt-1">נסה לשנות את הסינון או ליצור בקשה חדשה</p>
              {/* <Button className="mt-4" onClick={() => setOpen(true)}>
                צור בקשה חדשה
              </Button> */}
            </div>
          </motion.div>
        </div>
      ) : viewMode === "table" ? (
        <div className="rounded-md border">
          <ScrollArea className="h-[500px]" dir="rtl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>כותרת</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>מועד הגשה</TableHead>
                  <TableHead>מועד מבוקש</TableHead>
                  <TableHead>מועד שנקבע</TableHead>
                  <TableHead>מסמכים</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow 
                    key={request.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell><RequestStatusBadge status={request.status} /></TableCell>
                    <TableCell><DateDisplay date={request.createdAt} /></TableCell>
                    <TableCell><DateDisplay date={request.deadline} /></TableCell>

                    <TableCell dir="rtl">
                      {request.scheduledTime && (() => {
                        const d = new Date(request.scheduledTime);
                        const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
                        const [day, month] = d.toLocaleDateString('he-IL').split('.');
                        return (
                          <span className="flex items-center gap-1">
                            <CalendarClock className="w-4 h-4 text-blue-500" />
                            <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold">
                              {time}
                            </span>
                            <span className="rounded-full bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-bold">
                              {day}/{month}
                            </span>
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {request.documents.length > 0 ? (
                        <Badge variant="secondary">{request.documents.length}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">אין</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      ) : (
        <div className="rounded-md border">
          <ScrollArea className="h-[500px]" dir="rtl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate">{request.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {request.status === "scheduled" && request.scheduledTime && (() => {
                          const d = new Date(request.scheduledTime);
                          const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
                          const [day, month] = d.toLocaleDateString('he-IL').split('.');
                          return (
                            <span className="flex items-center gap-1">
                              <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold">
                                {time}
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
                    <CardDescription className="flex items-center mt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span className="mr-1">תאריך הגשה: </span>
                        <DateDisplay date={request.createdAt} />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      {request.description !== undefined && request.description !== null ? (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Info className="h-3.5 w-3.5 mr-1" />
                          <span className="mr-1">תיאור: </span>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {request.description ? request.description : "אין תיאור"}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Info className="h-3.5 w-3.5 mr-1" />
                          <span className="mr-1">תיאור: </span>
                          <p className="text-sm text-muted-foreground line-clamp-2">אין תיאור</p>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <FileText className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="mr-1">מסמכים: </span>
                        </div>
                        <div className="flex flex-col gap-1 pl-5">
                          {request.documents.length > 0 ? (
                            <ScrollArea className="h-[60px] rounded-md">
                              {request.documents.map((doc, index) => (
                                <span key={index} dir="rtl" className="flex flex-col text-xs text-muted-foreground truncate mr-5">
                                  {doc.name}
                                </span>
                              ))}
                            </ScrollArea>
                          ) : (
                            <span dir="rtl" className="text-xs text-muted-foreground mr-5">
                              אין מסמכים
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5 mr-1 text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-gray-400" />

                        <span className="mr-1">מועד מבוקש: </span>
                        <DateDisplay date={request.deadline} className="mr-1" />
                      </div>
                      
                      {request.documents.length > 0 && (
                        <div className="flex items-center mt-1" dir="ltr">
                          <FileText className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                          <Badge variant="secondary" className="text-xs">
                            {request.documents.length} {request.documents.length === 1 ? "מסמך" : "מסמכים"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedRequest(request)}
                      >
                        הצג פרטים
                      </Button>
                      {canEditRequest(request) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRequest(request);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <h4 className="text-sm font-medium mb-1">תיאור</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.description ? selectedRequest.description : "אין תיאור"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">הערות מנהל</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.adminNotes ? selectedRequest.adminNotes : "אין הערות מנהל"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">מועד מבוקש</h4>
                  <DateDisplay date={selectedRequest.deadline} showIcon />
                </div>
                
                {selectedRequest.scheduledTime && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">זמן מתוזמן</h4>
                    <DateDisplay date={selectedRequest.scheduledTime} showIcon showTime />
                  </div>
                )}
                
              </div>

              
              {selectedRequest.status === "ended" && !selectedRequest.meetingSummaryFile && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-4 flex flex-col gap-2">
                  <strong>לתשומת לבך:</strong> טרם הועלה קובץ סיכום פגישה. נא להעלות קובץ סיכום.
                  <FileUploader onFilesChange={handleMeetingSummaryChange} existingFiles={meetingSummaryFile ? [meetingSummaryFile] : []} />
                  <Button
                    className="w-fit mt-2"
                    onClick={async () => {
                      if (meetingSummaryFile) {
                        // Convert Document to File for addMeetingSummary
                        const file = new File([new Blob()], meetingSummaryFile.name, { type: meetingSummaryFile.type });
                        await addMeetingSummary(selectedRequest.id, file);
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
              
              <div>
                <h4 className="text-sm font-medium mb-2">מסמכים</h4>
                {selectedRequest.documents.length > 0 ? (
                  <ScrollArea className="h-[110px] rounded-md border p-2">
                    <ul className="space-y-1">
                      {selectedRequest.documents.map((doc) => (
                        <li 
                          key={doc.id}
                          className="flex items-center p-1 border rounded-md text-sm"
                        >
                          <FileText className="h-4 w-4 ml-2 text-muted-foreground" />
                          <span className="truncate mr-1">{doc.name}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">אין מסמכים</p>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!editingRequest} onOpenChange={(open) => !open && setEditingRequest(null)}>
        {editingRequest && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>עריכת בקשה</DialogTitle>
              <DialogDescription>
                ערוך את פרטי הבקשה שלך
              </DialogDescription>
            </DialogHeader>
            <EditRequestForm
              request={editingRequest}
              onRequestUpdated={() => setEditingRequest(null)}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
