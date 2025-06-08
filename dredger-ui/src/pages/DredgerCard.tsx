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

  // Выбор изображения по типу землесоса
  let imageSrc = null;
  let imageAlt = '';
  if (dredger.type_name === 'LHD-49') {
    imageSrc = '/lhd-49.png';
    imageAlt = 'LHD-49';
  } else if (dredger.type_name !== 'HHD-76') {
    imageSrc = '/2GRT.png';
    imageAlt = dredger.type_name;
  }

  // Список табов на русском
  const tabs = [
    { key: "components", label: "Агрегаты" },
    { key: "repairs", label: "Ремонты" },
    { key: "deviations", label: "Отклонения" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex justify-center items-start py-10">
      <div className="w-full bg-white rounded-2xl shadow-lg p-0 mx-6" style={{maxWidth: '100%'}}>
        <div className="flex flex-col items-center px-8 pt-8 pb-4">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-60 h-60 object-contain mb-4 drop-shadow-xl"
            />
          )}
          <h1 className="text-4xl font-bold mb-2 text-center">Землесос {dredger.inv_number}</h1>
          <p className="text-gray-500 text-2xl mb-4 text-center">Тип: {dredger.type_name}</p>
        </div>
        {/* Табы по центру, подчёркивание активного */}
        <div className="flex justify-center border-b border-gray-200 mb-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={`/dredgers/${id}/${tab.key}`}
              className={({ isActive }) =>
                `px-6 py-3 text-lg font-medium transition-colors duration-200 focus:outline-none ${
                  isActive
                    ? "text-black border-b-2 border-black"
                    : "text-gray-400 hover:text-black border-b-2 border-transparent"
                }`
              }
              end={tab.key === "components"}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
        {/* Контент вкладки */}
        <div className="px-6 pb-8 pt-2">
          <div className="bg-[#fcfcfd] rounded-xl p-0 shadow-sm overflow-hidden">
            <Routes>
              <Route path="components" element={<ComponentsTab />} />
              <Route path="repairs"    element={<RepairsTab    />} />
              <Route path="deviations" element={<DeviationsTab />} />
              <Route path="*"          element={<ComponentsTab />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── общие util'ы ─────────── */
function cell(cls = "") {
  return `px-3 py-2 text-center ${cls}`;
}

/* ─────────── вкладка «Агрегаты» ─────────── */
function ComponentsTab() {
  const { id } = useParams();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editHours, setEditHours] = useState<{[key:number]: string}>({});
  const [saving, setSaving] = useState<{[key:number]: boolean}>({});

  useEffect(() => {
    setLoading(true);
    api.get(`/dredgers/${id}/template/`).then((r) => setRows(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleHoursChange = (component_id: number, value: string) => {
    setEditHours((prev) => ({ ...prev, [component_id]: value }));
  };

  const handleSave = async (component_id: number) => {
    const hours = Number(editHours[component_id]);
    if (isNaN(hours) || hours < 0) return;
    setSaving((prev) => ({ ...prev, [component_id]: true }));
    await api.patch(`/components/${component_id}/`, { total_hours: hours });
    // обновить данные после сохранения
    const res = await api.get(`/dredgers/${id}/template/`);
    setRows(res.data);
    setSaving((prev) => ({ ...prev, [component_id]: false }));
    setEditHours((prev) => ({ ...prev, [component_id]: "" }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Код</th>
            <th className="px-4 py-3 text-left font-semibold">Название</th>
            <th className="px-4 py-3 text-left font-semibold">Сер. №</th>
            <th className="px-4 py-3 text-left font-semibold">Произв.</th>
            <th className="px-4 py-3 text-left font-semibold">Норма, ч</th>
            <th className="px-4 py-3 text-left font-semibold">Наработка, ч</th>
            <th className="px-4 py-3 text-left font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c: any) => (
            <tr key={c.part_id} className="border-t border-gray-200 hover:bg-blue-50/40 transition">
              <td className="px-4 py-3">{c.code}</td>
              <td className="px-4 py-3">{c.part_name}</td>
              <td className="px-4 py-3">{c.serial_number || "—"}</td>
              <td className="px-4 py-3">{c.manufacturer}</td>
              <td className="px-4 py-3 text-center">{c.norm_hours}</td>
              <td className="px-4 py-3 text-center">
                {c.component_id ? (
                  <div className="flex items-center gap-2 justify-center">
                    <input
                      type="number"
                      min={0}
                      className="border rounded px-2 py-1 w-20 text-right"
                      value={editHours[c.component_id] !== undefined ? editHours[c.component_id] : c.current_hours}
                      onChange={e => handleHoursChange(c.component_id, e.target.value)}
                      disabled={saving[c.component_id]}
                    />
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold disabled:opacity-60"
                      onClick={() => handleSave(c.component_id)}
                      disabled={saving[c.component_id] || editHours[c.component_id] === undefined || String(editHours[c.component_id]) === String(c.current_hours)}
                    >
                      {saving[c.component_id] ? '...' : 'Сохранить'}
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td></td>
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr className="border-t border-gray-200">
              <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-base">
                Нет данных
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────── вкладка «Ремонты» (последние 10) ─────────── */
function RepairsTab() {
  const { id } = useParams();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/repairs/", {
        params: { dredger: id, ordering: "-start_date", page_size: 10 },
      })
      .then((r) => setRows(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  }, [id]);

  const df = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—");
  const STATUS: Record<string, { txt: string; color: string }> = {
    in_progress: { txt: "В работе",      color: "bg-blue-500" },
    completed:   { txt: "Завершено",     color: "bg-emerald-500" },
    planned:     { txt: "Запланировано", color: "bg-gray-400" },
  };
  function Badge({ s }: { s: string }) {
    const { txt, color } = STATUS[s] || { txt: s, color: "bg-gray-400" };
    return <span className={`${color} text-white text-xs px-3 py-1 rounded-full`}>{txt}</span>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Компонент</th>
            <th className="px-4 py-3 text-left font-semibold">Описание</th>
            <th className="px-4 py-3 text-left font-semibold">Начало</th>
            <th className="px-4 py-3 text-left font-semibold">Окончание</th>
            <th className="px-4 py-3 text-left font-semibold">Статус</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id} className="border-t border-gray-200 hover:bg-blue-50/40 transition">
              <td className="px-4 py-3">{r.component || "—"}</td>
              <td className="px-4 py-3">{r.notes || r.description || "—"}</td>
              <td className="px-4 py-3">{df(r.start_date)}</td>
              <td className="px-4 py-3">{df(r.end_date)}</td>
              <td className="px-4 py-3"><Badge s={r.status} /></td>
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr className="border-t border-gray-200">
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-base">
                Нет данных
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────── вкладка «Отклонения» (последние 10) ─────────── */
function DeviationsTab() {
  const { id } = useParams();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/deviations/", {
        params: { dredger: id, ordering: "-date", page_size: 10 },
      })
      .then((r) => setRows(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  }, [id]);

  const TYPE_MAP: Record<string, string> = {
    mechanical:   "Механический",
    electrical:   "Электрический",
    technological:"Технологический",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Дата</th>
            <th className="px-4 py-3 text-left font-semibold">Тип</th>
            <th className="px-4 py-3 text-left font-semibold">Участок</th>
            <th className="px-4 py-3 text-left font-semibold">Описание</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d: any) => (
            <tr key={d.id} className="border-t border-gray-200 hover:bg-blue-50/40 transition">
              <td className="px-4 py-3">{d.date}</td>
              <td className="px-4 py-3">{TYPE_MAP[d.type] || d.type}</td>
              <td className="px-4 py-3">{d.location}</td>
              <td className="px-4 py-3">{d.description}</td>
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr className="border-t border-gray-200">
              <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-base">
                Нет данных
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
