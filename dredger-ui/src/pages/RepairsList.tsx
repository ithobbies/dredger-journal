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
    if (status  !== "all") p.status  = status;
    if (from) p.start_date = from;
    if (to)   p.end_date   = to;

    api.get("/repairs/", { params: p }).then(r => {
      const list = r.data.results ?? r.data;
      setRows(list.map((x: any) => ({
        id:           x.id,
        dredger_inv:  x.dredger?.inv_number ?? x.dredger_inv ?? x.dredger,
        dredger_id:   x.dredger?.id ?? null,
        dredger_type: x.dredger?.type_name ?? "—",
        component:    x.items?.[0]?.component?.part?.name ?? x.component ?? "—",
        description:  x.notes ?? x.description ?? "",
        start_date:   x.start_date,
        end_date:     x.end_date,
        status: (() => {
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
    <div className="p-6">
      {/* заголовок */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Журнал ремонтов</h1>
        <Link
          to="/repairs/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded"
        >
          <PlusCircle size={18} /> Новый ремонт
        </Link>
      </div>

      {/* фильтр */}
      <div className="bg-white border rounded shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
        {/* каждый селект/инпут растягивается одинаково */}
        <select
          value={dredger} onChange={e=>setDredger(e.target.value)}
          className="flex-1 min-w-[160px] border rounded px-3 py-2"
        >
          <option value="all">Все землесосы</option>
          {dredgers.map(d=> <option key={d.id} value={d.id}>{d.inv_number}</option>)}
        </select>

        <select
          value={status} onChange={e=>setStatus(e.target.value)}
          className="flex-1 min-w-[160px] border rounded px-3 py-2"
        >
          <option value="all">Любой статус</option>
          <option value="in_progress">В работе</option>
          <option value="completed">Завершено</option>
          <option value="planned">Запланировано</option>
        </select>

        <input type="date" value={from} onChange={e=>setFrom(e.target.value)}
          className="flex-1 min-w-[160px] border rounded px-3 py-2" />
        <input type="date" value={to} onChange={e=>setTo(e.target.value)}
          className="flex-1 min-w-[160px] border rounded px-3 py-2" />

        {/* кнопки */}
        <button onClick={load} disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
        >
          {loading ? "Загрузка…" : "Применить"}
        </button>

        <button onClick={reset}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2 rounded"
        >
          Сбросить
        </button>
      </div>

      {/* таблица */}
      <div className="bg-white border rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Землесос</th>
              <th className="px-3 py-2 text-left">Тип</th>
              <th className="px-3 py-2 text-left">Компонент</th>
              <th className="px-3 py-2 text-left">Описание</th>
              <th className="px-3 py-2 text-left">Начало</th>
              <th className="px-3 py-2 text-left">Окончание</th>
              <th className="px-3 py-2 text-left">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  {r.dredger_id ? (
                    <Link to={`/dredgers/${r.dredger_id}/components`}
                      className="text-blue-600 underline">{r.dredger_inv}</Link>
                  ) : r.dredger_inv}
                </td>
                <td className="px-3 py-2">{r.dredger_type}</td>
                <td className="px-3 py-2">{r.component}</td>
                <td className="px-3 py-2">{r.description}</td>
                <td className="px-3 py-2">{df(r.start_date)}</td>
                <td className="px-3 py-2">{df(r.end_date)}</td>
                <td className="px-3 py-2"><Badge s={r.status} /></td>
              </tr>
            ))}

            {!loading && rows.length===0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                Нет данных
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
