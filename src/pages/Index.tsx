import { useApp } from "@/context/AppContext";
import LoginPage from "./LoginPage";
import StudentPortal from "./StudentPortal";
import HODDashboard from "./HODDashboard";
import AdminDashboard from "./AdminDashboard";

const Index = () => {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  switch (user.role) {
    case "student":
      return <StudentPortal />;
    case "hod":
      return <HODDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">No role assigned. Contact an administrator.</p>
        </div>
      );
  }
};

export default Index;
