import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { CreateRequestForm } from "@/components/user/CreateRequestForm";
import { RequestList } from "@/components/user/RequestList";
import { useState } from "react";
import { Calendar, Clock, CheckCircle, AlertTriangle, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BellOff } from "lucide-react"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"


export default function Dashboard() {
  const { requests, currentUser, notifications, user } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  const [requestTypeTab, setRequestTypeTab] = useState("all");
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Group requests by status
  const pendingRequests = requests.filter(r => r.status === "pending");
  const scheduledRequests = requests.filter(r => r.status === "scheduled");
  const endedRequests = requests.filter(r => r.status === "ended");
  const completedRequests = requests.filter(r => r.status === "completed");
  const rejectedRequests = requests.filter(r => r.status === "rejected");
  
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

  // Filter requests based on selected type
  const filteredRequests = requestTypeTab === "all" 
    ? requests 
    : requests.filter(r => r.status === requestTypeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">לוח בקרה</h1>
        <p className="text-muted-foreground">
          ברוך הבא, {currentUser?.name}!
        </p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList dir="rtl">
          <TabsTrigger value="view">הבקשות שלי</TabsTrigger>
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="notifications">
            התראות
            <Bell className="inline h-4 w-4 mr-5" />
            {notifications.filter(n => !n.read && n.userId === user?.id).length > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">
                {notifications.filter(n => !n.read && n.userId === user?.id).length}
              </span>
            )}
          </TabsTrigger>
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
                            <time dateTime={new Date(request.deadline).toISOString()}>
                              {new Date(request.deadline).toLocaleDateString()}
                            </time>
                          </div>
                        </div>
                        <AlertTriangle 
                          className={cn(
                            "h-4 w-4",
                            new Date(request.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                              ? "text-red-500"
                              : "text-green-500"
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
                              <time dateTime={new Date(request.createdAt).toISOString()}>
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
        
        <TabsContent value="view">
          <Card className="min-h-96">
            <CardHeader className="flex flex-row items-center justify-between">
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
              <div>
                <CardTitle>בקשות הפגישה שלך</CardTitle>
                <CardDescription>צפה ועקוב אחר כל הבקשות שהגשת</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row gap-4 mb-4 items-center w-full">
                <div className="flex-1 min-w-0">
                  <Tabs defaultValue="all" value={requestTypeTab} onValueChange={setRequestTypeTab}>
                    <TabsList dir="rtl">
                      <TabsTrigger value="all">כל הבקשות</TabsTrigger>
                      <TabsTrigger value="pending">ממתינות ({pendingRequests.length})</TabsTrigger>
                      <TabsTrigger value="scheduled">מתוזמנות ({scheduledRequests.length})</TabsTrigger>
                      <TabsTrigger value="ended">הסתיימו ({endedRequests.length})</TabsTrigger>
                      <TabsTrigger value="completed">הושלמו ({completedRequests.length})</TabsTrigger>
                      <TabsTrigger value="rejected">נדחו ({rejectedRequests.length})</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="w-full max-w-40 relative">
                  <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    dir="rtl"
                    placeholder="חפש בקשות..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <RequestList
                requests={
                  requestTypeTab === "all" ? requests :
                  requestTypeTab === "pending" ? pendingRequests :
                  requestTypeTab === "scheduled" ? scheduledRequests :
                  requestTypeTab === "ended" ? endedRequests :
                  requestTypeTab === "completed" ? completedRequests :
                  requestTypeTab === "rejected" ? rejectedRequests :
                  requests
                }
                showFilters={false}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>התראות</CardTitle>
              <CardDescription>כל ההתראות האחרונות שלך</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.filter(n => n.userId === user?.id).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center" dir="rtl">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center"
                  >
                    <BellOff className="w-10 h-10 mb-2 text-gray-400" />
                    <p className="text-lg font-medium">אין התראות חדשות</p>
                    <p className="text-sm mt-1">הכול מעודכן. תחזור לבדוק מאוחר יותר ✨</p>
                  </motion.div>
                </div>

              ) : (
                <ul className="space-y-4">
                  {notifications
                    .filter(n => n.userId === user?.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((notif) => (
                      <li key={notif.id} className={notif.read ? "opacity-70" : "font-bold bg-blue-50 rounded p-2"}>
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-blue-400" />
                          <span>{notif.message}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
