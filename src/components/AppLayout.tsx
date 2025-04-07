
import { Outlet } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { useApp } from "@/contexts/AppContext";
import { LoginForm } from "@/components/LoginForm";

export function AppLayout() {
  const { currentUser, isLoading } = useApp();

  return (
    <div className="min-h-screen bg-muted/30">
      {!currentUser ? (
        <div className="flex justify-center items-center min-h-screen">
          <LoginForm />
        </div>
      ) : (
        <div className="flex min-h-screen">
          <MainNav />
          <div className="flex-1 md:ml-64">
            <main className="container py-6 md:py-10">
              <Outlet />
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
