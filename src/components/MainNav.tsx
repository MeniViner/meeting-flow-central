
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
      <div className="block md:hidden sticky top-0 z-50 bg-background border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">ניהול משרד</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "סגור תפריט" : "פתח תפריט"}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-64 bg-card border-l shadow-lg transition-transform duration-200 transform md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">ניהול משרד</h2>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="ml-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="mb-4">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={logout}
            >
              התנתק
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
