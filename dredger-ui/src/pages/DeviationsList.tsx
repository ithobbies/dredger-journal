import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DateRangePicker from "../components/DateRangePicker";

interface Dredger { id: number; inv_number: string }
interface Deviation { id:number;date:string;dredger:number;type:string;location:string;description:string }

const TYPE_MAP: Record<string,string> = {
  mechanical:"Механический", electrical:"Электрический", technological:"Технологический",
};
const LS_KEY = "deviationsFilters";

export default function DeviationsList() {
  /* фильтры из localStorage */
  const ls = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  const [dredger, setDredger] = useState<number | "">(ls.dredger ?? "");
  const [tFilter, setTFilter] = useState(ls.type ?? "");
  const [from, setFrom] = useState(ls.from ?? "");
  const [to,   setTo]   = useState(ls.to   ?? "");

  const [dredgers,setDredgers]=useState<Dredger[]>([]);

  const saveFilters = (d=dredger,t=tFilter,f=from,tp=to)=>
    localStorage.setItem(LS_KEY,JSON.stringify({dredger:d,type:t,from:f,to:tp}));
  const resetFilters = ()=>{
    setDredger(""); setTFilter(""); setFrom(""); setTo("");
    saveFilters("","","","");
  };

  /* данные */
  const [rows,setRows]=useState<Deviation[]>([]);
  const [page,setPage]=useState(1); const [count,setCount]=useState(0);
  const pageSize=25; const totalPages=Math.ceil(count/pageSize);

  useEffect(()=>{api.get("/dredgers/").then(r=>setDredgers(r.data.results??r.data));},[]);

  const load=(p=1)=>
    api.get("/deviations/",{
      params:{
        page:p,dredger:dredger||undefined,type:tFilter||undefined,
        date_after:from||undefined,date_before:to||undefined,ordering:"-date",
      },
    }).then(r=>{
      setRows(r.data.results??r.data);
      setCount(r.data.count??r.data.length); setPage(p);
      saveFilters();
    });

  useEffect(()=>{load(1);},[dredger,tFilter,from,to]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Журнал отклонений</h1>
        <Link to="/deviations/new" className="btn">+ Новое отклонение</Link>
      </div>

      <div className="flex flex-wrap gap-4 items-end mb-4">
        <DateRangePicker from={from} to={to}
          onChange={(f,v)=>f==="from"?setFrom(v):setTo(v)} />

        <select value={tFilter} onChange={e=>setTFilter(e.target.value)}
                className="border px-2 py-1 rounded">
          <option value="">Все виды</option>
          {Object.entries(TYPE_MAP).map(([v,l])=>
            <option key={v} value={v}>{l}</option>)}
        </select>

        <select value={dredger} onChange={e=>setDredger(Number(e.target.value)||"")}
                className="border px-2 py-1 rounded">
          <option value="">Все землесосы</option>
          {dredgers.map(d=><option key={d.id} value={d.id}>{d.inv_number}</option>)}
        </select>

        <button onClick={()=>load(1)}
          className={`px-3 py-1 rounded ${dredger||tFilter||from||to?"bg-blue-600 text-white":"border"}`}>
          Применить
        </button>

        <button onClick={resetFilters} className="px-3 py-1 border rounded">
          Сбросить
        </button>
      </div>

      <table className="w-full border shadow-sm"> … (таблица без изменений) … </table>
      … (пагинация без изменений) …
    </div>
  );
}
