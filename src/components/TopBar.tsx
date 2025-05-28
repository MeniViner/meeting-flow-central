import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import  WorkspaceSelector  from "@/components/WorkspaceSelector";

interface TopBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": {
    title: "עמוד לוח בקרה",
    description: "ברוך הבא!",
  },
  "/admin": {
    title: "עמוד לוח בקרה",
    description: "ניהול בקשות פגישה",
  },
  "/documents": {
    title: "עמוד מסמכים",
    description: "צפה ונהל את כל המסמכים הקשורים לפגישות",
  },
  "/users": {
    title: "עמוד ניהול משתמשים",
    description: "ניהול משתמשים והרשאות במערכת",
  },
  "/access-requests": {
    title: "עמוד בקשות גישה",
    description: "ניהול בקשות גישה למערכת",
  },
  "/workspaces": {
    title: "עמוד ניהול סביבות עבודה",
    description: "ניהול סביבות העבודה במערכת",
  },
  "/formats": {
    title: "עמוד ניהול פורמטים",
    description: "ניהול פורמטים במערכת",
  },
};

export function TopBar({ className, ...props }: TopBarProps) {
  const { pathname } = useLocation();
  const { user } = useApp();
  const { currentWorkspace } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentPage = pageTitles[pathname] || {
    title: "לוח בקרה",
    description: `ברוך הבא, ${(user as any)?.fullName || user?.name || "אורח"}!`,
  };

  const formattedTime = currentTime.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-60 z-40 h-16 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-border/40 shadow-md",
        className
      )}
      {...props}
    >
      <div className="container h-full flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
              {currentPage.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {currentPage.description}
            </p>
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="p-4">
              <WorkspaceSelector />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block px-2 py-1 rounded-full bg-muted text-foreground text-xs font-medium">
            ברוך הבא: {(user as any)?.fullName || user?.name || "אורח"}
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            {formattedTime}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 text-blue-500" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
