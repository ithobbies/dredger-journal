import { useEffect, useState } from "react";
import { useParams, NavLink, Routes, Route } from "react-router-dom";
import api from "../api/axios";

// ─────────── типы ───────────
interface Dredger {
  id: number;
  inv_number: string;
  type_name: string;
}

/* ───────────────────── карточка землесоса ───────────────────── */
export default function DredgerCard() {
  const { id } = useParams();
  const [dredger, setDredger] = useState<Dredger | null>(null);

  useEffect(() => {
    api.get(`/dredgers/${id}/`).then((r) => setDredger(r.data));
  }, [id]);

  if (!dredger) return <div className="p-6">Загрузка...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-1">
        Землесос {dredger.inv_number}
      </h1>
      <p className="text-gray-600 mb-6">Тип: {dredger.type_name}</p>

      {/* вкладки */}
      <div className="border-b mb-4">
        {["components", "repairs", "deviations"].map((tab) => (
          <NavLink
            key={tab}
            to={`/dredgers/${id}/${tab}`}
            className={({ isActive }) =>
              `inline-block px-4 py-2 mr-2 ${
                isActive
                  ? "border-b-2 border-blue-600 font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`
            }
          >
            {tab === "components"
              ? "Агрегаты"
              : tab === "repairs"
              ? "Ремонты"
              : "Отклонения"}
          </NavLink>
        ))}
      </div>

      {/* вложенные маршруты */}
      <Routes>
        <Route path="components" element={<ComponentsTab />} />
        <Route path="repairs"    element={<RepairsTab    />} />
        <Route path="deviations" element={<DeviationsTab />} />
        <Route path="*"          element={<ComponentsTab />} />
      </Routes>
    </div>
  );
}

/* ─────────── общие util’ы ─────────── */
function cell(cls = "") {
  return `px-3 py-2 ${cls}`;
}

/* ─────────── вкладка «Агрегаты» ─────────── */
function ComponentsTab() {
  const { id } = useParams();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/dredgers/${id}/components/`).then((r) => setRows(r.data));
  }, [id]);

  return (
    <table className="w-full border shadow-sm text-sm">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          <th className={cell()}>Запчасть</th>
          <th className={cell("text-center")}>Сер. №</th>
          <th className={cell("text-center")}>Наработка, ч</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => (
          <tr key={c.part_id} className="border-t">
            <td className={cell()}>{c.part_name}</td>
            <td className={cell("text-center")}>{c.serial_number || "—"}</td>
            <td className={cell("text-center")}>{c.current_hours}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ─────────── вкладка «Ремонты» (последние 10) ─────────── */
function RepairsTab() {
  const { id } = useParams();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/repairs/", {
        params: { dredger: id, ordering: "-start_date", page_size: 10 },
      })
      .then((r) => setRows(r.data.results ?? r.data));
  }, [id]);

  return (
    <table className="w-full border shadow-sm text-sm">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          <th className={cell()}>Описание</th>
          <th className={cell("text-center")}>Начало</th>
          <th className={cell("text-center")}>Конец</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r: any) => (
          <tr key={r.id} className="border-t">
            <td className={cell()}>{r.notes || "—"}</td>
            <td className={cell("text-center")}>{r.start_date}</td>
            <td className={cell("text-center")}>{r.end_date || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ─────────── вкладка «Отклонения» (последние 10) ─────────── */
function DeviationsTab() {
  const { id } = useParams();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/deviations/", {
        params: { dredger: id, ordering: "-date", page_size: 10 },
      })
      .then((r) => setRows(r.data.results ?? r.data));
  }, [id]);

  return (
    <table className="w-full border shadow-sm text-sm">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          <th className={cell("text-center")}>Дата</th>
          <th className={cell()}>Тип</th>
          <th className={cell()}>Описание</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((d: any) => (
          <tr key={d.id} className="border-t">
            <td className={cell("text-center")}>{d.date}</td>
            <td className={cell()}>{d.type}</td>
            <td className={cell()}>{d.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
