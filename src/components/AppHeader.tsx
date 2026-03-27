import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

const AppHeader = () => {
  const { currentUser, logout } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">
          CampusSync
        </h1>
        {currentUser && (
          <div className="flex items-center gap-4">
            <span className="text-primary-foreground/80 text-sm font-medium">
              {currentUser.name} ({currentUser.role.toUpperCase()})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
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
