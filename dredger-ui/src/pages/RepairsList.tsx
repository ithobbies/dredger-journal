import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DateRangePicker from "../components/DateRangePicker";

interface Dredger { id: number; inv_number: string }
interface Repair  { id: number; dredger: number; start_date: string; end_date: string; notes: string }

const LS_KEY = "repairsFilters";

export default function RepairsList() {
  /* ─────────── фильтры ─────────── */
  const ls = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  const [dredger, setDredger] = useState<number | "">(ls.dredger ?? "");
  const [from,    setFrom]    = useState(ls.from ?? "");
  const [to,      setTo]      = useState(ls.to   ?? "");

  const [dredgers, setDredgers] = useState<Dredger[]>([]);

  /* ─────────── данные ─────────── */
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 25;
  const totalPages = Math.ceil(count / pageSize);

  /* ─────────── helpers ─────────── */
  const saveFilters = (dr = dredger, f = from, t = to) =>
    localStorage.setItem(LS_KEY, JSON.stringify({ dredger: dr, from: f, to: t }));

  const resetFilters = () => {
    setDredger(""); setFrom(""); setTo("");
    saveFilters("", "", "");
  };

  /* ─────────── справочник землесосов ─────────── */
  useEffect(() => {
    api.get("/dredgers/").then(r => setDredgers(r.data.results ?? r.data));
  }, []);

  /* ─────────── загрузка списка ─────────── */
  const load = (p = 1) =>
    api.get("/repairs/", {
      params: {
        page: p,
        dredger: dredger || undefined,
        start_date: from || undefined,
        end_date:   to   || undefined,
        ordering: "-start_date",
      },
    }).then(r => {
      setRepairs(r.data.results ?? r.data);
      setCount(r.data.count ?? r.data.length);
      setPage(p);
      saveFilters();                   // сохраняем успешный запрос
    });

  useEffect(() => { load(1); }, [dredger, from, to]);

  /* ─────────── UI ─────────── */
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Журнал ремонтов</h1>
        <Link to="/repairs/new" className="btn">+ Новый ремонт</Link>
      </div>

      {/* фильтры */}
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <DateRangePicker from={from} to={to}
          onChange={(f,v)=>f==="from"?setFrom(v):setTo(v)} />

        <select value={dredger} onChange={e=>setDredger(Number(e.target.value)||"")}
                className="border px-2 py-1 rounded">
          <option value="">Все землесосы</option>
          {dredgers.map(d=>(
            <option key={d.id} value={d.id}>{d.inv_number}</option>
          ))}
        </select>

        <button onClick={()=>load(1)}
          className={`px-3 py-1 rounded ${dredger||from||to?"bg-blue-600 text-white":"border"}`}>
          Применить
        </button>

        <button onClick={resetFilters} className="px-3 py-1 border rounded">
          Сбросить
        </button>
      </div>

      {/* таблица */}
      <table className="w-full border shadow-sm"> … (таблица без изменений) … </table>

      {/* пагинация */}
      … (пагинация без изменений) …
    </div>
  );
}
