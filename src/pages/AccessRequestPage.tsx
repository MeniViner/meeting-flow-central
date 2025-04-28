import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { txtStore } from "@/services/txtStore";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  department: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  cardId: string;
}

export default function AccessRequestPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newRequest: AccessRequest = {
        id: `req-${Date.now()}`,
        ...formData,
        status: "pending",
        createdAt: new Date(),
        cardId: "DEV-12345", // In production, this will be the actual card ID
      };

      await txtStore.appendStrictSP("accessRequests", newRequest);

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
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>בקשת גישה למערכת</CardTitle>
          <CardDescription>
            מלא את הטופס הבא כדי לבקש גישה למערכת. נציגנו יבדוק את בקשתך בהקדם.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="grid gap-2">
              <Label htmlFor="reason">סיבת הבקשה</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
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
  );
} 