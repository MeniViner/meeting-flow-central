import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, FileText } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  participants: string[];
  status: "upcoming" | "in-progress" | "completed";
  summary?: string;
}

export default function MeetingsPage() {
  const { user } = useApp();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      // TODO: Replace with actual API call
      const mockMeetings: Meeting[] = [
        {
          id: "1",
          title: "פגישת צוות שבועית",
          date: new Date(),
          startTime: "09:00",
          endTime: "10:00",
          participants: ["מנהל צוות", "חבר צוות 1", "חבר צוות 2"],
          status: "upcoming",
        },
        {
          id: "2",
          title: "סקירת פרויקט",
          date: new Date(Date.now() + 86400000),
          startTime: "14:00",
          endTime: "15:30",
          participants: ["מנהל פרויקט", "מנהל צוות", "לקוח"],
          status: "upcoming",
        },
      ];
      setMeetings(mockMeetings);
    } catch (error) {
      console.error("Error loading meetings:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת הפגישות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: Meeting["status"]) => {
    switch (status) {
      case "upcoming":
        return "default";
      case "in-progress":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: Meeting["status"]) => {
    switch (status) {
      case "upcoming":
        return "מתקרב";
      case "in-progress":
        return "בתהליך";
      case "completed":
        return "הושלם";
      default:
        return status;
    }
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">פגישות</h1>
        <p className="text-muted-foreground">
          ניהול ותצוגת פגישות במערכת
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>רשימת פגישות</CardTitle>
          <CardDescription>
            כל הפגישות המתוכננות וההיסטוריה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>כותרת</TableHead>
                <TableHead>תאריך</TableHead>
                <TableHead>שעה</TableHead>
                <TableHead>משתתפים</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>{meeting.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {meeting.date.toLocaleDateString("he-IL")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {meeting.startTime} - {meeting.endTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {meeting.participants.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(meeting.status)}>
                      {getStatusLabel(meeting.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 