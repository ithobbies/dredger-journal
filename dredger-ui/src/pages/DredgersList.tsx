import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Dredger } from "../types";

// Карточка землесоса
function DredgerCard({ dredger }: { dredger: Dredger }) {
  let image = null;
  if (dredger.type_name === 'LHD-49') {
    image = <img src="/lhd-49.png" alt="LHD-49" className="w-full h-32 object-contain mb-2" />;
  } else if (dredger.type_name !== 'HHD-76') {
    image = <img src="/2GRT.png" alt={dredger.type_name} className="w-full h-32 object-contain mb-2" />;
  }
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border hover:shadow-md transition">
      {image}
      <div className="text-lg font-semibold">{dredger.inv_number}</div>
      <div className="text-gray-500 text-sm">{dredger.type_name}</div>
      <a
        href={`/dredgers/${dredger.id}`}
        className="mt-2 inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-100 transition"
      >
        Подробнее
      </a>
    </div>
  );
}

export default function DredgersList() {
  const [allRows, setAllRows] = useState<Dredger[]>([]);
  const [rows, setRows] = useState<Dredger[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("");
  const [inv, setInv] = useState<string>("");
  const [types, setTypes] = useState<{id:number; name:string;}[]>([]);

  // Загрузка землесосов и типов
  useEffect(() => {
    setLoading(true);
    api.get("/dredgers/", { params: { page_size: 1000 } })
      .then(r => {
        const dredgers = r.data.results ?? r.data;
        setAllRows(dredgers);
        setRows(dredgers);
        // Собираем уникальные типы
        const uniqueTypes = Array.from(new Set(dredgers.map((d:any) => d.type_name)))
          .filter(Boolean)
          .map((name, i) => ({ id: i, name: String(name) }));
        setTypes(uniqueTypes);
      })
      .finally(() => setLoading(false));
  }, []);

  // Фильтрация
  useEffect(() => {
    let filtered = allRows;
    if (type) filtered = filtered.filter(d => d.type_name === type);
    if (inv) filtered = filtered.filter(d => d.inv_number.toLowerCase().includes(inv.toLowerCase()));
    setRows(filtered);
  }, [type, inv, allRows]);

  return (
    <div className="p-6 bg-[#fafbfc] min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Землесосы</h1>
      {/* Фильтры и поиск */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 min-w-[160px] focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          >
            <option value="">Все типы</option>
            {types.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Хоз. номер</label>
          <input
            type="text"
            value={inv}
            onChange={e => setInv(e.target.value)}
            placeholder="Поиск по номеру..."
            className="border border-gray-200 rounded-lg px-3 py-2 min-w-[160px] focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          />
        </div>
      </div>
      {/* Сетка карточек */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full text-center text-gray-400 py-10">Загрузка…</div>
        ) : rows.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-10">Нет данных</div>
        ) : (
          rows.map(d => <DredgerCard key={d.id} dredger={d} />)
        )}
      </div>
    </div>
  );
}
