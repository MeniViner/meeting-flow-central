import { useApp } from "@/contexts/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRequestForm } from "@/components/user/CreateRequestForm";
import { RequestList } from "@/components/user/RequestList";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MeetingRequests() {
  const { requests } = useApp();
  const [open, setOpen] = useState(false);
  
  // Group requests by status
  const pendingRequests = requests.filter(r => r.status === "pending");
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
          <TabsTrigger value="scheduled">מתוזמנות ({scheduledRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">הושלמו ({completedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">נדחו ({rejectedRequests.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="flex justify-end mb-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>
                  צור בקשה חדשה
                </Button>
              </DialogTrigger>
              <DialogContent>
                <CreateRequestForm onRequestCreated={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
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
      </Tabs>
    </div>
  );
}
