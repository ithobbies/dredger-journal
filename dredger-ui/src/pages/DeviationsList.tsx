// src/pages/DeviationsList.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";

interface Deviation {
  id: number;
  date: string;
  dredger: number;
  type: string;
  location: string;
  description: string;
}

export default function DeviationsList() {
  const [rows, setRows] = useState<Deviation[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    api.get("/deviations/", { params: { page } }).then((r) => {
      setRows(r.data.results ?? r.data);
      setCount(r.data.count ?? r.data.length);
    });
  }, [page]);

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Журнал отклонений</h1>
      <table className="w-full border shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1 border">Дата</th>
            <th className="px-2 py-1 border">Землесос</th>
            <th className="px-2 py-1 border">Вид</th>
            <th className="px-2 py-1 border">Участок</th>
            <th className="px-2 py-1 border">Описание</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id} className="border-t hover:bg-gray-50">
              <td className="px-2 py-1">{d.date}</td>
              <td className="px-2 py-1 text-center">{d.dredger}</td>
              <td className="px-2 py-1">{d.type}</td>
              <td className="px-2 py-1">{d.location}</td>
              <td className="px-2 py-1">{d.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* пагинация */}
      {totalPages > 1 && (
        <div className="flex gap-1 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`px-3 py-1 border rounded ${
                page === idx + 1 ? "bg-blue-600 text-white" : ""
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
