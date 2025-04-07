
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
        <h1 className="text-3xl font-bold tracking-tight">Meeting Requests</h1>
        <p className="text-muted-foreground">
          Submit and manage your meeting requests
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Meeting Requests</CardTitle>
              <CardDescription>View all your submitted meeting requests</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={requests} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Requests awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={pendingRequests} showFilters={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Requests</CardTitle>
              <CardDescription>Requests that have been approved and are waiting to be scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={approvedRequests} showFilters={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Meetings</CardTitle>
              <CardDescription>Requests that have been scheduled for a specific time</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={scheduledRequests} showFilters={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Meetings</CardTitle>
              <CardDescription>Meetings that have been completed</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={completedRequests} showFilters={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Requests</CardTitle>
              <CardDescription>Requests that have been rejected</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={rejectedRequests} showFilters={false} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Meeting Request</CardTitle>
              <CardDescription>Fill out the form to submit a new meeting request</CardDescription>
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
