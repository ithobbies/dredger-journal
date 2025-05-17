import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

/* ─────────── типы ─────────── */
interface Dredger {
  id: number;
  inv_number: string;
}
interface TemplateRow {
  part_id: number;
  part_name: string;
  norm_hours: number;
  current_hours: number;
  component_id: number | null;
}

/* ─────────── компонент ─────────── */
export default function RepairForm() {
  const nav = useNavigate();

  /* справочник землесосов */
  const [dredgers, setDredgers] = useState<Dredger[]>([]);
  const [dredgerId, setDredgerId] = useState<number | "">("");

  /* шаблон агрегатов */
  const [template, setTemplate] = useState<TemplateRow[]>([]);

  /* поля формы */
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [notes, setNotes] = useState("");

  /* валидация часов */
  const [hoursMap, setHoursMap] = useState<Record<number, number>>({});
  const [errors,   setErrors]   = useState<Record<number, boolean>>({});

  /* ─────── загрузка землесосов ─────── */
  useEffect(() => {
    api.get("/dredgers/").then(r =>
      setDredgers(r.data.results ?? r.data)
    );
  }, []);

  /* ─────── загрузка шаблона ─────── */
  useEffect(() => {
    if (typeof dredgerId === "number")
      api.get(`/dredgers/${dredgerId}/template/`).then(r => setTemplate(r.data));
    else setTemplate([]);
  }, [dredgerId]);

  /* ─────── обработчик часов ─────── */
  const handleHours = (row: TemplateRow) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setHoursMap(p => ({ ...p, [row.part_id]: val }));
      setErrors(p => ({ ...p, [row.part_id]: val > row.norm_hours }));
    };

  /* ─────── submit ─────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const items = template.map(t => ({
      component: t.component_id,
      hours: hoursMap[t.part_id] ?? t.current_hours,
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

  const hasErrors = Object.values(errors).some(Boolean);

  /* ─────────── UI ─────────── */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Новый ремонт</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* выбор землесоса */}
        <select
          value={dredgerId}
          onChange={e => setDredgerId(Number(e.target.value) || "")}
          className="border px-3 py-2 rounded w-64"
          required
        >
          <option value="">-- выбрать землесос --</option>
          {dredgers.map(d => (
            <option key={d.id} value={d.id}>{d.inv_number}</option>
          ))}
        </select>

        {/* даты */}
        <div className="flex gap-4">
          <input
            type="date"
            value={startDate}
            onChange={e => setStart(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEnd(e.target.value)}
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
                <th className="border px-2 py-1">Новые часы (%)</th>
              </tr>
            </thead>
            <tbody>
              {template.map(t => {
                const val = hoursMap[t.part_id] ?? t.current_hours;
                const pct = Math.round((val / t.norm_hours) * 100);

                return (
                  <tr key={t.part_id} className="border-t">
                    <td className="px-2 py-1">{t.part_name}</td>
                    <td className="px-2 py-1 text-center">{t.current_hours}</td>
                    <td className="px-2 py-1 text-center">
                      <input
                        type="number"
                        min={0}
                        defaultValue={t.current_hours}
                        className={`w-24 border rounded px-1 py-0.5 text-right ${
                          errors[t.part_id] ? "border-red-600 bg-red-50" : ""
                        }`}
                        onChange={handleHours(t)}
                        required
                      />
                      <span className="ml-2 text-sm">{pct}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* примечание */}
        <textarea
          placeholder="Примечание"
          className="w-full border rounded px-3 py-2"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <button className="btn" type="submit" disabled={hasErrors}>
          Сохранить
        </button>
      </form>
    </div>
  );
}
