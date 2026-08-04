import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "@/pages/LoginPage";
import { AuthDetails } from "@/pages/AuthDetails";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth-details" element={<AuthDetails />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
