import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import { LoginPage } from "@/pages/LoginPage";
import { HealthDetails } from "@/pages/HealthDetails";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function App() {
  console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/health/`)
      .then((response) => {
        console.log("Status:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("Backend response:", data);
      })
      .catch((error) => {
        console.error("Backend error:", error);
      });
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/health-details" element={<HealthDetails />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
