import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
} from "recharts";

interface ResourceRow { id:number; inv_number:string; remain_pct:number }
interface RepairRow   { id:number; dredger__inv_number:string; end_date:string }
interface DevRow      { id:number; date:string; type:string; dredger__inv_number:string; description:string }
interface Down        { type:string; count:number }
interface Wear        { dredger:string; part:string; pct:number }

export default function Dashboard() {
  const [down,setDown]=useState<Down[]>([]);
  const [wear,setWear]=useState<Wear[]>([]);
  const [res,setRes]=useState<ResourceRow[]>([]);
  const [wrk,setWrk]=useState<RepairRow[]>([]);
  const [dev,setDev]=useState<DevRow[]>([]);

  useEffect(()=>{
    api.get("/reports/dashboard/").then(r=>{
      setDown(r.data.downtime);
      setWear(r.data.wear_top);
      setRes(r.data.dredger_resources);
      setWrk(r.data.repairs_in_progress);
      setDev(r.data.deviations_24h);
    });
  },[]);

  const COLORS=["#4ade80","#fde047","#f87171"];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* 1. диаграмма простоев + топ-5 износа */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-80 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={down} dataKey="count" outerRadius={80} label>
                {down.map((_,i)=><Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend /><Tooltip/>
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center mt-2 font-medium">Простои по видам</p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer>
            <BarChart layout="vertical" data={wear}>
              <XAxis type="number" domain={[0,100]} hide />
              <YAxis dataKey="part" type="category" tick={{fontSize:12}}/>
              <Bar dataKey="pct" fill="#60a5fa" />
              <Tooltip/>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center mt-2 font-medium">Топ-5 износа, %</p>
        </div>
      </div>

      {/* 2. остаточный ресурс землесосов */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Остаточный ресурс землесосов</h2>
        <table className="w-full border shadow-sm">
          <thead className="bg-gray-100"><tr>
            <th className="border px-2 py-1">З/с</th>
            <th className="border px-2 py-1">Остаток, %</th>
          </tr></thead>
          <tbody>
            {res.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="px-2 py-1 text-center">{r.inv_number}</td>
                <td className="px-2 py-1 text-center">{r.remain_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. землесосы в ремонте */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Землесосы в ремонте</h2>
        <table className="w-full border shadow-sm">
          <thead className="bg-gray-100"><tr>
            <th className="border px-2 py-1">Ремонт №</th>
            <th className="border px-2 py-1">З/с</th>
            <th className="border px-2 py-1">Окончание</th>
          </tr></thead>
          <tbody>
            {wrk.map(w=>(
              <tr key={w.id} className="border-t">
                <td className="px-2 py-1 text-center">{w.id}</td>
                <td className="px-2 py-1 text-center">{w.dredger__inv_number}</td>
                <td className="px-2 py-1 text-center">{w.end_date}</td>
              </tr>
            ))}
            {wrk.length===0 &&
              <tr><td colSpan={3} className="py-3 text-center text-gray-500">Нет ремонтов</td></tr>}
          </tbody>
        </table>
      </div>

      {/* 4. отклонения за сутки */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Отклонения за последние 24 ч</h2>
        <table className="w-full border shadow-sm">
          <thead className="bg-gray-100"><tr>
            <th className="border px-2 py-1">Дата</th>
            <th className="border px-2 py-1">З/с</th>
            <th className="border px-2 py-1">Тип</th>
            <th className="border px-2 py-1">Описание</th>
          </tr></thead>
          <tbody>
            {dev.map(d=>(
              <tr key={d.id} className="border-t">
                <td className="px-2 py-1">{d.date}</td>
                <td className="px-2 py-1 text-center">{d.dredger__inv_number}</td>
                <td className="px-2 py-1">{d.type}</td>
                <td className="px-2 py-1">{d.description}</td>
              </tr>
            ))}
            {dev.length===0 &&
              <tr><td colSpan={4} className="py-3 text-center text-gray-500">За сутки отклонений нет</td></tr>}
          </tbody>
        </table>
      </div>

      {/* 5. excel-кнопки */}
      <div className="flex gap-4">
        <a href="http://localhost:8000/api/reports/repairs_excel/" className="btn">Ремонты → Excel</a>
        <a href="http://localhost:8000/api/reports/deviations_excel/" className="btn">Отклонения → Excel</a>
      </div>
    </div>
  );
}
