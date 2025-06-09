import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Dredger } from "../types";
import { Eye, Wrench, AlertTriangle } from "lucide-react";

// Карточка землесоса
function DredgerCard({ dredger }: { dredger: Dredger }) {
  let imageSrc = null;
  let imageAlt = '';
  if (dredger.type_name === 'LHD-49') {
    imageSrc = '/lhd-49.png';
    imageAlt = 'LHD-49';
  } else if (dredger.type_name !== 'HHD-76') {
    imageSrc = '/2GRT.png';
    imageAlt = dredger.type_name;
  }
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-200 hover:shadow-xl transition">
      {imageSrc && (
        <img src={imageSrc} alt={imageAlt} className="w-full h-44 object-contain mx-auto mb-1" />
      )}
      <div className="text-2xl font-bold text-center mt-1 mb-1">Хоз. №{dredger.inv_number}</div>
      <div className="text-gray-500 text-lg text-center mb-3">Тип: {dredger.type_name}</div>
      <a
        href={`/dredgers/${dredger.id}`}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition text-base shadow mb-2"
      >
        <Eye size={20} /> Дополнительно
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
