
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { currentUser } = useApp();
  const [emailNotifications, setEmailNotifications] = useState({
    newRequests: true,
    statusChanges: true,
    meetingReminders: true,
    summaryReminders: false,
  });
  
  const [appNotifications, setAppNotifications] = useState({
    newRequests: true,
    statusChanges: true,
    meetingReminders: true,
    summaryReminders: true,
  });
  
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input 
                  id="role" 
                  value={currentUser?.role === "admin" ? "Administrator" : "Regular User"} 
                  disabled 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-new-requests">New meeting requests</Label>
                    <Switch 
                      id="email-new-requests" 
                      checked={emailNotifications.newRequests}
                      onCheckedChange={(checked) => 
                        setEmailNotifications({...emailNotifications, newRequests: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-status-changes">Request status changes</Label>
                    <Switch 
                      id="email-status-changes" 
                      checked={emailNotifications.statusChanges}
                      onCheckedChange={(checked) => 
                        setEmailNotifications({...emailNotifications, statusChanges: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-meeting-reminders">Meeting reminders</Label>
                    <Switch 
                      id="email-meeting-reminders" 
                      checked={emailNotifications.meetingReminders}
                      onCheckedChange={(checked) => 
                        setEmailNotifications({...emailNotifications, meetingReminders: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-summary-reminders">Summary submission reminders</Label>
                    <Switch 
                      id="email-summary-reminders" 
                      checked={emailNotifications.summaryReminders}
                      onCheckedChange={(checked) => 
                        setEmailNotifications({...emailNotifications, summaryReminders: checked})
                      }
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <h3 className="text-lg font-medium">In-App Notifications</h3>
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-new-requests">New meeting requests</Label>
                    <Switch 
                      id="app-new-requests" 
                      checked={appNotifications.newRequests}
                      onCheckedChange={(checked) => 
                        setAppNotifications({...appNotifications, newRequests: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-status-changes">Request status changes</Label>
                    <Switch 
                      id="app-status-changes" 
                      checked={appNotifications.statusChanges}
                      onCheckedChange={(checked) => 
                        setAppNotifications({...appNotifications, statusChanges: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-meeting-reminders">Meeting reminders</Label>
                    <Switch 
                      id="app-meeting-reminders" 
                      checked={appNotifications.meetingReminders}
                      onCheckedChange={(checked) => 
                        setAppNotifications({...appNotifications, meetingReminders: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-summary-reminders">Summary submission reminders</Label>
                    <Switch 
                      id="app-summary-reminders" 
                      checked={appNotifications.summaryReminders}
                      onCheckedChange={(checked) => 
                        setAppNotifications({...appNotifications, summaryReminders: checked})
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Change Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
