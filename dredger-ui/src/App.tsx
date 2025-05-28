/* ───────────────────────── App.tsx ─────────────────────────
   Итоговая версия: маршрутизация, Sidebar с ролями и RequireAuth
   Готова для копирования в проект
──────────────────────────────────────────────────────────── */

import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Dashboard          from "./pages/Dashboard";
import RepairsList        from "./pages/RepairsList";
import RepairForm         from "./pages/RepairForm";
import DeviationsList     from "./pages/DeviationsList";
import DeviationForm      from "./pages/DeviationForm";
import SparePartsList     from "./pages/SparePartsList";
import DredgersList       from "./pages/DredgersList";
import DredgerCard        from "./pages/DredgerCard";
import Login              from "./pages/Login";
import SparePartForm      from "./pages/SparePartForm";

import Sidebar            from "./components/Sidebar";
import AuthProvider, { useAuth } from "./auth/AuthContext";

/* ──────────────────── корневой компонент ─────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex h-screen overflow-hidden bg-gray-100">
          <Sidebar />

          <main className="flex-1 overflow-y-auto">
            <Routes>
              {/* публичная страница входа */}
              <Route path="/login" element={<Login />} />

              {/* защищённые маршруты */}
              <Route element={<RequireAuth />}>
                <Route path="/dashboard"   element={<Dashboard />} />

                {/* Ремонты */}
                <Route path="/repairs"        element={<RepairsList />} />
                <Route path="/repairs/new"    element={<RepairForm  />} />
                <Route path="/repairs/:id/edit" element={<RepairForm />} />

                {/* Отклонения */}
                <Route path="/deviations"        element={<DeviationsList />} />
                <Route path="/deviations/new"    element={<DeviationForm  />} />
                <Route path="/deviations/:id/edit" element={<DeviationForm />} />

                {/* Запчасти */}
                <Route path="/spare-parts" element={<SparePartsList />} />
                <Route path="/spare-parts/new" element={<SparePartForm />} />

                {/* Землесосы и их карточки */}
                <Route path="/dredgers"       element={<DredgersList />} />
                <Route path="/dredgers/:id/*" element={<DredgerCard  />} />

                {/* редирект корня */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

/* ──────────────────── RequireAuth ─────────────────── */
function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // можно показать спиннер

  if (!user)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
