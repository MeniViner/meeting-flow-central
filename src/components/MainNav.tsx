// src/components/MainNav.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, FileText, Menu, X, UserCog, Shield, LockOpen, Building2, Sun, Moon, FileDown, Users 
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { title } from "process";

const navItems = [
  {
    title: (role: string) => role === "regular" ? "לוח בקרה" : "לוח בקרה אישי",
    href: "/",
    icon: LayoutDashboard,
    showFor: ["regular", "editor", "administrator", "owner"],
    checkWorkspaceRole: true
  },
  {
    title: "ניהול מערכת",
    href: "/admin",
    icon: Shield,
    showFor: ["administrator", "owner", "editor"],
    checkWorkspaceRole: true
  },
  {
    title: "ניהול משתמשים",
    href: "/users",
    icon: UserCog,
    showFor: ["administrator", "owner"],
    checkWorkspaceRole: false // This will use globalRole
  },
  {
    title: "ניהול משתמשי סביבה",
    href: "/environment-users",
    icon: Users,
    showFor: ["administrator", "owner"],
    checkWorkspaceRole: true
  },
  {
    title: "ניהול בקשות גישה",
    href: "/access-requests",
    icon: LockOpen,
    showFor: ["administrator", "owner"],
    checkWorkspaceRole: true
  },
  {
    title: "מסמכים",
    href: "/documents",
    icon: FileText,
    showFor: ["regular", "editor", "administrator", "owner"],
    checkWorkspaceRole: true
  },
  {
    title: "פורמטים",
    href: "/formats",
    icon: FileDown,
    showFor: ["regular", "editor", "administrator", "owner"],
    checkWorkspaceRole: true
  },
  {
    title: "ניהול סביבות עבודה",
    href: "/workspaces",
    icon: Building2,
    showFor: ["owner"],
    checkWorkspaceRole: true
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
  const isDevelopment = process.env.NODE_ENV === "development";

  const shouldShowItem = (item: typeof navItems[0]) => {
    if (!user) return false;
    
    if (item.checkWorkspaceRole) {
      // Check workspace-specific role
      const workspaceRole = user.workspaceAccess?.find(
        access => access.workspaceId === currentWorkspace?.id
      )?.role;
      return workspaceRole ? item.showFor.includes(workspaceRole) : false;
    } else {
      // Check global role (only for UsersPage)
      return item.showFor.includes(user.globalRole);
    }
  };

  if (!user) return null;

  // Always show all navigation items regardless of role in development mode
  const filteredNavItems = isDevelopment ? navItems : navItems.filter(shouldShowItem);

  return (
    <>
      <div className="block md:hidden sticky top-0 z-50 glass shadow-md py-3 px-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "סגור תפריט" : "פתח תפריט"}
            className="hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors duration-200 "
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
          "fixed inset-y-0 right-0 z-50 w-64 border-l shadow-lg transition-all duration-300 ease-in-out md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "translate-x-[100%]",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
            <div className="flex items-center  gap-5">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Mazi_IDF_Symbol.svg/330px-Mazi_IDF_Symbol.svg.png" 
                alt="משילות לוגו" 
                className="w-10  h-10 object-contain"
              />
              <h1 className="text-2xl font-bold mb-1 text-center">משילות</h1>
            </div>
            <p className="text-sm text-center mb-2">
              <span className="font-bold">מ</span>ערכת <span className="font-bold">ש</span>ליטה <span className="font-bold">ל</span>דיונים <span className="font-bold">ו</span>לשכות
            </p>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-medium text-base">
                {currentWorkspace?.shortName || "ניהול משרד"}
              </h2>
            </div>
            <div className="text-xs text-muted-foreground">
              {currentWorkspace?.longName}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              if (!shouldShowItem(item) && !isDevelopment) return null;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-blue-100 dark:hover:bg-slate-700",
                    pathname === item.href
                      ? "bg-blue-200 dark:bg-slate-700"
                      : "transparent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {typeof item.title === 'function' ? item.title(user.globalRole) : item.title}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="flex flex-col items-center gap-4 mb-4">
              <img 
                src="/team-alpha-logo.png" 
                alt="Team Alpha Logo" 
                className="w-24 h-24 object-contain"
              />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Developed by Team Alpha</p>
                <a 
                  href="mailto:team.alpha@example.com?subject=Meeting Flow Central - Web Application"
                  className="text-sm text-primary hover:underline"
                >
                  Contact Us
                </a>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => window.location.href = "/landing"}
            >
              <X className="h-4 w-4" />
              התנתק
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 dark:from-black/90 to-transparent pointer-events-none" />
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
