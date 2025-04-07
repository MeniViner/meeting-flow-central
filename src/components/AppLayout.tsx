
import { Outlet } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { useApp } from "@/contexts/AppContext";
import { LoginForm } from "@/components/LoginForm";

export function AppLayout() {
  const { currentUser, isLoading } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-slate-900">
      {!currentUser ? (
        <div className="flex justify-center items-center min-h-screen animate-fadeIn">
          <div className="glass-card p-1">
            <LoginForm />
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen">
          <MainNav />
          <div className="flex-1 md:mr-64 animate-fadeIn">
            <main className="container py-6 md:py-10">
              <div className="animate-scaleIn">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
