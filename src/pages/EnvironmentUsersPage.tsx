// EnvironmentUsersPage
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Plus, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { userService } from "@/services/userService";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserRole } from "@/types";
import { authService } from "@/services/authService";

export default function EnvironmentUsersPage() {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    employeeId: "",
    role: "regular" as UserRole,
  });

  useEffect(() => {
    if (currentWorkspace) {
      loadEnvironmentUsers();
    }
  }, [currentWorkspace]);

  const loadEnvironmentUsers = async () => {
    if (!currentWorkspace) return;

    try {
      setIsLoading(true);
      const workspaceUsers = await userService.getWorkspaceUsers(currentWorkspace.id);
      const allUsers = await userService.getAllUsers();
      // Merge details from allUsers into workspaceUsers by employeeId
      const mergedUsers = workspaceUsers.map(wsUser => {
        const fullUser = allUsers.find(u => u.employeeId === wsUser.employeeId);
        return fullUser ? { ...fullUser, workspaceAccess: wsUser.workspaceAccess } : wsUser;
      });
      setUsers(mergedUsers);
    } catch (error) {
      console.error("Error loading environment users:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת משתמשי הסביבה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!currentWorkspace) return;

    try {
      // Check if user exists in main system
      let existingUser = await userService.getUserByEmployeeId(newUser.employeeId);
      if (existingUser) {
        // Update their workspaceAccess if not already present
        const hasAccess = existingUser.workspaceAccess.some(
          wa => wa.workspaceId === currentWorkspace.id
        );
        if (!hasAccess) {
          existingUser.workspaceAccess.push({
            workspaceId: currentWorkspace.id,
            role: newUser.role
          });
          // Update user in main user list
          const allUsers = await userService.getAllUsers();
          const updatedUsers = allUsers.map(u =>
            u.employeeId === existingUser.employeeId ? existingUser : u
          );
          await userService.updateAllUsers(updatedUsers);
        }
      } else {
        // Create a new user with minimal details
        const newUserObj = {
          id: `user-${Date.now()}`,
          employeeId: newUser.employeeId,
          name: newUser.employeeId, // Or prompt for name/email if desired
          email: "",
          department: "",
          status: "active" as const,
          lastLogin: new Date().toLocaleString(),
          globalRole: "regular" as UserRole,
          workspaceAccess: [{ workspaceId: currentWorkspace.id, role: newUser.role }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const allUsers = await userService.getAllUsers();
        await userService.updateAllUsers([...allUsers, newUserObj]);
      }

      // Reload users
      await loadEnvironmentUsers();

      // Reset form
      setNewUser({
        employeeId: "",
        role: "regular",
      });
      setIsAddUserDialogOpen(false);

      toast({
        title: "משתמש נוסף",
        description: "המשתמש נוסף לסביבה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת המשתמש",
        variant: "destructive",
      });
    }
  };

  const handleRemoveUser = async (employeeId: string) => {
    if (!currentWorkspace) return;

    try {
      await userService.removeUserFromWorkspace(employeeId, currentWorkspace.id);
      await loadEnvironmentUsers();

      toast({
        title: "משתמש הוסר",
        description: "המשתמש הוסר מהסביבה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהסרת המשתמש",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserRole = async (employeeId: string, newRole: UserRole) => {
    if (!currentWorkspace) return;

    try {
      // First update the workspace role
      await userService.addUserToWorkspace(employeeId, currentWorkspace.id, newRole);

      // Then update the global role to match
      const allUsers = await userService.getAllUsers();
      const user = allUsers.find(u => u.employeeId === employeeId);
      if (user) {
        // Update the user's global role to match the new workspace role
        const updatedUser = {
          ...user,
          globalRole: newRole,
          updatedAt: new Date().toISOString()
        };
        const updatedUsers = allUsers.map(u => 
          u.employeeId === employeeId ? updatedUser : u
        );
        await userService.updateAllUsers(updatedUsers);
      }

      await loadEnvironmentUsers();

      toast({
        title: "תפקיד עודכן",
        description: "תפקיד המשתמש עודכן בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון תפקיד המשתמש",
        variant: "destructive",
      });
    }
  };

  const getUserWorkspaceRole = (user: User): UserRole | null => {
    if (!currentWorkspace) {
      console.log('getUserWorkspaceRole: currentWorkspace is null');
      return null;
    }
    if (!user || !user.workspaceAccess) {
      console.log('getUserWorkspaceRole: user or user.workspaceAccess is invalid', { user });
      return null;
    }
    const workspaceAccess = user.workspaceAccess.find(wa => wa.workspaceId === currentWorkspace.id);
    return workspaceAccess?.role || null;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employeeId.includes(searchQuery);
    
    const userRole = getUserWorkspaceRole(user);
    const matchesRole = roleFilter === "all" || userRole === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש משתמשים..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 max-w-[300px]"
                />
              </div>

              <Select
                dir="rtl"
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="סינון לפי תפקיד" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל התפקידים</SelectItem>
                  <SelectItem value="administrator">מנהלים</SelectItem>
                  <SelectItem value="regular">משתמשים רגילים</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  הוספת משתמש
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>הוספת משתמש לסביבה</DialogTitle>
                  <DialogDescription>
                    הזן את מספר העובד של המשתמש שברצונך להוסיף
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="employeeId">מספר עובד</Label>
                    <Input
                      id="employeeId"
                      value={newUser.employeeId}
                      onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">תפקיד</Label>
                    <Select
                      dir="rtl"
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר תפקיד" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrator">מנהל</SelectItem>
                        <SelectItem value="regular">משתמש רגיל</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleAddUser}>הוספה</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[450px]" dir="rtl">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 col-span-full text-muted-foreground text-center">
                <Users className="w-10 h-10 mb-2 text-gray-400" />
                <p className="text-lg font-medium">לא נמצאו משתמשים</p>
                <p className="text-sm mt-1">נסה לשנות את הסינון או להוסיף משתמש חדש</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>אימייל</TableHead>
                    <TableHead>מחלקה</TableHead>
                    <TableHead>מספר עובד</TableHead>
                    <TableHead>תפקיד</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const userRole = getUserWorkspaceRole(user);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{user.employeeId}</TableCell>
                        <TableCell>
                          <Select
                            dir="rtl"
                            value={userRole || "regular"}
                            onValueChange={(value) => handleUpdateUserRole(user.employeeId, value as UserRole)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue>
                                <Badge variant={userRole === "administrator" ? "default" : "secondary"}>
                                  {userRole === "administrator" ? "מנהל" : "משתמש רגיל"}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="administrator">מנהל</SelectItem>
                              <SelectItem value="regular">משתמש רגיל</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>
                            {user.status === "active" ? "פעיל" : "לא פעיל"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveUser(user.employeeId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 