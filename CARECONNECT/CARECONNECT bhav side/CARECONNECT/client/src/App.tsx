import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { PatientDashboard } from "./pages/PatientDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

export default function App() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "DOCTOR":
    case "HEALTH_WORKER":
    case "FACILITY_STAFF":
      return <StaffDashboard />;
    case "PATIENT":
      return <PatientDashboard />;
    default:
      return <div className="flex items-center justify-center min-h-screen">Unauthorized Role: {user.role}</div>;
  }
}
