import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";

export default function DevHelper() {
  const { devLoginAsAdmin } = useApp();

  if (process.env.NODE_ENV !== "development" || !devLoginAsAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={devLoginAsAdmin}
        className="rounded-full w-10 h-10"
        title="התחבר כמנהל מערכת (פיתוח בלבד)"
      >
        <User className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.location.href = "/landing"}
        className="rounded-full w-10 h-10"
        title="התנתק (פיתוח בלבד)"
      >
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
} 