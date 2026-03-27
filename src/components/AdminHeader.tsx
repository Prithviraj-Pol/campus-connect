import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";

const AdminHeader = () => {
  const { user, signOut } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-adminBlue shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-white tracking-tight">
          CampusSync Admin
        </h1>
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10 ring-2 ring-white/20">
            <AvatarImage src={""} alt={user?.fullName || "Admin"} />
            <AvatarFallback className="bg-adminOrange text-adminOrangeFg text-lg font-bold">
              Admin
            </AvatarFallback>
          </Avatar>
          <Button
            variant="default"
            size="sm"
            onClick={signOut}
            className="bg-adminOrange hover:bg-adminOrange/90 text-adminOrangeFg font-semibold shadow-md"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
