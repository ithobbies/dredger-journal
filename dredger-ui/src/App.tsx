import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RepairsList from "./pages/RepairsList";
import DeviationsList from "./pages/DeviationsList";
import SparePartsList from "./pages/SparePartsList";
import DredgerComponents from "./pages/DredgerComponents";
import Login from "./pages/Login";
import AuthProvider, { useAuth } from "./auth/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              {/* public */}
              <Route path="/login" element={<Login />} />

              {/* protected */}
              <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/repairs/*" element={<RepairsList />} />
                <Route path="/deviations/*" element={<DeviationsList />} />
                <Route path="/spare-parts/*" element={<SparePartsList />} />
                <Route path="/dredgers/:id/components" element={<DredgerComponents />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

/* ───────────────────── Sidebar ───────────────────── */
function Sidebar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);
  if (!user) return null;

  const links = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Repairs",   to: "/repairs" },
    { label: "Deviations", to: "/deviations" },
    { label: "Spare Parts", to: "/spare-parts" },
  ];

  return (
    <aside
      className={`bg-white shadow-xl transition-all duration-300 flex flex-col ${
        open ? "w-60" : "w-16"
      }`}
    >
      {/* header */}
      <div className="flex items-center justify-between p-4 border-b">
        {open && <span className="font-bold text-lg">Dredger</span>}
        <button onClick={() => setOpen(!open)} className="p-1 text-lg">
          ☰
        </button>
      </div>

      {/* nav links */}
      <nav className="p-2 space-y-1 flex-1">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="block rounded px-3 py-2 hover:bg-blue-50"
          >
            {open ? l.label : l.label.charAt(0)}
          </Link>
        ))}
      </nav>

      {/* footer user */}
      <div className="p-4 border-t text-sm">
        {open && <p className="mb-2">{user.username}</p>}
        <button onClick={logout} className="text-red-600 underline">
          {open ? "Выйти" : "⇦"}
        </button>
      </div>
    </aside>
  );
}

/* ──────────────────── RequireAuth ─────────────────── */
function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
