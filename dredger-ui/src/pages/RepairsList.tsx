import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DateRangePicker from "../components/DateRangePicker";

interface Dredger { id: number; inv_number: string }
interface Repair {
  id: number;
  dredger: number;
  start_date: string;
  end_date: string;
  notes: string;
}

export default function RepairsList() {
  /* фильтры */
  const [dredgers, setDredgers] = useState<Dredger[]>([]);
  const [dredger, setDredger]   = useState<number | "">("");
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState("");

  /* данные */
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [page, setPage]       = useState(1);
  const [count, setCount]     = useState(0);
  const pageSize = 25;
  const totalPages = Math.ceil(count / pageSize);

  /* справочник землесосов */
  useEffect(() => {
    api.get("/dredgers/").then(r =>
      setDredgers(r.data.results ?? r.data)
    );
  }, []);

  /* загрузка списка */
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
    });

  useEffect(() => { load(1); }, [dredger, from, to]);

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
      </div>

      {/* таблица */}
      <table className="w-full border shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Землесос</th>
            <th className="border px-2 py-1">Период</th>
            <th className="border px-2 py-1">Примечание</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map(r=>(
            <tr key={r.id} className="border-t hover:bg-gray-50">
              <td className="px-2 py-1 text-center">{r.id}</td>
              <td className="px-2 py-1 text-center">
                <Link to={`/dredgers/${r.dredger}/components`} className="text-blue-600 underline">
                  {r.dredger}
                </Link>
              </td>
              <td className="px-2 py-1 text-center">
                {r.start_date} — {r.end_date}
              </td>
              <td className="px-2 py-1">{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* пагинация */}
      {totalPages>1 && (
        <div className="flex gap-1 mt-4">
          <button onClick={()=>load(page-1)} disabled={page===1}
                  className="px-3 py-1 border rounded disabled:opacity-50">‹</button>
          {Array.from({length:totalPages}).map((_,i)=>(
            <button key={i+1} onClick={()=>load(i+1)}
              className={`px-3 py-1 border rounded ${page===i+1?"bg-blue-600 text-white":""}`}>
              {i+1}
            </button>
          ))}
          <button onClick={()=>load(page+1)} disabled={page===totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50">›</button>
        </div>
      )}
    </div>
  );
}
