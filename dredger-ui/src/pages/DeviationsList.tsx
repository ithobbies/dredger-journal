import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { PlusCircle } from "lucide-react";

interface Dredger { id: number; inv_number: string }
interface Deviation {
  id: number; date: string; dredger: number;
  type: string; location: string; description: string;
}

const TYPE_MAP: Record<string, string> = {
  mechanical:   "Механический",
  electrical:   "Электрический",
  technological:"Технологический",
};
const LS_KEY = "deviationsFilters";

export default function DeviationsList() {
  /* фильтры из localStorage */
  const ls = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  const [dredger, setDredger] = useState<number | "">(ls.dredger ?? "");
  const [type,    setType]    = useState(ls.type ?? "");
  const [from,    setFrom]    = useState(ls.from ?? "");
  const [to,      setTo]      = useState(ls.to   ?? "");

  /* справочники */
  const [dredgers, setDredgers] = useState<Dredger[]>([]);

  /* данные + пагинация */
  const [rows, setRows] = useState<Deviation[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize   = 25;
  const totalPages = Math.ceil(count / pageSize);

  /* ───── API ───── */
  useEffect(() => {
    api.get("/dredgers/").then(r => setDredgers(r.data.results ?? r.data));
  }, []);

  const saveFilters = (d = dredger, t = type, f = from, tp = to) =>
    localStorage.setItem(LS_KEY, JSON.stringify({ dredger: d, type: t, from: f, to: tp }));

  const load = (p = 1) => {
    setLoading(true);
    api.get("/deviations/", {
      params: {
        page: p,
        dredger: dredger || undefined,
        type:    type    || undefined,
        date_after: from || undefined,
        date_before: to  || undefined,
        ordering: "-date",
      },
    }).then(r => {
      setRows(r.data.results ?? r.data);
      setCount(r.data.count ?? r.data.length);
      setPage(p);
      saveFilters();
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [dredger, type, from, to]);

  const reset = () => {
    setDredger(""); setType(""); setFrom(""); setTo("");
    saveFilters("", "","","");
    setTimeout(() => load(1));
  };

  /* ───── UI ───── */
  return (
    <div className="p-6 bg-[#fafbfc] min-h-screen">
      {/* заголовок + кнопка */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Журнал отклонений</h1>
        <Link
          to="/deviations/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-sm transition"
        >
          <PlusCircle size={20} /> Новое отклонение
        </Link>
      </div>

      {/* ЕДИНЫЙ контейнер */}
      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-x-auto">
        <div className="p-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Землесос</label>
            <select
              value={dredger}
              onChange={e => setDredger(Number(e.target.value) || "")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            >
              <option value="">Все землесосы</option>
              {dredgers.map(d => <option key={d.id} value={d.id}>{d.inv_number}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            >
              <option value="">Все виды</option>
              {Object.entries(TYPE_MAP).map(([v,l]) =>
                <option key={v} value={v}>{l}</option>
              )}
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
            <button onClick={() => load(1)} disabled={loading}
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
              <th className="px-4 py-3 text-left font-semibold">Дата</th>
              <th className="px-4 py-3 text-left font-semibold">Тип</th>
              <th className="px-4 py-3 text-left font-semibold">Участок</th>
              <th className="px-4 py-3 text-left font-semibold">Описание</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const dr = dredgers.find(d => d.id === r.dredger);
              return (
                <tr key={r.id} className="border-t border-gray-200 hover:bg-blue-50/40 transition">
                  <td className="px-4 py-3">
                    {dr ? (
                      <Link to={`/dredgers/${r.dredger}/components`}
                        className="text-blue-600 underline hover:text-blue-800 transition">
                        {dr.inv_number}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">{TYPE_MAP[r.type] || r.type}</td>
                  <td className="px-4 py-3">{r.location}</td>
                  <td className="px-4 py-3">{r.description}</td>
                </tr>
              );
            })}

            {!loading && rows.length === 0 && (
              <tr className="border-t border-gray-200">
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-base">
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* пагинация */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-end gap-2">
          <button
            onClick={() => page > 1 && load(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >«</button>
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          <button
            onClick={() => page < totalPages && load(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >»</button>
        </div>
      </div>
    </div>
  );
}
