import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DateRangePicker from "../components/DateRangePicker";

interface Dredger { id: number; inv_number: string }
interface Deviation {
  id: number;
  date: string;
  dredger: number;
  type: string;
  location: string;
  description: string;
}

const TYPE_MAP: Record<string,string> = {
  mechanical: "Механический",
  electrical: "Электрический",
  technological: "Технологический",
};

export default function DeviationsList() {
  /* фильтры */
  const [dredgers, setDredgers] = useState<Dredger[]>([]);
  const [dredger, setDredger]   = useState<number | "">("");
  const [tFilter, setTFilter]   = useState("");
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState("");

  /* данные */
  const [rows, setRows] = useState<Deviation[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 25;
  const totalPages = Math.ceil(count / pageSize);

  /* справочник землесосов */
  useEffect(()=>{
    api.get("/dredgers/").then(r=>setDredgers(r.data.results ?? r.data));
  },[]);

  /* загрузка списка */
  const load = (p=1) =>
    api.get("/deviations/", {
      params:{
        page: p,
        dredger: dredger || undefined,
        type: tFilter || undefined,
        date_after: from || undefined,
        date_before: to || undefined,
        ordering: "-date",
      },
    }).then(r=>{
      setRows(r.data.results ?? r.data);
      setCount(r.data.count ?? r.data.length);
      setPage(p);
    });

  useEffect(()=>{ load(1); }, [dredger, tFilter, from, to]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Журнал отклонений</h1>
        <Link to="/deviations/new" className="btn">+ Новое отклонение</Link>
      </div>

      {/* фильтры */}
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <DateRangePicker from={from} to={to}
          onChange={(f,v)=>f==="from"?setFrom(v):setTo(v)} />

        <select value={tFilter} onChange={e=>setTFilter(e.target.value)}
                className="border px-2 py-1 rounded">
          <option value="">Все виды</option>
          {Object.entries(TYPE_MAP).map(([v,l])=>(
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select value={dredger} onChange={e=>setDredger(Number(e.target.value)||"")}
                className="border px-2 py-1 rounded">
          <option value="">Все землесосы</option>
          {dredgers.map(d=>(
            <option key={d.id} value={d.id}>{d.inv_number}</option>
          ))}
        </select>

        <button onClick={()=>load(1)}
          className={`px-3 py-1 rounded ${dredger||tFilter||from||to?"bg-blue-600 text-white":"border"}`}>
          Применить
        </button>
      </div>

      {/* таблица */}
      <table className="w-full border shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Дата</th>
            <th className="border px-2 py-1">Землесос</th>
            <th className="border px-2 py-1">Вид</th>
            <th className="border px-2 py-1">Участок</th>
            <th className="border px-2 py-1">Описание</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(d=>(
            <tr key={d.id} className="border-t hover:bg-gray-50">
              <td className="px-2 py-1">{d.date}</td>
              <td className="px-2 py-1 text-center">
                <Link to={`/dredgers/${d.dredger}/components`} className="text-blue-600 underline">
                  {d.dredger}
                </Link>
              </td>
              <td className="px-2 py-1">{TYPE_MAP[d.type]}</td>
              <td className="px-2 py-1">{d.location}</td>
              <td className="px-2 py-1">{d.description}</td>
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
