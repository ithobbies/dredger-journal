import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import HistoryModal from "../components/HistoryModal";

/* ─────────── типы ─────────── */
interface Row {
  id: number;
  part: {
    name: string;
    norm_hours: number;
  };
  total_hours: number;
  serial_number: string | null;
}

/* ─────────── компонент ─────────── */
export default function DredgerComponents() {
  const { id } = useParams();                 // ID землесоса из URL
  const [rows, setRows]       = useState<Row[]>([]);
  const [invNum, setInvNum]   = useState("");
  const [historyFor, setHistoryFor] = useState<number | null>(null);  // ID компонента для модалки

  /* загрузка списка компонентов и самого землесоса */
  useEffect(() => {
    if (!id) return;

    api.get(`/dredgers/${id}/components/`).then(r => setRows(r.data));
    api.get(`/dredgers/${id}/`).then(r => setInvNum(r.data.inv_number));
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Компоненты землесоса {invNum}
      </h1>

      <table className="w-full border shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Агрегат</th>
            <th className="border px-2 py-1 w-1/3">Ресурс</th>
            <th className="border px-2 py-1 text-center">Часы / норматив</th>
            <th className="border px-2 py-1">Сер. № / История</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((c) => {
            const pct = Math.min(
              100,
              Math.round((c.total_hours / c.part.norm_hours) * 100)
            );

            const color =
              pct <= 70 ? "bg-green-500"
              : pct <= 90 ? "bg-yellow-400"
              : "bg-red-600";

            return (
              <tr key={c.id} className="border-t">
                {/* название агрегата */}
                <td className="px-2 py-1">{c.part.name}</td>

                {/* progress bar */}
                <td className="px-2 py-1">
                  <div className="w-full bg-gray-200 rounded">
                    <div
                      className={`${color} h-4 rounded transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>

                {/* часы / норматив */}
                <td className="px-2 py-1 text-center">
                  {c.total_hours} / {c.part.norm_hours} ({pct}%)
                </td>

                {/* серийный номер + ссылка «История» */}
                <td className="px-2 py-1">
                  {c.serial_number || "—"}
                  <button
                    onClick={() => setHistoryFor(c.id)}
                    className="ml-2 text-blue-600 underline text-sm"
                  >
                    История
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* модальное окно истории */}
      {historyFor && (
        <HistoryModal
          componentId={historyFor}
          onClose={() => setHistoryFor(null)}
        />
      )}
    </div>
  );
}
