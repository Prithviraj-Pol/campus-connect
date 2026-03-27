import { useState, useEffect } from "react";
import { useApp, Role } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const { signIn, signUp, colleges, resetPassword } = useApp();
  const { toast } = useToast();
  const [tab, setTab] = useState("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suRole, setSuRole] = useState<Role | "">("");
  const [signingUp, setSigningUp] = useState(false);

  // forgot pwd state n handler - simple email reset via supabase
  const [forgotEmail, setForgotEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  const handleReset = async () => {
    if (!forgotEmail) return;
    setSendingReset(true);
    const { error } = await resetPassword(forgotEmail);
    setSendingReset(false);
    if (error) {
      toast({ title: "Failed to send reset", description: error, variant: "destructive" });
    } else {
      toast({ title: "Reset email sent!", description: "Check inbox/spam folder for link (leads back to login)." });
      setForgotEmail(""); // clear for next
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) return;
    setSigningIn(true);
    const { error } = await signIn(email, password);
    setSigningIn(false);
    if (error) toast({ title: "Sign in failed", description: error, variant: "destructive" });
  };

  const handleSignUp = async () => {
    if (!suName || !suEmail || !suPassword || !suRole) return;
    setSigningUp(true);
    const { error } = await signUp(suEmail, suPassword, suName, suRole as Role, "");
    setSigningUp(false);
    if (error) {
      toast({ title: "Sign up failed", description: error, variant: "destructive" });
    } else {
      toast({ title: "✅ Account created!", description: "You are now signed in." });
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
              Multi-tenant college event management.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="forgot">Forgot?</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSignIn()} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSignIn()} />
                </div>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-md" onClick={handleSignIn} disabled={signingIn || !email || !password}>
                  {signingIn ? "Signing in..." : "Sign In"}
                </Button>
                <Button variant="link" className="w-full text-xs p-0 h-auto text-muted-foreground hover:text-primary justify-start" onClick={() => setTab("forgot")}>
                  Forgot password?
                </Button>
              </TabsContent>

              <TabsContent value="forgot" className="space-y-4">
                <p className="text-sm text-muted-foreground">We'll send a password reset link to your email.</p>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-muted-foreground w-4 h-4 pointer-events-none" />
                    <Input className="pl-10" type="email" placeholder="you@college.edu" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleReset()} />
                  </div>
                </div>
                <Button className="w-full" variant="default" onClick={handleReset} disabled={sendingReset || !forgotEmail}>
                  {sendingReset ? "Sending link..." : "Send Reset Link"}
                </Button>
                <Button variant="link" className="w-full text-xs p-0 h-auto justify-start" onClick={() => setTab("signin")}>
                  ← Back to sign in
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Your full name" value={suName} onChange={(e) => setSuName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@college.edu" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="Min 6 characters" value={suPassword} onChange={(e) => setSuPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={suRole} onValueChange={(v) => setSuRole(v as Role)}>
                    <SelectTrigger><SelectValue placeholder="Choose your role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">🎓 Student</SelectItem>
                      <SelectItem value="hod">🏛️ HOD</SelectItem>
                      <SelectItem value="admin">🛡️ Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-md" onClick={handleSignUp} disabled={signingUp || !suName || !suEmail || !suPassword || !suRole}>
                  {signingUp ? "Creating account..." : "Create Account"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
