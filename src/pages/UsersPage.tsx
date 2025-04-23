import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Plus, Filter } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/components/ui/use-toast";
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

type UserRole = "admin" | "editor" | "viewer";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  lastLogin: string;
}

export default function UsersPage() {
  const { currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "viewer" as UserRole,
  });
  
  // Mock data - replace with actual data from your backend
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "ישראל ישראלי",
      email: "israel@example.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-03-20 10:30",
    },
    {
      id: "2",
      name: "שרה כהן",
      email: "sarah@example.com",
      role: "editor",
      status: "active",
      lastLogin: "2024-03-19 15:45",
    },
    {
      id: "3",
      name: "דוד לוי",
      email: "david@example.com",
      role: "viewer",
      status: "inactive",
      lastLogin: "2024-03-15 09:20",
    },
  ]);

  const handleEditUser = (userId: string) => {
    // Navigate to user edit page or open edit modal
    toast({
      title: "עריכת משתמש",
      description: `מעבר לעריכת משתמש ${userId}`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    // Show confirmation dialog and delete user
    toast({
      title: "מחיקת משתמש",
      description: `מחיקת משתמש ${userId}`,
    });
  };

  const handleAddUser = () => {
    // Add new user to the list
    const newUserWithId = {
      ...newUser,
      id: (users.length + 1).toString(),
      status: "active" as const,
      lastLogin: new Date().toLocaleString(),
    };
    
    setUsers([...users, newUserWithId]);
    setNewUser({ name: "", email: "", role: "viewer" });
    setIsAddUserDialogOpen(false);
    
    toast({
      title: "משתמש נוסף",
      description: "המשתמש החדש נוסף בהצלחה",
    });
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    
    toast({
      title: "תפקיד עודכן",
      description: "תפקיד המשתמש עודכן בהצלחה",
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.includes(searchQuery) || 
      user.email.includes(searchQuery);
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "default";
      case "editor":
        return "secondary";
      case "viewer":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "מנהל";
      case "editor":
        return "עורך";
      case "viewer":
        return "צופה";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ניהול משתמשים</h1>
        <p className="text-muted-foreground">
          ניהול משתמשים והרשאות במערכת
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>משתמשים</CardTitle>
              <CardDescription>
                רשימת כל המשתמשים במערכת
              </CardDescription>
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
                    <Label htmlFor="role">תפקיד</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר תפקיד" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">מנהל</SelectItem>
                        <SelectItem value="editor">עורך</SelectItem>
                        <SelectItem value="viewer">צופה</SelectItem>
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
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש משתמשים..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as UserRole | "all")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="סינון לפי תפקיד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל התפקידים</SelectItem>
                <SelectItem value="admin">מנהלים</SelectItem>
                <SelectItem value="editor">עורכים</SelectItem>
                <SelectItem value="viewer">צופים</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>אימייל</TableHead>
                  <TableHead>תפקיד</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>כניסה אחרונה</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">מנהל</SelectItem>
                          <SelectItem value="editor">עורך</SelectItem>
                          <SelectItem value="viewer">צופה</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "destructive"}>
                        {user.status === "active" ? "פעיל" : "לא פעיל"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user.id)}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 