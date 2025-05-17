import { useEffect, useState } from "react";
import api from "../api/axios";

interface Row {
  repair_id: number;
  dredger: string;
  start_date: string;
  end_date: string;
  hours: number;
  note: string;
}

export default function HistoryModal({
  componentId,
  onClose,
}: {
  componentId: number;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    api
      .get(`/repairs/components/${componentId}/history/`)
      .then((r) => setRows(r.data));
  }, [componentId]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">История агрегата</h2>

        <table className="w-full border shadow-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Ремонт</th>
              <th className="border px-2 py-1">Землесос</th>
              <th className="border px-2 py-1">Период</th>
              <th className="border px-2 py-1">Часы</th>
              <th className="border px-2 py-1">Прим.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.repair_id} className="border-t">
                <td className="px-2 py-1 text-center">{r.repair_id}</td>
                <td className="px-2 py-1 text-center">{r.dredger}</td>
                <td className="px-2 py-1 text-center">
                  {r.start_date} — {r.end_date}
                </td>
                <td className="px-2 py-1 text-center">{r.hours}</td>
                <td className="px-2 py-1">{r.note}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <button onClick={onClose} className="btn">Закрыть</button>
      </div>
    </div>
  );
}
