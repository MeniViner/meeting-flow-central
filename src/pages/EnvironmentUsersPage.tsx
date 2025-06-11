// src/pages/EnvironmentUsersPage.tsx
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Plus, Users, Building2, ArrowUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { userService } from "@/services/userService";
import { ScrollArea } from "@/components/ui/scroll-area";
import SortIcon from "@/components/SortIcon";

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
import { useApp } from "@/contexts/AppContext";

type SortField = 'name' | 'email' | 'department' | 'employeeId' | 'globalRole' | 'createdAt' | 'lastLogin';
type SortOrder = 'asc' | 'desc';

export default function EnvironmentUsersPage() {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const { users: allUsers, updateUsers } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    globalRole: "regular",
    department: "",
    employeeId: "",
    workspaceAccess: [],
    status: "active",
  });
  const [editUserDialog, setEditUserDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [editUserDraft, setEditUserDraft] = useState<User | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });

  // Filter users for current workspace
  const workspaceUsers = useMemo(() => {
    if (!currentWorkspace) return [];
    return allUsers.filter(user => 
      user.workspaceAccess.some(wa => wa.workspaceId === currentWorkspace.id)
    );
  }, [allUsers, currentWorkspace]);

  useEffect(() => {
    setIsLoading(false);
  }, [workspaceUsers]);

  const handleAddUser = async () => {
    if (!currentWorkspace) return;
    try {
      const newUserWithId: User = {
        ...newUser,
        id: `user-${Date.now()}`,
        status: "active",
        lastLogin: new Date().toLocaleString(),
        employeeId: newUser.employeeId || `emp-${Date.now()}`,
        globalRole: newUser.globalRole as UserRole,
        workspaceAccess: [{ workspaceId: currentWorkspace.id, role: newUser.globalRole as UserRole }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as User;
      
      const updatedUsers = [...allUsers, newUserWithId];
      await userService.updateAllUsers(updatedUsers);
      updateUsers(updatedUsers);
      
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
      const updatedUsers = allUsers.map(user => {
        if (user.id === userId) {
          // Update the workspace-specific role in workspaceAccess
          const updatedWorkspaceAccess = user.workspaceAccess.map(wa => 
            wa.workspaceId === currentWorkspace?.id 
              ? { ...wa, role: updatedUser.workspaceAccess?.[0]?.role || "regular" }
              : wa
          );
          return { 
            ...user, 
            workspaceAccess: updatedWorkspaceAccess,
            updatedAt: new Date().toISOString() 
          };
        }
        return user;
      });
      await userService.updateAllUsers(updatedUsers);
      updateUsers(updatedUsers);
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
      const user = workspaceUsers.find(u => u.id === userId);
      if (!user || !currentWorkspace) return;
      
      await userService.removeUserFromWorkspace(user.employeeId, currentWorkspace.id);
      const updatedUsers = allUsers.filter(u => u.id !== userId);
      updateUsers(updatedUsers);
      setDeleteConfirmDialog({ open: false, user: null });
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedUsers = (usersToSort: User[]) => {
    return [...usersToSort].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortOrder === "asc" ? 1 : -1;
      return aValue > bValue ? modifier : -modifier;
    });
  };

  const filteredUsers = getSortedUsers(workspaceUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.globalRole === roleFilter;
    const matchesDepartment = !departmentFilter || user.department.toLowerCase().includes(departmentFilter.toLowerCase());
    return matchesSearch && matchesRole && matchesDepartment;
  }));

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
      const updatedUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
      await userService.updateAllUsers(updatedUsers);
      updateUsers(updatedUsers);
      setEditUserDialog({ open: false, user: null });
      toast({ title: "המשתמש עודכן", description: "פרטי המשתמש עודכנו בהצלחה" });
    } catch (error) {
      toast({ title: "שגיאה", description: "אירעה שגיאה בעדכון המשתמש", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">טוען...</div>;
  }

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
        <Building2 className="w-16 h-16 mb-4 text-gray-400" />
        <p className="text-2xl font-semibold mb-2">לא נבחר מרחב עבודה</p>
        <p className="text-lg mb-6">אנא בחר מרחב עבודה מהתפריט בצד, או צור מרחב עבודה חדש.</p>
        {/* Optionally, you could add a button to navigate to the workspaces page or open a creation dialog here */}
      </div>
    );
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
                  <SelectItem value="all">כל התפקידים</SelectItem>
                  <SelectItem value="owner">בעלים</SelectItem>
                  <SelectItem value="administrator">מנהלים</SelectItem>
                  <SelectItem value="editor">עורכים</SelectItem>
                  <SelectItem value="regular">משתמשים רגילים</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="סינון לפי מחלקה"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="max-w-[200px]"
              />
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
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('name')} className="flex items-center">
                        שם
                        <SortIcon active={sortField === 'name'} order={sortOrder} />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('email')} className="flex items-center">
                        אימייל
                        <SortIcon active={sortField === 'email'} order={sortOrder} />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('department')} className="flex items-center">
                        מחלקה
                        <SortIcon active={sortField === 'department'} order={sortOrder} />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('employeeId')} className="flex items-center">
                        מספר עובד
                        <SortIcon active={sortField === 'employeeId'} order={sortOrder} />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('globalRole')} className="flex items-center">
                        תפקיד
                        <SortIcon active={sortField === 'globalRole'} order={sortOrder} />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('createdAt')} className="flex items-center">
                        תאריך יצירה
                        <SortIcon active={sortField === 'createdAt'} order={sortOrder} />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('lastLogin')} className="flex items-center">
                        כניסה אחרונה
                        <SortIcon active={sortField === 'lastLogin'} order={sortOrder} />
                      </Button>
                    </TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.employeeId}</TableCell>
                      <TableCell>
                        <Select
                          dir="rtl"
                          value={user.workspaceAccess.find(wa => wa.workspaceId === currentWorkspace?.id)?.role || "regular"}
                          onValueChange={(value) => handleEditUser(user.id, { globalRole: value as UserRole })}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue>
                              <Badge variant={getRoleBadgeVariant(user.workspaceAccess.find(wa => wa.workspaceId === currentWorkspace?.id)?.role || "regular")}>
                                {getRoleLabel(user.workspaceAccess.find(wa => wa.workspaceId === currentWorkspace?.id)?.role || "regular")}
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
                      <TableCell>{new Date(user.createdAt).toLocaleDateString('he-IL')}</TableCell>
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
                            onClick={() => setDeleteConfirmDialog({ open: true, user })}
                          >
                            <Trash2 className="h-4 w-4" />
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
                value={editUserDraft?.name || ""}
                onChange={e => setEditUserDraft(draft => ({ ...draft!, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">אימייל</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserDraft?.email || ""}
                onChange={e => setEditUserDraft(draft => ({ ...draft!, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">מחלקה</Label>
              <Input
                id="edit-department"
                value={editUserDraft?.department || ""}
                onChange={e => setEditUserDraft(draft => ({ ...draft!, department: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-employeeId">מספר עובד</Label>
              <Input
                id="edit-employeeId"
                value={editUserDraft?.employeeId || ""}
                onChange={e => setEditUserDraft(draft => ({ ...draft!, employeeId: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">תפקיד במרחב העבודה</Label>
              <Select
                dir="rtl"
                value={editUserDraft?.workspaceAccess?.find(wa => wa.workspaceId === currentWorkspace?.id)?.role || "regular"}
                onValueChange={(value) => setEditUserDraft(draft => ({ 
                  ...draft!, 
                  globalRole: value as UserRole // We still use globalRole as the temporary storage for the new role
                }))}
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
            <Button variant="outline" onClick={() => setEditUserDialog({ open: false, user: null })}>
              ביטול
            </Button>
            <Button onClick={saveEditUser}>שמור שינויים</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog.open} onOpenChange={open => setDeleteConfirmDialog({ open, user: open ? deleteConfirmDialog.user : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת משתמש</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את המשתמש {deleteConfirmDialog.user?.name}?
              פעולה זו אינה ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialog({ open: false, user: null })}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirmDialog.user && handleDeleteUser(deleteConfirmDialog.user.id)}>
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 