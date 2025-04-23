import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { CreateRequestForm } from "@/components/user/CreateRequestForm";
import { RequestList } from "@/components/user/RequestList";
import { useState } from "react";
import { Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { requests, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Group requests by status
  const pendingRequests = requests.filter(r => r.status === "pending");
  const scheduledRequests = requests.filter(r => r.status === "scheduled");
  const completedRequests = requests.filter(r => r.status === "completed");
  
  // Find upcoming deadlines
  const upcomingDeadlines = [...requests]
    .filter(r => r.status !== "completed" && r.status !== "rejected")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  // Stats for the dashboard
  const stats = [
    {
      title: "בקשות ממתינות",
      value: pendingRequests.length,
      description: "ממתינות לאישור",
      icon: Clock,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      title: "פגישות מתוזמנות",
      value: scheduledRequests.length,
      description: "מוכנות להתקיים",
      icon: Calendar,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "פגישות שהושלמו",
      value: completedRequests.length,
      description: "הסתיימו בהצלחה",
      icon: CheckCircle,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">לוח בקרה</h1>
        <p className="text-muted-foreground">
          ברוך הבא, {currentUser?.name}!
        </p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="create">יצירת בקשה</TabsTrigger>
          <TabsTrigger value="view">צפייה בבקשות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={cn("p-2 rounded-full", stat.bgColor)}>
                    <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>מועדי סיום מתקרבים</CardTitle>
                <CardDescription>
                  בקשות עם המועדים הקרובים ביותר
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">אין מועדים קרובים</p>
                ) : (
                  <ul className="space-y-4">
                    {upcomingDeadlines.map((request) => (
                      <li key={request.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{request.title}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <time dateTime={request.deadline.toISOString()}>
                              {new Date(request.deadline).toLocaleDateString()}
                            </time>
                          </div>
                        </div>
                        <AlertTriangle 
                          className={cn(
                            "h-4 w-4",
                            new Date(request.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                              ? "text-red-500"
                              : "text-yellow-500"
                          )} 
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>פעילות אחרונה</CardTitle>
                <CardDescription>
                  עדכונים אחרונים על הבקשות שלך
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">אין פעילות אחרונה</p>
                ) : (
                  <ul className="space-y-4">
                    {[...requests]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((request) => (
                        <li key={request.id} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{request.title}</p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              <time dateTime={request.createdAt.toISOString()}>
                                {new Date(request.createdAt).toLocaleDateString()}
                              </time>
                            </div>
                          </div>
                          <span className="text-xs">
                            <span className="sr-only">סטטוס:</span>
                            <span className="capitalize">{request.status}</span>
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>יצירת בקשת פגישה חדשה</CardTitle>
              <CardDescription>
                מלא את הטופס כדי להגיש בקשת פגישה חדשה
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateRequestForm 
                onRequestCreated={() => setActiveTab("overview")} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>בקשות הפגישה שלך</CardTitle>
              <CardDescription>
                צפה ועקוב אחר כל הבקשות שהגשת
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList requests={requests} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
