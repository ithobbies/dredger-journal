import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { PlusCircle } from "lucide-react";

interface Part {
  id: number;
  code: string;
  name: string;
  manufacturer: string;
  norm_hours: number;
  drawing_file: string | null;
}

export default function SparePartsList() {
  const [rows, setRows] = useState<Part[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/refdata/spare-parts/", { params: { search } })
      .then((r) => setRows(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [search]);

  return (
    <div className="p-6 bg-[#fafbfc] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Запчасти</h1>
        <Link 
          to="/spare-parts/new" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-sm transition"
        >
          <PlusCircle size={20} /> Новая запчасть
        </Link>
      </div>

      {/* ЕДИНЫЙ контейнер */}
      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-x-auto">
        <div className="p-6">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <input
              placeholder="Поиск (код / название / производитель)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Код</th>
              <th className="px-4 py-3 text-left font-semibold">Название</th>
              <th className="px-4 py-3 text-left font-semibold">Произв.</th>
              <th className="px-4 py-3 text-left font-semibold">Норма, ч</th>
              <th className="px-4 py-3 text-left font-semibold">Чертёж</th>
              <th className="px-4 py-3 text-left font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-gray-200 hover:bg-blue-50/40 transition">
                <td className="px-4 py-3">{p.code}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.manufacturer}</td>
                <td className="px-4 py-3 text-center">{p.norm_hours}</td>
                <td className="px-4 py-3 text-center">
                  {p.drawing_file && (
                    <a
                      href={`http://localhost:8000${p.drawing_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 transition"
                    >
                      PDF
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    className="text-blue-600 underline hover:text-blue-800 transition"
                    to={`/spare-parts/${p.id}/edit`}
                  >
                    Ред.
                  </Link>
                </td>
              </tr>
            ))}

            {!loading && rows.length === 0 && (
              <tr className="border-t border-gray-200">
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-base">
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
