import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { AppLayout } from "@/components/AppLayout";
import { ThemeProvider } from "next-themes";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DocumentsPage from "./pages/DocumentsPage";
import PermissionsPage from "./pages/PermissionsPage";
import UsersPage from "./pages/UsersPage";
import NotFound from "./pages/NotFound";
import DevHelper from "@/components/DevHelper";
import {LandingPage} from "@/pages/LandingPage";
import AccessRequestPage from "@/pages/AccessRequestPage";
import AccessRequestsPage from "@/pages/AccessRequestsPage";
import MeetingsPage from "@/pages/MeetingsPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspacesPage from "@/pages/WorkspacesPage";
import Formats from "@/pages/Formats";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <div dir="rtl" lang="he" className="rtl">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <WorkspaceProvider>
              <AppProvider>
                <Routes>
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/request-access" element={<AccessRequestPage />} />
                  <Route element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route
                      path="/access-requests"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AccessRequestsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <UsersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/meetings"
                      element={
                        <ProtectedRoute>
                          <MeetingsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/workspaces" element={<WorkspacesPage />} />
                    <Route
                      path="/formats"
                      element={
                        <ProtectedRoute>
                          <Formats />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
                <DevHelper />
              </AppProvider>
            </WorkspaceProvider>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
