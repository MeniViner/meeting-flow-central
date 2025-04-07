
import { useApp } from "@/contexts/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRequestForm } from "@/components/user/CreateRequestForm";
import { RequestList } from "@/components/user/RequestList";

export default function MeetingRequests() {
  const { requests } = useApp();
  
  // Group requests by status
  const pendingRequests = requests.filter(r => r.status === "pending");
  const approvedRequests = requests.filter(r => r.status === "approved");
  const scheduledRequests = requests.filter(r => r.status === "scheduled");
  const completedRequests = requests.filter(r => r.status === "completed");
  const rejectedRequests = requests.filter(r => r.status === "rejected");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">בקשות פגישה</h1>
        <p className="text-muted-foreground">
          הגש ונהל את בקשות הפגישה שלך
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">כל הבקשות</TabsTrigger>
          <TabsTrigger value="pending">ממתינות ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">מאושרות ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="scheduled">מתוזמנות ({scheduledRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">הושלמו ({completedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">נדחו ({rejectedRequests.length})</TabsTrigger>
          <TabsTrigger value="create">בקשה חדשה</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>כל בקשות הפגישה</CardTitle>
              <CardDescription>צפה בכל בקשות הפגישה שהוגשו</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={requests} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>בקשות ממתינות</CardTitle>
              <CardDescription>בקשות בהמתנה לאישור</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={pendingRequests} showFilters={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>בקשות מאושרות</CardTitle>
              <CardDescription>בקשות שאושרו וממתינות לתזמון</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={approvedRequests} showFilters={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>פגישות מתוזמנות</CardTitle>
              <CardDescription>בקשות שתוזמנו לזמן מסוים</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={scheduledRequests} showFilters={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>פגישות שהושלמו</CardTitle>
              <CardDescription>פגישות שהסתיימו</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={completedRequests} showFilters={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>בקשות שנדחו</CardTitle>
              <CardDescription>בקשות שנדחו</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={rejectedRequests} showFilters={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>צור בקשת פגישה חדשה</CardTitle>
              <CardDescription>מלא את הטופס כדי להגיש בקשת פגישה חדשה</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateRequestForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
