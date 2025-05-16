import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import RepairsList from "./pages/RepairsList";
import DeviationsList from "./pages/DeviationsList";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<Navigate to="/repairs" />} />
            <Route path="/repairs" element={<RepairsList />} />
            <Route path="/deviations" element={<DeviationsList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
