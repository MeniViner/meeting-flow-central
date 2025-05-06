// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useWorkspace } from "@/contexts/WorkspaceContext";
// import { userService } from "@/services/userService";
// import { useToast } from "@/components/ui/use-toast";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Building2, Calendar, Users, Shield } from "lucide-react";

// export function LandingPage() {
//   const { workspaces } = useWorkspace();
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     employeeId: "",
//     name: "",
//     email: "",
//     department: "",
//     requestedWorkspaceId: ""
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       // Check if user already exists
//       const existingUser = await userService.getUserByEmployeeId(formData.employeeId);
//       if (existingUser) {
//         toast({
//           title: "משתמש קיים",
//           description: "המשתמש כבר קיים במערכת. אנא פנה למנהל המערכת לקבלת הרשאות.",
//           variant: "destructive"
//         });
//         return;
//       }

//       // Create access request
//       await userService.createAccessRequest({
//         employeeId: formData.employeeId,
//         name: formData.name,
//         email: formData.email,
//         department: formData.department,
//         requestedWorkspaceId: formData.requestedWorkspaceId
//       });

//       toast({
//         title: "בקשת הגישה נשלחה",
//         description: "בקשת הגישה שלך נשלחה בהצלחה. תקבל התראה כאשר הבקשה תאושר."
//       });

//       // Reset form and hide it
//       setFormData({
//         employeeId: "",
//         name: "",
//         email: "",
//         department: "",
//         requestedWorkspaceId: ""
//       });
//       setShowForm(false);
//     } catch (error) {
//       toast({
//         title: "שגיאה",
//         description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
//         variant: "destructive"
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-background to-muted">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <header className="flex items-center justify-between mb-12">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
//               <Calendar className="w-6 h-6 text-primary-foreground" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold">מערכת ניהול פגישות</h1>
//               <p className="text-muted-foreground">מערכת לניהול פגישות וזמנים</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-4">
//             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Mazi_IDF_Symbol.svg/330px-Mazi_IDF_Symbol.svg.png"
//              alt="Logo 1" className="h-16" />
//             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mafhash-tag.png/330px-Mafhash-tag.png"
//              alt="Logo 2" className="h-16" />
//             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/IDF_GOC_Army_Headquarters_From_2020_%28Alternative%29.svg/330px-IDF_GOC_Army_Headquarters_From_2020_%28Alternative%29.svg.png" 
//              alt="Logo 3" className="h-16" />
//           </div>
//         </header>

//         {/* Main Content */}
//         <div className="max-w-4xl mx-auto text-center mb-12">
//           <h2 className="text-4xl font-bold mb-4">ברוכים הבאים למערכת ניהול הפגישות</h2>
//           <p className="text-xl text-muted-foreground mb-8">
//             מערכת לניהול פגישות, זמנים ותיאומים בארגון
//           </p>
//         </div>

//         {/* Features */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//           <Card>
//             <CardHeader>
//               <Building2 className="w-8 h-8 mb-2" />
//               <CardTitle>ניהול פגישות</CardTitle>
//               <CardDescription>
//                 ניהול ותיאום פגישות בצורה יעילה ומאורגנת
//               </CardDescription>
//             </CardHeader>
//           </Card>
//           <Card>
//             <CardHeader>
//               <Users className="w-8 h-8 mb-2" />
//               <CardTitle>ניהול משתמשים</CardTitle>
//               <CardDescription>
//                 ניהול הרשאות ומשתמשים במערכת
//               </CardDescription>
//             </CardHeader>
//           </Card>
//           <Card>
//             <CardHeader>
//               <Shield className="w-8 h-8 mb-2" />
//               <CardTitle>אבטחה מתקדמת</CardTitle>
//               <CardDescription>
//                 מערכת מאובטחת עם זיהוי כרטיס חכם
//               </CardDescription>
//             </CardHeader>
//           </Card>
//         </div>

//         {/* Request Access Button */}
//         {!showForm && (
//           <div className="max-w-2xl mx-auto mb-8">
//             <Button
//               size="lg"
//               className="w-full"
//               onClick={() => setShowForm(true)}
//             >
//               שליחת בקשת גישה
//             </Button>
//           </div>
//         )}

//         {/* Request Access Form */}
//         {showForm && (
//           <div className="max-w-2xl mx-auto">
//             <Card>
//               <CardHeader>
//                 <CardTitle>בקשת גישה למערכת</CardTitle>
//                 <CardDescription>
//                   מלא את הפרטים הבאים כדי לבקש גישה לאחד ממרחבי העבודה
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="employeeId">מספר עובד</Label>
//                     <Input
//                       id="employeeId"
//                       value={formData.employeeId}
//                       onChange={e => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="name">שם מלא</Label>
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="email">דוא"ל</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={formData.email}
//                       onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="department">מחלקה</Label>
//                     <Input
//                       id="department"
//                       value={formData.department}
//                       onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="workspace">מרחב עבודה</Label>
//                     <Select
//                       value={formData.requestedWorkspaceId}
//                       onValueChange={value => setFormData(prev => ({ ...prev, requestedWorkspaceId: value }))}
//                       required
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="בחר מרחב עבודה" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {workspaces.map(workspace => (
//                           <SelectItem key={workspace.id} value={workspace.id}>
//                             {workspace.longName}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="flex gap-2">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       className="w-full"
//                       onClick={() => setShowForm(false)}
//                     >
//                       ביטול
//                     </Button>
//                     <Button type="submit" className="w-full" disabled={isSubmitting}>
//                       {isSubmitting ? "שולח..." : "שלח בקשה"}
//                     </Button>
//                   </div>
//                 </form>
//               </CardContent>
//               <CardFooter className="flex justify-center">
//                 <p className="text-sm text-muted-foreground">
//                   לאחר אישור הבקשה, תקבל התראה בדוא"ל
//                 </p>
//               </CardFooter>
//             </Card>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// } 








import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { userService } from "@/services/userService";
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

export function LandingPage() {
  const { workspaces } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    department: "",
    requestedWorkspaceId: "",
    reason: ""
  });

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

      await userService.createAccessRequest(formData);

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
        requestedWorkspaceId: ""
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted px-4 py-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">מערכת ניהול פגישות</h1>
              <p className="text-muted-foreground">ניהול חכם של זמנים ומשתמשים</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Mazi_IDF_Symbol.svg/330px-Mazi_IDF_Symbol.svg.png" alt="Logo 1" className="h-16" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Mafhash-tag.png/330px-Mafhash-tag.png" alt="Logo 2" className="h-16" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/IDF_GOC_Army_Headquarters_From_2020_%28Alternative%29.svg/330px-IDF_GOC_Army_Headquarters_From_2020_%28Alternative%29.svg.png" alt="Logo 3" className="h-16" />
          </div>
          
        </header>

        {/* Welcome + Features (hidden when form is shown) */}
        {!showForm && (
          <>
            <div className="max-w-5xl mx-auto text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">ברוכים הבאים למערכת ניהול הפגישות</h2>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
                ניהול פגישות, משתמשים ותיאומים חכם ומאובטח
              </p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-center">
              {[
                { icon: Building2, title: "ניהול פגישות", desc: "תיאום פגישות בקלות ובמהירות" },
                { icon: Users, title: "ניהול משתמשים", desc: "שליטה על הרשאות וניהול גישה" },
                { icon: Shield, title: "אבטחה מתקדמת", desc: "גישה מאובטחת באמצעות כרטיס חכם" }
              ].map(({ icon: Icon, title, desc }, i) => (
                <Card key={i} className="group p-6 hover:shadow-xl transition">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-primary/10 text-primary p-4 rounded-full">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                    <CardDescription>{desc}</CardDescription>
                  </div>
                </Card>
              ))}
            </section>
          </>
        )}

        {/* Access Button */}
        {!showForm && (
          <div className="max-w-xl mx-auto mb-12">
            <Button size="lg" className="w-full text-lg" onClick={() => setShowForm(true)}>
              בקשת גישה למערכת
            </Button>
          </div>
        )}

        {/* Access Form */}
        {showForm && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">בקשת גישה</CardTitle>
                <CardDescription>מלא את פרטיך כדי לבקש גישה למרחב עבודה</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: "employeeId", label: "מספר עובד", type: "text" },
                    { id: "name", label: "שם מלא", type: "text" },
                    { id: "email", label: "דוא\"ל", type: "email" },
                    { id: "department", label: "מחלקה", type: "text" },
                  ].map(({ id, label, type }) => (
                    <div className="space-y-2" key={id}>
                      <Label htmlFor={id}>{label}</Label>
                      <Input
                        id={id}
                        type={type}
                        value={(formData as any)[id]}
                        onChange={(e) => setFormData(prev => ({ ...prev, [id]: e.target.value }))}
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
                              {ws.longName}
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
    </div>
  );
}
