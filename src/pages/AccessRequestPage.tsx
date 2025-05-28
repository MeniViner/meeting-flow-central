import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { userService } from "@/services/userService";
import { Calendar } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function AccessRequestPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    reason: "",
    employeeId: "",
    spsClaimId: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) {
      toast({
        title: "שגיאה",
        description: "לא נבחר מרחב עבודה",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user already exists in the system
      const existingUser = await userService.getUserByEmployeeId(formData.employeeId);
      
      // Create access request
      await userService.createAccessRequest({
        employeeId: formData.employeeId,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        requestedWorkspaceId: currentWorkspace.id,
        reason: formData.reason,
        spsClaimId: formData.spsClaimId
      });

      toast({
        title: "בקשת הגישה נשלחה",
        description: "בקשת הגישה שלך נשלחה בהצלחה. נציגנו יבדוק אותה בהקדם.",
      });

      // Redirect to landing page
      navigate("/landing");

      // Clear form
      setFormData({
        name: "",
        email: "",
        department: "",
        reason: "",
        employeeId: "",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת בקשת הגישה",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 flex-col sm:flex-row gap-6 sm:gap-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">מערכת ניהול פגישות</h1>
              <p className="text-muted-foreground">מערכת לניהול פגישות וזמנים</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Mazi_IDF_Symbol.svg/330px-Mazi_IDF_Symbol.svg.png" alt="Logo 1" className="h-16" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mafhash-tag.png/330px-Mafhash-tag.png" alt="Logo 2" className="h-16" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/IDF_GOC_Army_Headquarters_From_2020_%28Alternative%29.svg/330px-IDF_GOC_Army_Headquarters_From_2020_%28Alternative%29.svg.png" alt="Logo 3" className="h-16" />
          </div>
        </header>

        {/* טופס */}
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>בקשת גישה למערכת</CardTitle>
              <CardDescription>
                מלא את הטופס הבא כדי לבקש גישה למערכת. נציגנו יבדוק את בקשתך בהקדם.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="employeeId">מספר עובד</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">שם מלא</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">אימייל</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">מחלקה</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="reason">סיבת הבקשה</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/")}>
                    ביטול
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "שולח..." : "שלח בקשה"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 