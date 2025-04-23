import { useState } from "react";
import { MeetingRequest, RequestStatus } from "@/types";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { DateDisplay } from "@/components/DateDisplay";
import { RequestDetails } from "@/components/admin/RequestDetails";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Calendar, Clock, LayoutGrid, LayoutList } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminRequestListProps {
  requests: MeetingRequest[];
}

export function AdminRequestList({ requests }: AdminRequestListProps) {
  const [selectedRequest, setSelectedRequest] = useState<MeetingRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.description && request.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort requests: pending first, then scheduled, then approved, then completed/rejected
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const statusOrder: Record<RequestStatus, number> = {
      pending: 0,
      scheduled: 1,
      approved: 2,
      completed: 3,
      rejected: 4,
    };
    
    // First sort by status
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    // For the same status, sort by deadline (earliest first)
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>ניהול בקשות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי כותרת, מבקש או תיאור..."
                className="pr-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as RequestStatus | "all")}
                dir="rtl"
              >
                <SelectTrigger className="w-full sm:w-[180px] flex flex-row-reverse justify-end">
                  <SelectValue placeholder="סנן לפי סטטוס"/>
                </SelectTrigger>
                <SelectContent align="end" className="w-full sm:w-[180px]">
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="approved">מאושר</SelectItem>
                  <SelectItem value="scheduled">מתוזמן</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="rejected">נדחה</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1 border rounded-md">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">פעולות</TableHead>
                    <TableHead>מסמכים</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>מועד אחרון</TableHead>
                    <TableHead>מבקש</TableHead>
                    <TableHead className="w-[280px]">כותרת</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        לא נמצאו בקשות.
                      </TableCell>
                    </TableRow>
                  ) :
                    sortedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="text-left">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            צפה
                          </Button>
                        </TableCell>
                        <TableCell>
                          {request.documents.length > 0 ? (
                            <Badge variant="secondary" className="flex items-center w-fit">
                              <FileText className="h-3 w-3 ml-1" />
                              {request.documents.length}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">אין</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <RequestStatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>
                          <DateDisplay date={request.deadline} />
                        </TableCell>
                        <TableCell>{request.requesterName}</TableCell>
                        <TableCell className="font-medium">
                          {request.title}
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedRequests.length === 0 ? (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground">לא נמצאו בקשות.</p>
                </div>
              ) : (
                sortedRequests.map((request) => (
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
                        <div className="flex items-center text-sm">
                          <span className="text-muted-foreground ml-2">מבקש:</span>
                          <span>{request.requesterName}</span>
                        </div>
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
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        {selectedRequest && (
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>פרטי בקשה</DialogTitle>
            </DialogHeader>
            <RequestDetails 
              request={selectedRequest} 
              onStatusChange={() => {
                // Refresh the selected request to show updated status
                setSelectedRequest(null);
              }}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
