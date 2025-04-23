import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Users, Lock, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/components/ui/use-toast";

export default function PermissionsPage() {
  const { currentUser } = useApp();
  const [userPermissions, setUserPermissions] = useState({
    canCreateMeetings: true,
    canEditMeetings: true,
    canDeleteMeetings: false,
    canManageUsers: false,
  });
  
  const [rolePermissions, setRolePermissions] = useState({
    admin: {
      canCreateMeetings: true,
      canEditMeetings: true,
      canDeleteMeetings: true,
      canManageUsers: true,
    },
    user: {
      canCreateMeetings: true,
      canEditMeetings: true,
      canDeleteMeetings: false,
      canManageUsers: false,
    }
  });
  
  const handleSavePermissions = () => {
    toast({
      title: "הרשאות עודכנו",
      description: "הרשאות המשתמש נשמרו בהצלחה.",
    });
  };
  
  const handleSaveRolePermissions = () => {
    toast({
      title: "הרשאות תפקידים עודכנו",
      description: "הרשאות התפקידים נשמרו בהצלחה.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ניהול הרשאות</h1>
        <p className="text-muted-foreground">
          ניהול הרשאות משתמשים ותפקידים במערכת
        </p>
      </div>
      
      <Tabs defaultValue="user-permissions">
        <TabsList>
          <TabsTrigger value="user-permissions">
            <User className="h-4 w-4 mr-2" />
            הרשאות משתמש
          </TabsTrigger>
          <TabsTrigger value="role-permissions">
            <Shield className="h-4 w-4 mr-2" />
            הרשאות תפקידים
          </TabsTrigger>
          <TabsTrigger value="access-control">
            <Lock className="h-4 w-4 mr-2" />
            בקרת גישה
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="user-permissions">
          <Card>
            <CardHeader>
              <CardTitle>הרשאות משתמש</CardTitle>
              <CardDescription>
                הגדרת הרשאות למשתמש הנוכחי
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-3xl mr-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <Switch 
                    id="create-meetings" 
                    checked={userPermissions.canCreateMeetings}
                    onCheckedChange={(checked) => 
                      setUserPermissions({...userPermissions, canCreateMeetings: checked})
                    }
                  />
                  <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                    <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="create-meetings" className="text-base font-medium block">יצירת פגישות</Label>
                      <p className="text-sm text-muted-foreground">אפשרות ליצור פגישות חדשות במערכת</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <Switch 
                    id="edit-meetings" 
                    checked={userPermissions.canEditMeetings}
                    onCheckedChange={(checked) => 
                      setUserPermissions({...userPermissions, canEditMeetings: checked})
                    }
                  />
                  <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                    <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                      <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="edit-meetings" className="text-base font-medium block">עריכת פגישות</Label>
                      <p className="text-sm text-muted-foreground">אפשרות לערוך פגישות קיימות</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <Switch 
                    id="delete-meetings" 
                    checked={userPermissions.canDeleteMeetings}
                    onCheckedChange={(checked) => 
                      setUserPermissions({...userPermissions, canDeleteMeetings: checked})
                    }
                  />
                  <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                    <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                      <Trash2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="delete-meetings" className="text-base font-medium block">מחיקת פגישות</Label>
                      <p className="text-sm text-muted-foreground">אפשרות למחוק פגישות קיימות</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <Switch 
                    id="manage-users" 
                    checked={userPermissions.canManageUsers}
                    onCheckedChange={(checked) => 
                      setUserPermissions({...userPermissions, canManageUsers: checked})
                    }
                  />
                  <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                    <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="manage-users" className="text-base font-medium block">ניהול משתמשים</Label>
                      <p className="text-sm text-muted-foreground">אפשרות לנהל משתמשים במערכת</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePermissions}>שמירת הרשאות</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="role-permissions">
          <Card>
            <CardHeader>
              <CardTitle>הרשאות תפקידים</CardTitle>
              <CardDescription>
                הגדרת הרשאות לתפקידים במערכת
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-3xl mr-auto">
              <div>
                <div className="flex items-center gap-2 mb-4 justify-end">
                  <h3 className="text-lg font-medium">הרשאות מנהל</h3>
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Switch 
                      id="admin-create-meetings" 
                      checked={rolePermissions.admin.canCreateMeetings}
                      onCheckedChange={(checked) => 
                        setRolePermissions({
                          ...rolePermissions,
                          admin: {...rolePermissions.admin, canCreateMeetings: checked}
                        })
                      }
                    />
                    <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="admin-create-meetings" className="text-base font-medium block">יצירת פגישות</Label>
                        <p className="text-sm text-muted-foreground">אפשרות ליצור פגישות חדשות במערכת</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Switch 
                      id="admin-edit-meetings" 
                      checked={rolePermissions.admin.canEditMeetings}
                      onCheckedChange={(checked) => 
                        setRolePermissions({
                          ...rolePermissions,
                          admin: {...rolePermissions.admin, canEditMeetings: checked}
                        })
                      }
                    />
                    <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                        <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="admin-edit-meetings" className="text-base font-medium block">עריכת פגישות</Label>
                        <p className="text-sm text-muted-foreground">אפשרות לערוך פגישות קיימות</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Switch 
                      id="admin-delete-meetings" 
                      checked={rolePermissions.admin.canDeleteMeetings}
                      onCheckedChange={(checked) => 
                        setRolePermissions({
                          ...rolePermissions,
                          admin: {...rolePermissions.admin, canDeleteMeetings: checked}
                        })
                      }
                    />
                    <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                        <Trash2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="admin-delete-meetings" className="text-base font-medium block">מחיקת פגישות</Label>
                        <p className="text-sm text-muted-foreground">אפשרות למחוק פגישות קיימות</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Switch 
                      id="admin-manage-users" 
                      checked={rolePermissions.admin.canManageUsers}
                      onCheckedChange={(checked) => 
                        setRolePermissions({
                          ...rolePermissions,
                          admin: {...rolePermissions.admin, canManageUsers: checked}
                        })
                      }
                    />
                    <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="admin-manage-users" className="text-base font-medium block">ניהול משתמשים</Label>
                        <p className="text-sm text-muted-foreground">אפשרות לנהל משתמשים במערכת</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-4 justify-end">
                  <h3 className="text-lg font-medium">הרשאות משתמש רגיל</h3>
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Switch 
                      id="user-create-meetings" 
                      checked={rolePermissions.user.canCreateMeetings}
                      onCheckedChange={(checked) => 
                        setRolePermissions({
                          ...rolePermissions,
                          user: {...rolePermissions.user, canCreateMeetings: checked}
                        })
                      }
                    />
                    <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="user-create-meetings" className="text-base font-medium block">יצירת פגישות</Label>
                        <p className="text-sm text-muted-foreground">אפשרות ליצור פגישות חדשות במערכת</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Switch 
                      id="user-edit-meetings" 
                      checked={rolePermissions.user.canEditMeetings}
                      onCheckedChange={(checked) => 
                        setRolePermissions({
                          ...rolePermissions,
                          user: {...rolePermissions.user, canEditMeetings: checked}
                        })
                      }
                    />
                    <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                        <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="user-edit-meetings" className="text-base font-medium block">עריכת פגישות</Label>
                        <p className="text-sm text-muted-foreground">אפשרות לערוך פגישות קיימות</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Switch 
                      id="user-delete-meetings" 
                      checked={rolePermissions.user.canDeleteMeetings}
                      onCheckedChange={(checked) => 
                        setRolePermissions({
                          ...rolePermissions,
                          user: {...rolePermissions.user, canDeleteMeetings: checked}
                        })
                      }
                    />
                    <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                        <Trash2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="user-delete-meetings" className="text-base font-medium block">מחיקת פגישות</Label>
                        <p className="text-sm text-muted-foreground">אפשרות למחוק פגישות קיימות</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Switch 
                      id="user-manage-users" 
                      checked={rolePermissions.user.canManageUsers}
                      onCheckedChange={(checked) => 
                        setRolePermissions({
                          ...rolePermissions,
                          user: {...rolePermissions.user, canManageUsers: checked}
                        })
                      }
                    />
                    <div className="flex items-center gap-3 flex-row-reverse flex-1 mr-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800/30">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="user-manage-users" className="text-base font-medium block">ניהול משתמשים</Label>
                        <p className="text-sm text-muted-foreground">אפשרות לנהל משתמשים במערכת</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveRolePermissions}>שמירת הרשאות תפקידים</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="access-control">
          <Card>
            <CardHeader>
              <CardTitle>בקרת גישה</CardTitle>
              <CardDescription>
                הגדרות אבטחה ובקרת גישה למערכת
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ip-restriction">הגבלת IP</Label>
                <Input id="ip-restriction" placeholder="הזן כתובות IP מורשות" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-restriction">הגבלת שעות גישה</Label>
                <Input id="time-restriction" placeholder="לדוגמה: 09:00-17:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="2fa">אימות דו-שלבי</Label>
                <Switch id="2fa" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>שמירת הגדרות אבטחה</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 