import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

interface TopBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": {
    title: "לוח בקרה",
    description: "ברוך הבא!",
  },
  "/admin": {
    title: "לוח בקרה",
    description: "ניהול בקשות פגישה",
  },
  "/documents": {
    title: "מסמכים",
    description: "צפה ונהל את כל המסמכים הקשורים לפגישות",
  },
  "/users": {
    title: "ניהול משתמשים",
    description: "ניהול משתמשים והרשאות במערכת",
  },
  "/access-requests": {
    title: "בקשות גישה",
    description: "ניהול בקשות גישה למערכת",
  },
  "/workspaces": {
    title: "ניהול סביבות עבודה",
    description: "ניהול סביבות העבודה במערכת",
  },
};

export function TopBar({ className, ...props }: TopBarProps) {
  const { pathname } = useLocation();
  const { user } = useApp();
  
  const currentPage = pageTitles[pathname] || {
    title: "לוח בקרה",
    description: `ברוך הבא, ${user?.name}!`,
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-60 z-40 h-16 bg-transparent backdrop-blur-sm border-b border-border/40",
        className
      )}
      {...props}
    >
      <div className="container h-full flex items-center justify-between mr-20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{currentPage.title}</h1>
          <p className="text-sm text-muted-foreground">
            {currentPage.description}
          </p>
        </div>
      </div>
    </div>
  );
} 