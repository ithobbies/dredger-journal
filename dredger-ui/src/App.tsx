import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import RepairsList from "./pages/RepairsList";
import DeviationsList from "./pages/DeviationsList";
import RepairForm from "./pages/RepairForm";
import AppLayout from "./components/AppLayout";
import DeviationForm from "./pages/DeviationForm";
import SparePartsList from "./pages/SparePartsList";
import SparePartForm from "./pages/SparePartForm";
import DredgerComponents from "./pages/DredgerComponents";
import Dashboard from "./pages/Dashboard";


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
              <Route path="/spare-parts" element={<SparePartsList />} />
              <Route path="/spare-parts/new" element={<SparePartForm />} />
              <Route path="/spare-parts/:id/edit" element={<SparePartForm />} />
              <Route path="/dredgers/:id/components" element={<DredgerComponents />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
