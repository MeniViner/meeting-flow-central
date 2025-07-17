// src/pages/Dashboard.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { CreateRequestForm } from "@/components/user/CreateRequestForm";
import { RequestList } from "@/components/user/RequestList";
import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, AlertTriangle, Bell, Search, LayoutGrid, LayoutList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BellOff } from "lucide-react"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FixedTutorialButton } from '@/components/tutorial/FixedTutorialButton';
import { useTutorial, userTutorialPath } from '@/contexts/TutorialContext';


export default function Dashboard() {
  const { requests, notifications, user } = useApp();
  const [activeTab, setActiveTab] = useState("view");
  const [requestTypeTab, setRequestTypeTab] = useState("all");
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const { isActive, currentStep, nextStep } = useTutorial(); // Get tutorial state and functions

  // Effect to advance tutorial when the create request modal opens
  useEffect(() => {
    if (isActive && open && userTutorialPath.steps[currentStep]?.id === 'create-request') {
      // Automatically move to the next step (form explanation)
      nextStep();
    }
  }, [isActive, open, currentStep, nextStep]); // Add dependencies

  // Group requests by status
  const userRequests = requests.filter(r => r.requesterId === user?.id);
  const pendingRequests = userRequests.filter(r => r.status === "pending");
  const scheduledRequests = userRequests.filter(r => r.status === "scheduled");
  const endedRequests = userRequests.filter(r => r.status === "ended");
  const completedRequests = userRequests.filter(r => r.status === "completed");
  const rejectedRequests = userRequests.filter(r => r.status === "rejected");
  
  // Find upcoming deadlines
  const upcomingDeadlines = [...userRequests]
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
    ? userRequests 
    : userRequests.filter(r => r.status === requestTypeTab);

  return (
    <div className="container mx-auto p-6">
      <FixedTutorialButton page="dashboard" />
      
        <div className="flex flex-col gap-4">
          <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab}>
            <TabsList dir="rtl" data-tutorial="dashboard-tabs">
              <TabsTrigger value="view" id="dashboard-tab-view">הבקשות שלי</TabsTrigger>
              <TabsTrigger value="overview" id="dashboard-tab-overview">סקירה כללית</TabsTrigger>
              <TabsTrigger value="notifications" id="dashboard-tab-notifications">
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
                      <ul className="space-y-4" dir="rtl">
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
                      <ul className="space-y-4" dir="rtl">
                        {[...requests]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 5)
                          .map((request) => (
                            <li key={request.id} className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium text-right" dir="rtl">{request.title}</p>
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
                  <div className="flex items-center gap-4">
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button data-tutorial="create-request">
                          צור בקשה חדשה
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <CreateRequestForm onRequestCreated={() => setOpen(false)} />
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div>
                    <CardTitle>בקשות הפגישה שלך</CardTitle>
                    <CardDescription>צפה ועקוב אחר כל הבקשות שהגשת</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-row gap-4 mb-4 items-center w-full">
                    <div className="flex-1 min-w-0">
                      <Tabs defaultValue="all" value={requestTypeTab} onValueChange={setRequestTypeTab}>
                        <TabsList dir="rtl" data-tutorial="dashboard-filters">
                          <TabsTrigger value="all">כל הבקשות</TabsTrigger>
                          <TabsTrigger value="pending">ממתינות ({pendingRequests.length})</TabsTrigger>
                          <TabsTrigger value="scheduled">מתוזמנות ({scheduledRequests.length})</TabsTrigger>
                          <TabsTrigger value="ended">הסתיימו ({endedRequests.length})</TabsTrigger>
                          <TabsTrigger value="completed">הושלמו ({completedRequests.length})</TabsTrigger>
                          <TabsTrigger value="rejected">נדחו ({rejectedRequests.length})</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-full max-w-40">
                        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          dir="rtl"
                          placeholder="חפש בקשות..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-1 border rounded-md" data-tutorial="dashboard-view">
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
                    </div>
                  </div>
                  <RequestList
                    requests={filteredRequests}
                    viewMode={viewMode}
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
                <CardContent dir="rtl">
                  {notifications.filter(n => n.userId === user?.id).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center" dir="rtl">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center justify-center"
                      >
                        <BellOff className="w-14 h-14 mb-4 text-blue-200" />
                        <p className="text-xl font-bold">אין התראות חדשות</p>
                        <p className="text-sm mt-2">הכל מעודכן. תחזור לבדוק מאוחר יותר ✨</p>
                      </motion.div>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {notifications
                        .filter(n => n.userId === user?.id)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((notif) => {
                          const d = new Date(notif.createdAt);
                          const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
                          const date = d.toLocaleDateString('he-IL');
                          const formatted = `${time}, ${date}`;
                          return (
                            <li
                              key={notif.id}
                              className={
                                `flex items-center p-4 rounded-lg shadow-sm border transition bg-white relative ` +
                                (notif.read ? 'opacity-70' : 'bg-blue-50 border-blue-200')
                              }
                            >
                              {!notif.read && (
                                <span className="absolute right-0 top-0 h-full w-1 bg-blue-500 rounded-r-lg" />
                              )}
                              <div className="flex-shrink-0 mr-4">
                                <Bell className="h-6 w-6 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col gap-1">
                                {notif.requestName ? (
                                  <span className="text-base font-semibold text-gray-900">
                                    הדיון{' '}
                                    <a href="/" className="text-blue-700 underline hover:text-blue-900 transition font-bold">{notif.requestName}</a>
                                    {' '}<span className="font-normal text-gray-700">תוזמן ל...</span>
                                  </span>
                                ) : (
                                  <span className="text-base text-gray-900">{notif.message}</span>
                                )}
                                <span className="text-xs text-muted-foreground mt-1 self-end">{formatted}</span>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </div>
  );
}
