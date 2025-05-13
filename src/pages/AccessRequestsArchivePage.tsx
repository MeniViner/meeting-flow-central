// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/components/ui/use-toast";
// import { txtStore } from "@/services/txtStore";
// import { format } from "date-fns";
// import { he } from "date-fns/locale";
// import { useWorkspace } from "@/contexts/WorkspaceContext";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Users } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// interface AccessRequest {
//   id: string;
//   name: string;
//   email: string;
//   department: string;
//   reason: string;
//   status: "pending" | "approved" | "rejected";
//   createdAt: Date;
//   cardId: string;
//   requestedWorkspaceId?: string;
// }

// export default function AccessRequestsArchivePage() {
//   const { toast } = useToast();
//   const { currentWorkspace } = useWorkspace();
//   const [requests, setRequests] = useState<AccessRequest[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadRequests();
//   }, [currentWorkspace?.id]);

//   const loadRequests = async () => {
//     try {
//       const requestsList = await txtStore.getStrictSP("accessRequests") as AccessRequest[];
//       // Filter by current workspace and status 'approved' or 'rejected'
//       const filtered = currentWorkspace
//         ? (requestsList || []).filter((r: AccessRequest) => r.requestedWorkspaceId === currentWorkspace.id && (r.status === "approved" || r.status === "rejected"))
//         : [];
//       setRequests(filtered);
//     } catch (error) {
//       console.error("Error loading access requests:", error);
//       toast({
//         title: "שגיאה",
//         description: "אירעה שגיאה בטעינת בקשות הגישה",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteRequest = async (requestId: string) => {
//     try {
//       const requestsList = await txtStore.getStrictSP("accessRequests") as AccessRequest[];
//       const updatedRequests = (requestsList || []).filter((r: AccessRequest) => r.id !== requestId);
//       await txtStore.updateStrictSP("accessRequests", updatedRequests);
//       loadRequests();
//       toast({ title: "הבקשה נמחקה", description: "הבקשה נמחקה מהארכיון" });
//     } catch (error) {
//       toast({ title: "שגיאה", description: "אירעה שגיאה במחיקת הבקשה", variant: "destructive" });
//     }
//   };

//   const handleDeleteAll = async () => {
//     try {
//       const requestsList = await txtStore.getStrictSP("accessRequests") as AccessRequest[];
//       const updatedRequests = (requestsList || []).filter((r: AccessRequest) => !(r.requestedWorkspaceId === currentWorkspace?.id && (r.status === "approved" || r.status === "rejected")));
//       await txtStore.updateStrictSP("accessRequests", updatedRequests);
//       loadRequests();
//       toast({ title: "הארכיון נוקה", description: "כל הבקשות מהארכיון נמחקו" });
//     } catch (error) {
//       toast({ title: "שגיאה", description: "אירעה שגיאה במחיקת הארכיון", variant: "destructive" });
//     }
//   };

//   if (isLoading) {
//     return <div>טוען...</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">ארכיון בקשות גישה</h1>
//           <p className="text-muted-foreground">בקשות שאושרו או נדחו</p>
//         </div>
//         <Button variant="outline" onClick={() => navigate("/access-requests")}>חזרה לבקשות ממתינות</Button>
//       </div>
//       <div className="flex justify-end mb-4">
//         <Button variant="destructive" onClick={handleDeleteAll}>מחק את כל הארכיון</Button>
//       </div>
//       <Card>
//         <CardHeader>
//           <div>
//             <CardTitle>בקשות בארכיון</CardTitle>
//             <CardDescription>רשימת כל הבקשות שאושרו או נדחו</CardDescription>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <ScrollArea className="h-[600px]">
//             {requests.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
//                 <Users className="w-10 h-10 mb-2 text-gray-400" />
//                 <p className="text-lg font-medium">אין בקשות בארכיון</p>
//                 <p className="text-sm mt-1">לא נמצאו בקשות מאושרות או שנדחו עבור מרחב העבודה הנוכחי</p>
//               </div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>שם</TableHead>
//                     <TableHead>אימייל</TableHead>
//                     <TableHead>מחלקה</TableHead>
//                     <TableHead>מספר כרטיס</TableHead>
//                     <TableHead>סיבת הבקשה</TableHead>
//                     <TableHead>תאריך בקשה</TableHead>
//                     <TableHead>סטטוס</TableHead>
//                     <TableHead>פעולות</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {requests.map((request) => (
//                     <TableRow key={request.id}>
//                       <TableCell>{request.name}</TableCell>
//                       <TableCell>{request.email}</TableCell>
//                       <TableCell>{request.department}</TableCell>
//                       <TableCell>{request.cardId}</TableCell>
//                       <TableCell>{request.reason}</TableCell>
//                       <TableCell>
//                         {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", { locale: he })}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant={request.status === "approved" ? "success" : "destructive"}>
//                           {request.status === "approved" ? "אושרה" : "נדחתה"}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(request.id)}>
//                           מחק
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </ScrollArea>
//         </CardContent>
//       </Card>
//     </div>
//   );
// } 