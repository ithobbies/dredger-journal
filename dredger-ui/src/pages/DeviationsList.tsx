import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { PlusCircle } from "lucide-react";   // ← значок

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
  const pageSize   = 25;
  const totalPages = Math.ceil(count / pageSize);

  /* ───── API ───── */
  useEffect(() => {
    api.get("/dredgers/").then(r => setDredgers(r.data.results ?? r.data));
  }, []);

  const saveFilters = (d = dredger, t = type, f = from, tp = to) =>
    localStorage.setItem(LS_KEY, JSON.stringify({ dredger: d, type: t, from: f, to: tp }));

  const load = (p = 1) =>
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
    });

  useEffect(() => { load(1); }, [dredger, type, from, to]);

  const reset = () => {
    setDredger(""); setType(""); setFrom(""); setTo("");
    saveFilters("", "","","");
    setTimeout(() => load(1));
  };

  /* ───── UI ───── */
  return (
    <div className="p-6">
      {/* заголовок + кнопка */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Журнал отклонений</h1>
        <Link
          to="/deviations/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded"
        >
          <PlusCircle size={18} /> Новое отклонение
        </Link>
      </div>

      {/* фильтр */}
      <div className="bg-white border rounded shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
        <select
          value={dredger}
          onChange={e => setDredger(Number(e.target.value) || "")}
          className="flex-1 min-w-[160px] border rounded px-3 py-2"
        >
          <option value="">Все землесосы</option>
          {dredgers.map(d => <option key={d.id} value={d.id}>{d.inv_number}</option>)}
        </select>

        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="flex-1 min-w-[160px] border rounded px-3 py-2"
        >
          <option value="">Все виды</option>
          {Object.entries(TYPE_MAP).map(([v,l]) =>
            <option key={v} value={v}>{l}</option>
          )}
        </select>

        <input type="date" value={from} onChange={e=>setFrom(e.target.value)}
          className="flex-1 min-w-[160px] border rounded px-3 py-2" />
        <input type="date" value={to} onChange={e=>setTo(e.target.value)}
          className="flex-1 min-w-[160px] border rounded px-3 py-2" />

        <button onClick={() => load(1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded">
          Применить
        </button>

        <button onClick={reset}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2 rounded">
          Сбросить
        </button>
      </div>

      {/* таблица */}
      <div className="bg-white border rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Землесос</th>
              <th className="px-3 py-2 text-left">Дата</th>
              <th className="px-3 py-2 text-left">Тип</th>
              <th className="px-3 py-2 text-left">Участок</th>
              <th className="px-3 py-2 text-left">Описание</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const dr = dredgers.find(d => d.id === r.dredger);
              return (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {dr ? (
                      <Link to={`/dredgers/${r.dredger}/components`}
                        className="text-blue-600 underline">
                        {dr.inv_number}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2">{TYPE_MAP[r.type] || r.type}</td>
                  <td className="px-3 py-2">{r.location}</td>
                  <td className="px-3 py-2">{r.description}</td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* пагинация */}
      <div className="flex items-center justify-end mt-4 gap-2">
        <button
          onClick={() => page > 1 && load(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50">«</button>
        <span>{page} / {totalPages}</span>
        <button
          onClick={() => page < totalPages && load(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50">»</button>
      </div>
    </div>
  );
}
