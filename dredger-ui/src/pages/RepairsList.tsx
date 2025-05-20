import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

// ──────────────── типы данных ────────────────
interface Repair {
  id: number;
  dredger_inv: string;
  component: string;
  description: string;
  start_date: string;
  end_date: string | null;
  status: "in_progress" | "completed" | "planned";
}

interface DredgerOption {
  id: number;
  inv_number: string;
}

// ─────────────── служебные вещи ──────────────
const STATUS_MAP: Record<
  Repair["status"],
  { text: string; color: string }
> = {
  in_progress: { text: "In progress", color: "bg-blue-500" },
  completed: { text: "Completed", color: "bg-emerald-500" },
  planned: { text: "Planned", color: "bg-gray-400" },
};

function StatusBadge({ status }: { status: Repair["status"] }) {
  const { text, color } = STATUS_MAP[status];
  return (
    <span
      className={`text-white text-xs px-3 py-1 rounded-full whitespace-nowrap ${color}`}
    >
      {text}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

// ─────────────────── страница ───────────────────
export default function RepairsList() {
  /* фильтры */
  const [dredgers, setDredgers] = useState<DredgerOption[]>([]);
  const [dredger, setDredger] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  /* данные */
  const [rows, setRows] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);

  // список землесосов (для селекта)
  useEffect(() => {
    api.get("/dredgers/").then((r) => {
      const list: DredgerOption[] = r.data.results ?? r.data;
      setDredgers(list);
    });
  }, []);

  // загрузить ремонты
  const load = () => {
    setLoading(true);
    const params: any = {};
    if (dredger !== "all") params.dredger = dredger;
    if (status !== "all") params.status = status;
    if (start) params.start_date = start;
    if (end) params.end_date = end;

    api
      .get("/repairs/", { params })
      .then((r) => {
        const data = r.data.results ?? r.data;
        const prettified: Repair[] = data.map((x: any) => ({
          id: x.id,
          dredger_inv:
            x.dredger?.inv_number ?? x.dredger_inv ?? x.dredger ?? "—",
          component: x.items?.[0]?.component?.part?.name ?? x.component ?? "—",
          description: x.notes ?? x.description ?? "",
          start_date: x.start_date,
          end_date: x.end_date,
          status: x.status ?? (x.end_date ? "completed" : "in_progress"),
        }));
        setRows(prettified);
      })
      .finally(() => setLoading(false));
  };

  // первичная загрузка
  useEffect(load, []);

  return (
    <div className="p-6">
      {/* строка заголовка + кнопка */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Repair Works</h1>

        <Link
          to="/repairs/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded"
        >
          + New repair
        </Link>
      </div>

      {/* блок фильтров */}
      <div className="mb-6 bg-white border rounded shadow-sm p-4">
        <h2 className="font-semibold text-lg mb-4">Filter</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-1">Dredger</label>
            <select
              value={dredger}
              onChange={(e) => setDredger(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">All</option>
              {dredgers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.inv_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">All</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="planned">Planned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Date from</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Date to</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={load}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
          >
            {loading ? "Loading..." : "Apply"}
          </button>
        </div>
      </div>

      {/* таблица ремонтов */}
      <div className="bg-white border rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Dredger</th>
              <th className="px-3 py-2 text-left">Component</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Start Date</th>
              <th className="px-3 py-2 text-left">End Date</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{r.dredger_inv}</td>
                <td className="px-3 py-2">{r.component}</td>
                <td className="px-3 py-2">{r.description}</td>
                <td className="px-3 py-2">{formatDate(r.start_date)}</td>
                <td className="px-3 py-2">{formatDate(r.end_date)}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}

            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
