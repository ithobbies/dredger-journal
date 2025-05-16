import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import RepairsList from "./pages/RepairsList";
import DeviationsList from "./pages/DeviationsList";
import RepairForm from "./pages/RepairForm";
import AppLayout from "./components/AppLayout";
import DeviationForm from "./pages/DeviationForm";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/repairs" />} />
              <Route path="/repairs" element={<RepairsList />} />
              <Route path="/repairs/new" element={<RepairForm />} />
              <Route path="/deviations" element={<DeviationsList />} />
              <Route path="/deviations/new" element={<DeviationForm />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
