import { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function WorkspacesPage() {
  const { workspaces, setCurrentWorkspace, isLoading, addWorkspace, deleteWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    shortName: "",
    longName: "",
    englishName: "",
    adminEmail: "",
    dataFileUrl: "",
  });

  const handleAddWorkspace = async () => {
    try {
      await addWorkspace(newWorkspace);
      setNewWorkspace({
        shortName: "",
        longName: "",
        englishName: "",
        adminEmail: "",
        dataFileUrl: "",
      });
      setIsAddDialogOpen(false);

      toast({
        title: "סביבת עבודה נוספה",
        description: "סביבת העבודה החדשה נוספה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת סביבת העבודה",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    try {
      await deleteWorkspace(workspaceId);
      toast({
        title: "סביבת עבודה נמחקה",
        description: "סביבת העבודה נמחקה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת סביבת העבודה",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ניהול סביבות עבודה</h1>
          <p className="text-muted-foreground">
            ניהול סביבות העבודה במערכת
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              הוספת סביבת עבודה
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוספת סביבת עבודה חדשה</DialogTitle>
              <DialogDescription>
                הזן את פרטי סביבת העבודה החדשה
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="shortName">שם קצר</Label>
                <Input
                  id="shortName"
                  value={newWorkspace.shortName}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, shortName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longName">שם מלא</Label>
                <Input
                  id="longName"
                  value={newWorkspace.longName}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, longName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="englishName">שם באנגלית</Label>
                <Input
                  id="englishName"
                  value={newWorkspace.englishName}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, englishName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adminEmail">אימייל מנהל</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={newWorkspace.adminEmail}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, adminEmail: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dataFileUrl">קישור לקובץ נתונים</Label>
                <Input
                  id="dataFileUrl"
                  value={newWorkspace.dataFileUrl}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, dataFileUrl: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleAddWorkspace}>הוספה</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>סביבות עבודה</CardTitle>
              <CardDescription>
                רשימת כל סביבות העבודה במערכת
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם קצר</TableHead>
                <TableHead>שם מלא</TableHead>
                <TableHead>שם באנגלית</TableHead>
                <TableHead>אימייל מנהל</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell>{workspace.shortName}</TableCell>
                  <TableCell>{workspace.longName}</TableCell>
                  <TableCell>{workspace.englishName}</TableCell>
                  <TableCell>{workspace.adminEmail}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentWorkspace(workspace)}
                      >
                        <Building2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 