import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

interface Dredger {
  id: number;
  inv_number: string;
  type_name: string;
}

export default function DredgersList() {
  const [rows, setRows] = useState<Dredger[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/dredgers/", { params: { page_size: 1000 } })
      .then((r) => setRows(r.data.results ?? r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Землесосы</h1>

      <div className="bg-white border rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Инв. №</th>
              <th className="px-3 py-2 text-left">Тип</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Link
                    to={`/dredgers/${d.id}`}
                    className="text-blue-600 underline"
                  >
                    {d.inv_number}
                  </Link>
                </td>
                <td className="px-3 py-2">{d.type_name}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={2} className="px-3 py-6 text-center text-gray-500">
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
