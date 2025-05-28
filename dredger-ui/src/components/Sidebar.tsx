import { NavLink } from "react-router-dom";
import { useState } from "react";
import type { ReactElement } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  LayoutDashboard,
  Wrench,
  AlertCircle,
  Box,
  Ship,
  LogOut,
} from "lucide-react";

interface LinkCfg {
  to: string;
  label: string;
  icon: ReactElement;
  role?: "Инженер" | "Администратор" | ("Инженер" | "Администратор")[]; // если указано — показываем только этой роли
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);
  if (!user) return null;

  /* безопасно получаем список ролей */
  const roles: string[] = user.groups ?? [];

  console.log('roles:', roles);

  /* навигация */
  const links: LinkCfg[] = [
    { to: "/dashboard",   label: "Дашборд",    icon: <LayoutDashboard size={18} /> },
    { to: "/repairs",     label: "Ремонты",    icon: <Wrench size={18} /> },
    { to: "/deviations",  label: "Отклонения", icon: <AlertCircle size={18} /> },
    {
      to: "/spare-parts",
      label: "Запчасти",
      icon: <Box size={18} />,
      role: ["Инженер", "Администратор"],
    },
    {
      to: "/dredgers",
      label: "Землесосы",
      icon: <Ship size={18} />,
    },
  ];

  /* фильтр по ролям */
  const allowed = (l: LinkCfg) =>
    !l.role || 
    (Array.isArray(l.role) ? l.role.some(r => roles.includes(r)) : roles.includes(l.role));

  return (
    <aside
      className={`bg-slate-800 text-slate-100 flex flex-col transition-all ${
        open ? "w-60" : "w-16"
      }`}
    >
      {/* header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {open && <span className="font-bold text-lg">Dredger</span>}
        <button onClick={() => setOpen(!open)} title="Свернуть">☰</button>
      </div>

      {/* links */}
      <nav className="flex-1 p-2 space-y-1">
        {links.filter(allowed).map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded ${
                isActive ? "bg-slate-700" : "hover:bg-slate-700/60"
              }`
            }
          >
            {l.icon}
            {open && <span>{l.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* footer */}
      <div className="p-4 border-t border-slate-700 text-sm flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center uppercase">
          {user.username.slice(0, 2)}
        </div>
        {open && (
          <>
            <span className="flex-1 truncate">{user.username}</span>
            <button onClick={logout} title="Выйти">
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
