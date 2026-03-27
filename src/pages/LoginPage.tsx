import { useState } from "react";
import { useApp, Role } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";

const LoginPage = () => {
  const { login } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role | "">("");

  const handleLogin = () => {
    if (name.trim() && role) {
      login(name.trim(), role as Role);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">CampusSync</h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md animate-fade-in shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-primary">Welcome to CampusSync</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage college events seamlessly. Sign in to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">🎓 Student</SelectItem>
                  <SelectItem value="hod">🏛️ HOD (Head of Department)</SelectItem>
                  <SelectItem value="admin">🛡️ Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              onClick={handleLogin}
              disabled={!name.trim() || !role}
            >
              Enter CampusSync
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
