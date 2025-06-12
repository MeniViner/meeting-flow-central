// src/pages/LandingPage.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Building2, Calendar, Users, Shield } from "lucide-react";
import { WaveAnimation } from "@/components/WaveAnimation";

// SVG Pattern Component
const BackgroundPattern = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
    <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#grid)" />
    </svg>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
  </div>
);

// Animated Gradient Background
const AnimatedGradient = () => (
  <div className="absolute inset-0 -z-20">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-gradient" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-background via-background/95 to-background/90" />
  </div>
);

export function LandingPage() {
  const { workspaces } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    department: "",
    requestedWorkspaceId: "",
    reason: "",
    spsClaimId: ""
  });
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const handleEmployeeIdChange = async (employeeId: string) => {
    setFormData(prev => ({ ...prev, employeeId }));
    
    // Only proceed if we have a complete employee ID
    if (employeeId.length >= 7) { // Assuming employee IDs are at least 7 digits
      try {
        const userInfo = await authService.getCurrentUser();
        if (userInfo) {
          // Check if the employee ID matches
          const employeeIdFromSharePoint = userInfo.employeeId; // Make sure this matches your SharePoint field
          if (employeeIdFromSharePoint === employeeId) {
            setFormData(prev => ({
              ...prev,
              name: userInfo.fullName,
              email: userInfo.email,
              spsClaimId: userInfo.spsClaimId,
              department: userInfo.department || "" // Add department if available in SharePoint
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = await authService.getCurrentUser();
        if (userInfo) {
          setFormData(prev => ({
            ...prev,
            name: userInfo.fullName,
            email: userInfo.email,
            spsClaimId: userInfo.spsClaimId
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (showForm) {
      fetchUserData();
    }
  }, [showForm]);

  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const userInfo = await authService.getCurrentUser();
        if (userInfo) {
          const existingUser = await userService.getUserBySPSClaimId(userInfo.spsClaimId);
          setIsExistingUser(!!existingUser);
        }
      } catch (error) {
        console.error("Error checking existing user:", error);
      }
    };

    checkExistingUser();
  }, []);

  const handleGetIn = () => {
    navigate("/dashboard"); // or wherever you want to redirect existing users
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const existingUser = await userService.getUserByEmployeeId(formData.employeeId);
      if (existingUser) {
        toast({
          title: "משתמש קיים",
          description: "המשתמש כבר קיים במערכת. אנא פנה למנהל לקבלת הרשאות.",
          variant: "destructive"
        });
        return;
      }

      await userService.createAccessRequest({
        ...formData,
        spsClaimId: formData.spsClaimId || "dev-mode"
      });

      toast({
        title: "בקשת הגישה נשלחה",
        description: "תקבל התראה כאשר הבקשה תאושר."
      });

      setFormData({
        employeeId: "",
        name: "",
        email: "",
        department: "",
        reason: "",
        requestedWorkspaceId: "",
        spsClaimId: ""
      });
      setShowForm(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    setActiveCard(index);
  };

  const handleMouseLeave = () => {
    setActiveCard(null);
  };

  return (
    <div className="bg-gradient-to-b from-background via-background/95 to-muted/50 relative" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-[200px] z-10 relative">
        {/* Header */}
        <header className="flex flex-col lg:flex-row items-center justify-between mb-0 gap-6">
          <div className="flex items-center gap-4">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mafhash-tag.png/330px-Mafhash-tag.png" 
                alt="מערכת ניהול פגישות" 
                className="h-12 w-auto"
              />
            </a>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                ברוכים הבאים למשילות
              </h1>
              <p className="text-muted-foreground">
                <span className="font-bold">מ</span>ערכת <span className="font-bold">ש</span>ליטה <span className="font-bold">ל</span>דיונים <span className="font-bold">ו</span>פגישו<span className="font-bold">ת</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Mazi_IDF_Symbol.svg/330px-Mazi_IDF_Symbol.svg.png" alt="Logo 1" className="h-16" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mafhash-tag.png/330px-Mafhash-tag.png" alt="Logo 2" className="h-16" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/IDF_GOC_Army_Headquarters_From_2020_%28Alternative%29.svg/330px-IDF_GOC_Army_Headquarters_From_2020_%28Alternative%29.svg.png" alt="Logo 3" className="h-16" />
          </div>
        </header>

        {/* Welcome + Features */}
        {!showForm && (
          <>
            <div className="max-w-5xl mx-auto text-center mb-16">
            </div>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {[
                {
                  icon: Building2,
                  title: "ניהול פגישות חכם",
                  desc: "תיאום פגישות אוטומטי, מעקב סטטוס, ניהול משתתפים, ותזכורות חכמות. תמיכה במפגשים היברידיים וסינכרון עם Outlook",
                  features: ["תיאום אוטומטי", "מעקב סטטוס", "תזכורות חכמות", "סינכרון Outlook"],
                  color: "blue"
                },
                {
                  icon: Users,
                  title: "ניהול ידע ומסמכים",
                  desc: "ארכיון דיגיטלי מאובטח, מעקב גרסאות, שיתוף מסמכים מבוקר, ותיעוד החלטות פגישות. תמיכה במגוון פורמטים",
                  features: ["ארכיון דיגיטלי", "מעקב גרסאות", "שיתוף מבוקר", "תיעוד החלטות"],
                  color: "blue"
                },
                {
                  icon: Shield,
                  title: "מעקב ובקרה",
                  desc: "דוחות ביצוע, ניתוח נתונים, מעקב אחר החלטות, ומערכת התראות חכמה. שמירה על רצף ידע ארגוני",
                  features: ["דוחות ביצוע", "ניתוח נתונים", "מעקב החלטות", "התראות חכמות"],
                  color: "blue"
                }
              ].map(({ icon: Icon, title, desc, features, color }, i) => (
                <Card
                  key={i}
                  className="group p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 relative overflow-hidden hover:scale-[1.02]"
                  onMouseMove={(e) => handleMouseMove(e, i)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Mouse tracking gradient effect */}
                  {activeCard === i && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 dark:from-blue-500/10 dark:to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
                            hsl(var(--primary) / 0.2) 0%, 
                            transparent 50%)`
                        }}
                      />
                    </>
                  )}
                  {/* Content */}
                  <div className="relative flex flex-col items-center gap-4 z-10">
                    <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl font-bold text-center">{title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-center mb-4">
                      {desc}
                    </CardDescription>
                    <div className="w-full space-y-2">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </section>
          </>
        )}

        {/* Access Button */}
        {!showForm && (
          <div className="max-w-xl mx-auto mb-12">
            <Button 
              size="lg" 
              className="w-full text-lg"
              onClick={isExistingUser ? handleGetIn : () => setShowForm(true)}
            >
              {isExistingUser ? "כניסה למערכת" : "בקשת גישה למערכת"}
            </Button>
          </div>
        )}

        {/* Access Form */}
        {showForm && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold">בקשת גישה</CardTitle>
                <CardDescription>מלא את פרטיך כדי לבקש גישה למרחב עבודה</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: "employeeId", label: "מספר אישי", type: "text" },
                    { id: "name", label: "שם", type: "text" },
                    { id: "email", label: "מייל", type: "email" },
                    { id: "department", label: "מחלקה", type: "text" },
                  ].map(({ id, label, type }) => (
                    <div className="space-y-2" key={id}>
                      <Label htmlFor={id}>{label}</Label>
                      <Input
                        id={id}
                        type={type}
                        value={(formData as any)[id]}
                        onChange={(e) => {
                          if (id === "employeeId") {
                            handleEmployeeIdChange(e.target.value);
                          } else {
                            setFormData(prev => ({ ...prev, [id]: e.target.value }));
                          }
                        }}
                        required
                      />
                    </div>
                  ))}

                  {/* Reason and Workspace on the same line */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="reason">סיבת הבקשה</Label>
                      <Input
                        id="reason"
                        type="text"
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workspace">מרחב עבודה</Label>
                      <Select
                        value={formData.requestedWorkspaceId}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, requestedWorkspaceId: val }))}
                        required
                        dir="rtl"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחר מרחב עבודה" />
                        </SelectTrigger>
                        <SelectContent>
                          {workspaces.map(ws => (
                            <SelectItem key={ws.id} value={ws.id}>
                              <div className="flex flex-col gap-1">
                                {ws.shortName}
                                <span className="text-xs text-muted-foreground">
                                {ws.longName}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-3">
                    <Button type="button" variant="outline" className="w-full" onClick={() => setShowForm(false)}>
                      ביטול
                    </Button>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "שולח..." : "שלח בקשה"}
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-muted-foreground">
                לאחר אישור, תקבל התראה בדוא"ל
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
      <WaveAnimation />
    </div>
  );
}
