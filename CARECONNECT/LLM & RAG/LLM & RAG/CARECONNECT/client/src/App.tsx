import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  const { user } = useAuth();
  return user ? <DashboardPage /> : <LoginPage />;
}
