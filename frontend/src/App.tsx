import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "@/pages/LoginPage";
import { HealthDetails } from "@/pages/HealthDetails";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/health-details" element={<HealthDetails />} />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
