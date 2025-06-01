import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { PlusCircle } from "lucide-react";

/* ───────── типы ───────── */
interface Repair {
  id: number;
  dredger_inv: string;
  dredger_id: number | null;
  dredger_type: string;
  component: string;
  description: string;
  start_date: string;
  end_date: string | null;
  status: "in_progress" | "completed" | "planned";
}
interface DredgerOption { id: number; inv_number: string }

/* ──────── утилиты ─────── */
const STATUS = {
  in_progress: { txt: "В работе",      color: "bg-blue-500" },
  completed:   { txt: "Завершено",     color: "bg-emerald-500" },
  planned:     { txt: "Запланировано", color: "bg-gray-400" },
};
function Badge({ s }: { s: Repair["status"] }) {
  const { txt, color } = STATUS[s];
  return <span className={`${color} text-white text-xs px-3 py-1 rounded-full`}>{txt}</span>;
}
const df = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—");

/* ───────── компонент ───────── */
export default function RepairsList() {
  /* фильтры */
  const [dredgers, setDredgers] = useState<DredgerOption[]>([]);
  const [dredger, setDredger]   = useState<string>("all");
  const [status,  setStatus]    = useState<string>("all");
  const [from,    setFrom]      = useState<string>("");
  const [to,      setTo]        = useState<string>("");

  /* данные */
  const [rows, setRows]       = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);

  /* ── справочник землесосов ── */
  useEffect(() => {
    api.get("/dredgers/").then(r => setDredgers(r.data.results ?? r.data));
  }, []);

  /* ── загрузка журнала ── */
  const load = () => {
    setLoading(true);
    const p: any = {};
    if (dredger !== "all") p.dredger = dredger;
    if (status  !== "all") p.status = status === "in_progress" ? "in_progress" : 
                                     status === "completed" ? "completed" : 
                                     status === "planned" ? "planned" : status;
    if (from) p.start_date = from;
    if (to)   p.end_date   = to;

    api.get("/repairs/", { params: p }).then(r => {
      const list = r.data.results ?? r.data;
      console.log('API Response:', list);
      console.log('Status filter:', status);
      console.log('Filter params:', p);
      setRows(list.map((x: any) => ({
        id:           x.id,
        dredger_inv:  x.dredger?.inv_number ?? x.dredger_inv ?? x.dredger,
        dredger_id:   x.dredger?.id ?? null,
        dredger_type: x.dredger?.type_name ?? "—",
        component:    x.items?.[0]?.component?.part?.name ?? x.component ?? "—",
        description:  x.notes ?? x.description ?? "",
        start_date:   x.start_date,
        end_date:     x.end_date,
        status:       x.status ?? (() => {
          const today = new Date().toISOString().slice(0, 10);
          if (x.start_date > today) return "planned";
          if (x.end_date && x.end_date < today) return "completed";
          return "in_progress";
        })(),
      })));
    }).finally(() => setLoading(false));
  };
  useEffect(load, []); // первичная загрузка

  /* ── сброс фильтров ── */
  const reset = () => {
    setDredger("all");
    setStatus("all");
    setFrom("");
    setTo("");
    setTimeout(load); // перезагрузить после очистки
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="p-6 bg-[#fafbfc] min-h-screen">
      {/* заголовок */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Журнал ремонтов</h1>
        <Link
          to="/repairs/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-sm transition"
        >
          <PlusCircle size={20} /> Новый ремонт
        </Link>
      </div>

      {/* ЕДИНЫЙ контейнер */}
      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-x-auto">
        <div className="p-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Землесос</label>
            <select
              value={dredger} onChange={e=>setDredger(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            >
              <option value="all">Все</option>
              {dredgers.map(d=> <option key={d.id} value={d.id}>{d.inv_number}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={status} onChange={e=>setStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            >
              <option value="all">Все</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершено</option>
              <option value="planned">Запланировано</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Период с</label>
            <input type="date" value={from} onChange={e=>setFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">по</label>
            <input type="date" value={to} onChange={e=>setTo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" />
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={load} disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Загрузка…" : "Применить"}
            </button>
            <button onClick={reset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              Сбросить
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200"></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Землесос</th>
              <th className="px-4 py-3 text-left font-semibold">Тип</th>
              <th className="px-4 py-3 text-left font-semibold">Компонент</th>
              <th className="px-4 py-3 text-left font-semibold">Описание</th>
              <th className="px-4 py-3 text-left font-semibold">Начало</th>
              <th className="px-4 py-3 text-left font-semibold">Окончание</th>
              <th className="px-4 py-3 text-left font-semibold">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="border-t border-gray-200 hover:bg-blue-50/40 transition">
                <td className="px-4 py-3">
                  {r.dredger_id ? (
                    <Link to={`/dredgers/${r.dredger_id}/components`} className="text-blue-600 underline hover:text-blue-800 transition">{r.dredger_inv}</Link>
                  ) : r.dredger_inv}
                </td>
                <td className="px-4 py-3">{r.dredger_type}</td>
                <td className="px-4 py-3">{r.component}</td>
                <td className="px-4 py-3">{r.description}</td>
                <td className="px-4 py-3">{df(r.start_date)}</td>
                <td className="px-4 py-3">{df(r.end_date)}</td>
                <td className="px-4 py-3"><Badge s={r.status} /></td>
              </tr>
            ))}
            {!loading && rows.length===0 && (
              <tr className="border-t border-gray-200"><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-base">Нет данных</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
