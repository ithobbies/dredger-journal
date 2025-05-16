// src/pages/RepairForm.tsx
import { useEffect, useState, FormEvent } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

interface Dredger { id: number; inv_number: string; }
interface TemplateRow {
  part_id: number;
  part_name: string;
  norm_hours: number;
  component_id: number | null;
  current_hours: number;
}

export default function RepairForm() {
  const nav = useNavigate();
  const [dredgers, setDredgers] = useState<Dredger[]>([]);
  const [dredgerId, setDredgerId] = useState<number | "">("");
  const [template, setTemplate] = useState<TemplateRow[]>([]);
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [notes, setNotes] = useState("");

  // загрузка землесосов
  useEffect(() => {
    api.get("/dredgers/").then((r) => setDredgers(r.data));
  }, []);

  // загрузка шаблона при выборе землесоса
  useEffect(() => {
    if (typeof dredgerId === "number")
      api
        .get(`/dredgers/${dredgerId}/template/`)
        .then((r) => setTemplate(r.data));
    else setTemplate([]);
  }, [dredgerId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const items = template.map((t) => ({
      component: t.component_id,      // если null – фронт может пропускать
      hours: (document.getElementById(`h_${t.part_id}`) as HTMLInputElement)
        .valueAsNumber,
      note: "",
    }));
    await api.post("/repairs/", {
      dredger: dredgerId,
      start_date: startDate,
      end_date: endDate,
      notes,
      items,
    });
    nav("/repairs");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Новый ремонт</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* выбор землесоса */}
        <select
          value={dredgerId}
          onChange={(e) => setDredgerId(Number(e.target.value) || "")}
          className="border px-3 py-2 rounded"
          required
        >
          <option value="">-- выбрать землесос --</option>
          {dredgers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.inv_number}
            </option>
          ))}
        </select>

        {/* даты */}
        <div className="flex gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStart(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEnd(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />
        </div>

        {/* таблица агрегатов */}
        {template.length > 0 && (
          <table className="w-full border shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Агрегат</th>
                <th className="border px-2 py-1">Текущие часы</th>
                <th className="border px-2 py-1">Новые часы</th>
              </tr>
            </thead>
            <tbody>
              {template.map((t) => (
                <tr key={t.part_id} className="border-t">
                  <td className="px-2 py-1">{t.part_name}</td>
                  <td className="px-2 py-1 text-center">
                    {t.current_hours}
                  </td>
                  <td className="px-2 py-1 text-center">
                    <input
                      id={`h_${t.part_id}`}
                      type="number"
                      defaultValue={t.current_hours}
                      className="w-24 border rounded px-1 py-0.5 text-right"
                      min={0}
                      required
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* примечание */}
        <textarea
          placeholder="Примечание"
          className="w-full border rounded px-3 py-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button className="btn" type="submit">
          Сохранить
        </button>
      </form>
    </div>
  );
}
