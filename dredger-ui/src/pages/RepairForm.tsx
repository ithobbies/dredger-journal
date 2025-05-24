/* src/pages/RepairForm.tsx
   Итоговая рабочая версия: запись успешно создаётся, стили едины с журналом.
*/

import { useEffect, useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

/* ─────────── типы ─────────── */
interface Dredger {
  id: number;
  inv_number: string;
}

interface TemplateRow {
  /* id агрегата (ComponentInstance.id) ― то, что ожидaет backend в поле component */
  id: number;
  /* справочные поля */
  part_id: number;
  part_name: string;
  norm_hours: number;
  current_hours: number;
}

/* ─────────── компонент ─────────── */
export default function RepairForm() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  /* справочники */
  const [dredgers, setDredgers] = useState<Dredger[]>([]);
  const [template, setTemplate] = useState<TemplateRow[]>([]);

  /* поля формы */
  const [dredgerId, setDredgerId] = useState<number | "">("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [notes, setNotes] = useState("");

  /* наработки */
  const [hours, setHours] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  /* ─── загрузка землесосов ─── */
  useEffect(() => {
    api.get("/dredgers/").then(r => setDredgers(r.data.results ?? r.data));
  }, []);

  /* ─── редактирование ─── */
  useEffect(() => {
    if (!id) return;
    api.get(`/repairs/${id}/`).then(r => {
      const d = r.data;
      setDredgerId(d.dredger);
      setStart(d.start_date);
      setEnd(d.end_date);
      setNotes(d.notes || "");

      // установим hours из пришедших items
      setHours(
        Object.fromEntries(
          (d.items || []).map((it: any) => [it.component.part_id, it.hours])
        )
      );
    });
  }, [id]);

  /* ─── шаблон агрегатов ─── */
  useEffect(() => {
    if (typeof dredgerId !== "number") {
      setTemplate([]);
      return;
    }
    api.get(`/dredgers/${dredgerId}/template/`).then(r => setTemplate(r.data));
  }, [dredgerId]);

  const changeHours = (row: TemplateRow) => (e: any) =>
    setHours(p => ({ ...p, [row.part_id]: Number(e.target.value) }));

  /* ─────────── submit ─────────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dredgerId) return setError("Выберите землесос");

    // формируем items; backend ждёт component = id агрегата
    const items = template
      .map(t => ({
        component: t.id,
        hours: hours[t.part_id] ?? t.current_hours,
        note: "",
      }))
      // исключаем строки без id (на всякий случай)
      .filter(it => it.component !== null);

    if (items.length === 0)
      return setError("Выберите хотя бы один агрегат и укажите наработку.");

    const payload = {
      dredger: dredgerId,
      start_date: start,
      end_date: end,
      notes,
      items,
    };

    setSaving(true);
    try {
      if (isEdit) await api.put(`/repairs/${id}/`, payload);
      else        await api.post("/repairs/",     payload);

      nav("/repairs");
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        "Ошибка сохранения";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? "Редактировать ремонт" : "Новый ремонт"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* строка: землесос + даты */}
        <div className="flex flex-wrap gap-4 items-end">
          <select
            value={dredgerId}
            onChange={e => setDredgerId(Number(e.target.value) || "")}
            className="flex-1 min-w-[160px] border rounded px-3 py-2"
            required
          >
            <option value="">-- землесос --</option>
            {dredgers.map(d =>
              <option key={d.id} value={d.id}>{d.inv_number}</option>
            )}
          </select>

          <input
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="flex-1 min-w-[160px] border rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={end}
            onChange={e => setEnd(e.target.value)}
            className="flex-1 min-w-[160px] border rounded px-3 py-2"
            required
          />
        </div>

        {/* таблица агрегатов */}
        {template.length > 0 && (
          <table className="w-full border shadow-sm text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Агрегат</th>
                <th className="px-3 py-2 text-center">Норма, ч</th>
                <th className="px-3 py-2 text-center">Наработка, ч</th>
              </tr>
            </thead>
            <tbody>
              {template.map(row => (
                <tr key={row.part_id} className="border-t">
                  <td className="px-3 py-1">{row.part_name}</td>
                  <td className="px-3 py-1 text-center">{row.norm_hours}</td>
                  <td className="px-3 py-1 text-center">
                    <input
                      type="number"
                      min={0}
                      value={hours[row.part_id] ?? row.current_hours}
                      onChange={changeHours(row)}
                      className="w-24 border rounded px-2 py-1 text-right"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Примечание"
          className="w-full border rounded px-3 py-2"
          rows={3}
        />

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-6 py-2 rounded"
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
