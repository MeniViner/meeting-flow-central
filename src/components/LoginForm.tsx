
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function LoginForm() {
  const { login, isLoading } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ההתחברות נכשלה");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg glass-card overflow-hidden">
      <CardHeader className="space-y-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
        <CardTitle className="text-2xl font-bold">מערכת ניהול משרד</CardTitle>
        <CardDescription>
          הזן את פרטי הכניסה שלך כדי להתחבר לחשבונך
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              דואר אלקטרוני
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="transition-all duration-300 focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              סיסמה
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="transition-all duration-300 focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 animate-scaleIn">{error}</div>
          )}
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner className="ml-2 h-4 w-4" />
                מתחבר...
              </>
            ) : (
              "התחבר"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-slate-800">
        <div className="text-sm text-center text-muted-foreground">
          <p>פרטי התחברות לדוגמה:</p>
          <p>משתמש: john@example.com / סיסמה: password</p>
          <p>מנהל: jane@example.com / סיסמה: password</p>
        </div>
      </CardFooter>
    </Card>
  );
}
