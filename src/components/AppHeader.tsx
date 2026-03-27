import { LogOut, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/FakeAppContext";

const AppHeader = () => {
  const { user, signOut } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">
          CampusSync
        </h1>
        {user && (
          <div className="flex items-center gap-3">
            {user.college_name && (
              <span className="text-primary-foreground/70 text-xs font-medium hidden md:flex items-center gap-1">
                <Building className="w-3 h-3" /> {user.college_name}
              </span>
            )}
            <span className="text-primary-foreground/80 text-sm font-medium hidden sm:inline">
              {user.fullName}
            </span>
            {user.role && (
              <Badge variant="secondary" className="uppercase text-xs">
                {user.role}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
