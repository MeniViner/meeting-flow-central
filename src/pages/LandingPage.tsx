import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, Users, Shield } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">מערכת ניהול פגישות</h1>
              <p className="text-muted-foreground">מערכת לניהול פגישות וזמנים</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <img src="/logo1.png" alt="Logo 1" className="h-8" />
            <img src="/logo2.png" alt="Logo 2" className="h-8" />
            <img src="/logo3.png" alt="Logo 3" className="h-8" />
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">ברוכים הבאים למערכת ניהול הפגישות</h2>
          <p className="text-xl text-muted-foreground mb-8">
            מערכת לניהול פגישות, זמנים ותיאומים בארגון
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Building2 className="w-8 h-8 mb-2" />
              <CardTitle>ניהול פגישות</CardTitle>
              <CardDescription>
                ניהול ותיאום פגישות בצורה יעילה ומאורגנת
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="w-8 h-8 mb-2" />
              <CardTitle>ניהול משתמשים</CardTitle>
              <CardDescription>
                ניהול הרשאות ומשתמשים במערכת
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 mb-2" />
              <CardTitle>אבטחה מתקדמת</CardTitle>
              <CardDescription>
                מערכת מאובטחת עם זיהוי כרטיס חכם
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Request Access */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>בקשת גישה למערכת</CardTitle>
              <CardDescription>
                אינך מורשה לגשת למערכת. אנא מלא את הטופס הבא כדי לבקש גישה.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate("/request-access")}
              >
                שליחת בקשת גישה
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 