
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const navItems = [
  {
    title: "לוח בקרה",
    href: "/",
    icon: LayoutDashboard,
    showFor: ["user", "admin"],
  },
  {
    title: "בקשות פגישה",
    href: "/meeting-requests",
    icon: Calendar,
    showFor: ["user", "admin"],
  },
  {
    title: "ניהול מערכת",
    href: "/admin",
    icon: Users,
    showFor: ["admin"],
  },
  {
    title: "מסמכים",
    href: "/documents",
    icon: FileText,
    showFor: ["user", "admin"],
  },
  {
    title: "הגדרות",
    href: "/settings",
    icon: Settings,
    showFor: ["user", "admin"],
  },
];

export function MainNav({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const { currentUser, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  const filteredNavItems = navItems.filter((item) =>
    item.showFor.includes(currentUser.role)
  );

  return (
    <>
      <div className="block md:hidden sticky top-0 z-50 glass shadow-md py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">ניהול משרד</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "סגור תפריט" : "פתח תפריט"}
            className="hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-64 glass-card border-l shadow-lg transition-all duration-300 ease-in-out md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
            <h2 className="font-semibold text-lg">ניהול משרד</h2>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-300 animate-slideIn",
                  `animate-delay-${index * 100 + 100}`,
                  pathname === item.href
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-blue-50 dark:hover:bg-slate-800"
                )}
              >
                <item.icon className="ml-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-slate-800">
            <div className="mb-4">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/30"
              onClick={logout}
            >
              התנתק
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
