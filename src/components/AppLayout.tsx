import { Outlet } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { useApp } from "@/contexts/AppContext";
import { Navigate } from "react-router-dom";

export function AppLayout() {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-slate-900">
      <div className="flex min-h-screen">
        <div className="flex-1 md:ml-64 animate-fadeIn">
          <main className="container py-6 md:py-10">
            <div className="animate-scaleIn">
              <Outlet />
            </div>
          </main>
        </div>
        <MainNav />
      </div>
    </div>
  );
}
