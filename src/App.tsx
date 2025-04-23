import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MeetingRequests from "./pages/MeetingRequests";
import DocumentsPage from "./pages/DocumentsPage";
import PermissionsPage from "./pages/PermissionsPage";
import UsersPage from "./pages/UsersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <div dir="rtl" lang="he" className="rtl">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/meeting-requests" element={<MeetingRequests />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/settings" element={<PermissionsPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
