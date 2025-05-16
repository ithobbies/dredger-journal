import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

interface Repair {
  id: number;
  dredger: number;
  dredger_number: string;   // если захотите включить в сериализатор
  start_date: string;
  end_date: string;
  notes: string;
}

export default function RepairsList() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);

  // пагинация
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);           // всего элементов

  useEffect(() => {
    setLoading(true);
    api
      .get("/repairs/", { params: { page } })
      .then((res) => {
        // DRF PageNumberPagination => {count, next, prev, results}
        setRepairs(res.data.results ?? res.data);
        setCount(res.data.count ?? res.data.length);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const pageSize = 25;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Журнал ремонтов</h1>

      {loading ? (
        <p>Загрузка…</p>
      ) : (
        <>
          <table className="w-full border shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 border">ID</th>
                <th className="px-2 py-1 border">Землесос</th>
                <th className="px-2 py-1 border">Период</th>
                <th className="px-2 py-1 border">Примечание</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-1 text-center">{r.id}</td>
                  <td className="px-2 py-1 text-center">{r.dredger}</td>
                  <td className="px-2 py-1 text-center">
                    {r.start_date} — {r.end_date}
                  </td>
                  <td className="px-2 py-1">{r.notes}</td>
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
              {Array.from({ length: totalPages }).map((_, idx) => {
                const n = idx + 1;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`px-3 py-1 border rounded ${
                      page === n ? "bg-blue-600 text-white" : ""
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
