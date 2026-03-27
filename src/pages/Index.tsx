import { useApp } from "@/context/AppContext";
import LoginPage from "./LoginPage";
import StudentPortal from "./StudentPortal";
import HODDashboard from "./HODDashboard";
import AdminDashboard from "./AdminDashboard";

const Index = () => {
  const { currentUser } = useApp();

  if (!currentUser) return <LoginPage />;

  switch (currentUser.role) {
    case "student":
      return <StudentPortal />;
    case "hod":
      return <HODDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <LoginPage />;
  }
};

export default Index;
