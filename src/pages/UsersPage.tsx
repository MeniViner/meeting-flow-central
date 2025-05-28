import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Plus, Filter, Users, ChevronDown, Building2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { userService } from "@/services/userService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, UserRole } from "@/types";

export default function UsersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    globalRole: "regular",
    department: "",
    employeeId: "",
    workspaceAccess: [],
    status: "active",
  });
  const { workspaces } = useWorkspace();
  const [workspaceDialogUser, setWorkspaceDialogUser] = useState<User | null>(null);
  const [workspaceAccessDraft, setWorkspaceAccessDraft] = useState<{ [workspaceId: string]: UserRole }>({});
  const [editUserDialog, setEditUserDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [editUserDraft, setEditUserDraft] = useState<Partial<User>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersList = await userService.getAllUsers();
      setUsers(usersList || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת המשתמשים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      const newUserWithId: User = {
        ...newUser,
        id: `user-${Date.now()}`,
        status: "active",
        lastLogin: new Date().toLocaleString(),
        employeeId: newUser.employeeId || `emp-${Date.now()}`,
        globalRole: newUser.globalRole as UserRole,
        workspaceAccess: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as User;
      const allUsers = await userService.getAllUsers();
      await userService.updateAllUsers([...allUsers, newUserWithId]);
      setUsers([...users, newUserWithId]);
      setNewUser({
        name: "",
        email: "",
        globalRole: "regular",
        department: "",
        employeeId: "",
        workspaceAccess: [],
        status: "active",
      });
      setIsAddUserDialogOpen(false);
      toast({
        title: "משתמש נוסף",
        description: "המשתמש החדש נוסף בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת המשתמש",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (userId: string, updatedUser: Partial<User>) => {
    try {
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, ...updatedUser, updatedAt: new Date().toISOString() } : user
      );
      await userService.updateAllUsers(updatedUsers);
      setUsers(updatedUsers);
      toast({
        title: "משתמש עודכן",
        description: "פרטי המשתמש עודכנו בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון המשתמש",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const updatedUsers = users.filter(user => user.id !== userId);
      await userService.updateAllUsers(updatedUsers);
      setUsers(updatedUsers);
      toast({
        title: "משתמש נמחק",
        description: "המשתמש נמחק בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת המשתמש",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.includes(searchQuery) || 
      user.email.includes(searchQuery) ||
      user.department.includes(searchQuery);
    const matchesRole = roleFilter === "all" || user.globalRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "owner":
        return "default";
      case "administrator":
        return "secondary";
      case "regular":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "owner":
        return "בעלים";
      case "administrator":
        return "מנהל";
      case "regular":
        return "משתמש רגיל";
      default:
        return role;
    }
  };

  // Open workspace dialog for a user
  const openWorkspaceDialog = (user: User) => {
    setWorkspaceDialogUser(user);
    // Build draft from user's current access
    const draft: { [workspaceId: string]: UserRole } = {};
    (user.workspaceAccess || []).forEach(wa => {
      draft[wa.workspaceId] = wa.role;
    });
    setWorkspaceAccessDraft(draft);
  };

  // Toggle workspace assignment
  const toggleWorkspace = (workspaceId: string) => {
    setWorkspaceAccessDraft(prev => {
      const newDraft = { ...prev };
      if (newDraft[workspaceId]) {
        delete newDraft[workspaceId];
      } else {
        newDraft[workspaceId] = "regular"; // default role, now matches global UserRole
      }
      return newDraft;
    });
  };

  // Change role for a workspace
  const changeWorkspaceRole = (workspaceId: string, role: UserRole) => {
    setWorkspaceAccessDraft(prev => ({ ...prev, [workspaceId]: role }));
  };

  // Save workspace access changes
  const saveWorkspaceAccess = async () => {
    if (!workspaceDialogUser) return;
    const newAccess = Object.entries(workspaceAccessDraft).map(([workspaceId, role]) => ({ workspaceId, role }));
    try {
      const updatedUser = { ...workspaceDialogUser, workspaceAccess: newAccess, updatedAt: new Date().toISOString() };
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      await userService.updateAllUsers(updatedUsers);
      setUsers(updatedUsers);
      setWorkspaceDialogUser(null);
      toast({ title: "הרשאות עודכנו", description: "הרשאות המשתמש עודכנו בהצלחה" });
    } catch (error) {
      toast({ title: "שגיאה", description: "אירעה שגיאה בעדכון ההרשאות", variant: "destructive" });
    }
  };

  // Open edit dialog for a user
  const openEditUserDialog = (user: User) => {
    setEditUserDraft({ ...user });
    setEditUserDialog({ open: true, user });
  };

  // Save edited user
  const saveEditUser = async () => {
    if (!editUserDialog.user) return;
    try {
      const updatedUser = { ...editUserDialog.user, ...editUserDraft, updatedAt: new Date().toISOString() };
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      await userService.updateAllUsers(updatedUsers);
      setUsers(updatedUsers);
      setEditUserDialog({ open: false, user: null });
      toast({ title: "המשתמש עודכן", description: "פרטי המשתמש עודכנו בהצלחה" });
    } catch (error) {
      toast({ title: "שגיאה", description: "אירעה שגיאה בעדכון המשתמש", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ניהול משתמשים</h1>
          <p className="text-muted-foreground">
            ניהול משתמשים והרשאות במערכת
          </p>
        </div>
      </div> */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* <CardTitle>משתמשים</CardTitle>
              <CardDescription>
                רשימת כל המשתמשים במערכת
              </CardDescription> */}

              <div className="relative flex-1">
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש בכל שדות המשתמשים.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 max-w-[300px]"
                />
              </div>

              <Select
                dir="rtl"
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as UserRole | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="סינון לפי תפקיד" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" >כל התפקידים</SelectItem>
                  <SelectItem value="owner">בעלים</SelectItem>
                  <SelectItem value="administrator">מנהלים</SelectItem>
                  <SelectItem value="editor">עורכים</SelectItem>
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
                  <DialogTitle>הוספת משתמש חדש</DialogTitle>
                  <DialogDescription>
                    הזן את פרטי המשתמש החדש
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">שם</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">אימייל</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">מחלקה</Label>
                    <Input
                      id="department"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">תפקיד</Label>
                    <Select
                      dir="rtl"
                      value={newUser.globalRole}
                      onValueChange={(value) => setNewUser({ ...newUser, globalRole: value as UserRole })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר תפקיד" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">בעלים</SelectItem>
                        <SelectItem value="administrator">מנהל</SelectItem>
                        <SelectItem value="editor">עורך</SelectItem>
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
          {/* <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש בכל שדות המשתמשים.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 max-w-[300px]"
              />
            </div>
            <Select
              dir="rtl"
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as UserRole | "all")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="סינון לפי תפקיד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" >כל התפקידים</SelectItem>
                <SelectItem value="admin">מנהלים</SelectItem>
                <SelectItem value="editor">עורכים</SelectItem>
                <SelectItem value="viewer">צופים</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

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
                    <TableHead>תפקיד</TableHead>
                    <TableHead>כניסה אחרונה</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Select
                          dir="rtl"
                          value={user.globalRole}
                          onValueChange={(value) => handleEditUser(user.id, { globalRole: value as UserRole })}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue>
                              <Badge variant={getRoleBadgeVariant(user.globalRole)}>
                                {getRoleLabel(user.globalRole)}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">בעלים</SelectItem>
                            <SelectItem value="administrator">מנהל</SelectItem>
                            <SelectItem value="editor">עורך</SelectItem>
                            <SelectItem value="regular">משתמש רגיל</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditUserDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openWorkspaceDialog(user)}
                          >
                            {/* ניהול מרחבי עבודה
                            <ChevronDown className="h-4 w-4" /> */}
                            <Building2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={editUserDialog.open} onOpenChange={open => setEditUserDialog({ open, user: open ? editUserDialog.user : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת משתמש</DialogTitle>
            <DialogDescription>עדכן את פרטי המשתמש</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">שם</Label>
              <Input
                id="edit-name"
                value={editUserDraft.name || ""}
                onChange={e => setEditUserDraft(draft => ({ ...draft, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">אימייל</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserDraft.email || ""}
                onChange={e => setEditUserDraft(draft => ({ ...draft, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">מחלקה</Label>
              <Input
                id="edit-department"
                value={editUserDraft.department || ""}
                onChange={e => setEditUserDraft(draft => ({ ...draft, department: e.target.value }))}
              />
            </div>
            <div className="grid gap-2" dir="rtl">
              <Label htmlFor="edit-role">תפקיד גלובלי</Label>
              <Select
                dir="rtl"
                value={editUserDraft.globalRole || "viewer"}
                onValueChange={value => setEditUserDraft(draft => ({ ...draft, globalRole: value as UserRole }))}
              >
                <SelectTrigger >
                  <SelectValue placeholder="בחר תפקיד" />
                </SelectTrigger>
                <SelectContent >
                  <SelectItem value="owner">בעלים</SelectItem>
                  <SelectItem value="administrator">מנהל</SelectItem>
                  <SelectItem value="editor">עורך</SelectItem>
                  <SelectItem value="regular">משתמש רגיל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserDialog({ open: false, user: null })}>ביטול</Button>
            <Button onClick={saveEditUser}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workspace Access Modal */}
      {workspaceDialogUser && (
        <Dialog open={true} onOpenChange={open => { if (!open) setWorkspaceDialogUser(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ניהול מרחבי עבודה עבור {workspaceDialogUser.name}</DialogTitle>
              <DialogDescription>בחר את המרחבים וההרשאות עבור המשתמש</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {workspaces.map(ws => (
                <div key={ws.id} className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={!!workspaceAccessDraft[ws.id]}
                    onChange={() => toggleWorkspace(ws.id)}
                    id={`ws-checkbox-${ws.id}`}
                  />
                  <label htmlFor={`ws-checkbox-${ws.id}`} className="flex-1 cursor-pointer">
                    {ws.longName}
                  </label>
                  {workspaceAccessDraft[ws.id] && (
                    <Select
                      dir="rtl"
                      value={workspaceAccessDraft[ws.id]}
                      onValueChange={role => changeWorkspaceRole(ws.id, role as UserRole)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">בעלים</SelectItem>
                        <SelectItem value="administrator">מנהל</SelectItem>
                        <SelectItem value="editor">עורך</SelectItem>
                        <SelectItem value="regular">משתמש רגיל</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWorkspaceDialogUser(null)}>ביטול</Button>
              <Button onClick={saveWorkspaceAccess}>שמור</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 