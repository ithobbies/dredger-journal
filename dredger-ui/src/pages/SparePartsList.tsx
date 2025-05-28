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

  const load = () =>
    api
      .get("/refdata/spare-parts/", { params: { search } })
      .then((r) => setRows(r.data.results ?? r.data));

  useEffect(() => {
    load();
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Запчасти</h1>
        <Link to="/spare-parts/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded">
          <PlusCircle size={18} /> Новая запчасть
        </Link>
      </div>

      <input
        placeholder="Поиск (код / название / производитель)"
        className="border px-3 py-2 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full border shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Код</th>
            <th className="border px-2 py-1">Название</th>
            <th className="border px-2 py-1">Произв.</th>
            <th className="border px-2 py-1">Норма, ч</th>
            <th className="border px-2 py-1">Чертёж</th>
            <th className="border px-2 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-t hover:bg-gray-50">
              <td className="px-2 py-1">{p.code}</td>
              <td className="px-2 py-1">{p.name}</td>
              <td className="px-2 py-1">{p.manufacturer}</td>
              <td className="px-2 py-1 text-center">{p.norm_hours}</td>
              <td className="px-2 py-1 text-center">
                {p.drawing_file && (
                  <a
                    href={`http://localhost:8000${p.drawing_file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    PDF
                  </a>
                )}
              </td>
              <td className="px-2 py-1 text-center">
                <Link
                  className="text-blue-600 underline"
                  to={`/spare-parts/${p.id}/edit`}
                >
                  Ред.
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
