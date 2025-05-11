import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, FileText, Menu, X, UserCog, Shield, LockOpen, Building2, Sun, Moon 
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import WorkspaceSelector from "./WorkspaceSelector";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

const navItems = [
  {
    title: (role: string) => role === "regular" ? "לוח בקרה" : "לוח בקרה אישי",
    href: "/",
    icon: LayoutDashboard,
    showFor: ["regular", "editor", "administrator", "owner"],
  },
  {
    title: "ניהול מערכת",
    href: "/admin",
    icon: Shield,
    showFor: ["administrator", "owner", "editor"],
  },
  {
    title: "ניהול משתמשים",
    href: "/users",
    icon: UserCog,
    showFor: ["administrator", "owner"],
  },
  {
    title: "ניהול בקשות גישה",
    href: "/access-requests",
    icon: LockOpen,
    showFor: ["administrator", "owner"],
  },
  {
    title: "מסמכים",
    href: "/documents",
    icon: FileText,
    showFor: ["regular", "editor", "administrator", "owner"],
  },
  {
    title: "ניהול סביבות עבודה",
    href: "/workspaces",
    icon: Building2,
    showFor: ["owner"],
  },
  // {
    //   title: "הרשאות",
    //   href: "/settings",
    //   icon: Settings,
  //   showFor: ["admin"],
  // },
];

export default function MainNav({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const { user } = useApp();
  const { currentWorkspace } = useWorkspace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  // In development, show all items for all users
  const filteredNavItems = process.env.NODE_ENV === "development"
    ? navItems
    : navItems.filter((item) => item.showFor.includes(user.globalRole));


  return (
    <>
      <div className="block md:hidden sticky top-0 z-50 glass shadow-md py-3 px-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "סגור תפריט" : "פתח תפריט"}
            className="hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
          <div className="font-semibold text-lg">ניהול משרד</div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              className="scale-75"
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-64 glass-card border-l shadow-lg transition-all duration-300 ease-in-out md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "translate-x-[100%]",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">
                {currentWorkspace?.shortName || "ניהול משרד"}
              </h2>
            </div>
            <div className="text-xs text-muted-foreground">
              {currentWorkspace?.longName}
            </div>
            {process.env.NODE_ENV === "development" && (
              <p className="text-xs text-muted-foreground text-yellow-900">מצב פיתוח - גישה מלאה</p>
            )}
          </div>

          <div className="p-4">
            <WorkspaceSelector />
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-blue-100 dark:hover:bg-slate-700",
                  pathname === item.href
                    ? "bg-blue-100 dark:bg-slate-700"
                    : "transparent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {typeof item.title === 'function' ? item.title(user.globalRole) : item.title}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => window.location.href = "/landing"}
            >
              <X className="h-4 w-4" />
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
