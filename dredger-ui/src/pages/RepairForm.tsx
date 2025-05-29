/* src/pages/RepairForm.tsx
   Итоговая рабочая версия: запись успешно создаётся, стили едины с журналом.
*/

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

/* ─────────── типы ─────────── */
interface Dredger {
  id: number;
  inv_number: string;
}

interface TemplateRow {
  /* id агрегата (ComponentInstance.id) ― то, что ожидaет backend в поле component */
  component_id: number | null;
  /* справочные поля */
  part_id: number;
  part_name: string;
  manufacturer: string;
  norm_hours: number;
  current_hours: number;
  serial_number: string;
  /* введённые пользователем часы */
  hours: number;
  /* флаг необходимости замены */
  needs_replacement: boolean;
  /* id нового компонента для замены */
  new_component_id: number | null;
}

/* ─────────── компонент ─────────── */
export default function RepairForm() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  /* справочники */
  const [dredgers, setDredgers] = useState<Dredger[]>([]);
  const [template, setTemplate] = useState<TemplateRow[]>([]);
  const [availableComponents, setAvailableComponents] = useState<Record<number, any[]>>({});

  /* поля формы */
  const [dredgerId, setDredgerId] = useState<number | "">("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [notes, setNotes] = useState("");

  /* наработки и замены */
  const [hours, setHours] = useState<Record<number, number>>({});
  const [replacements, setReplacements] = useState<Record<number, number | null>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    api.get(`/dredgers/${dredgerId}/template/`).then(r => {
      const templateData = r.data;
      setTemplate(templateData);
      
      // Загружаем доступные компоненты для каждой запчасти
      const partIds = templateData.map((t: TemplateRow) => t.part_id);
      api.get("/available-components/", { params: { part_ids: partIds.join(",") } })
        .then(response => {
          const componentsByPart = response.data.reduce((acc: any, comp: any) => {
            if (!acc[comp.part_id]) acc[comp.part_id] = [];
            acc[comp.part_id].push(comp);
            return acc;
          }, {});
          setAvailableComponents(componentsByPart);
        });
    });
  }, [dredgerId]);

  const changeHours = (row: TemplateRow) => (e: any) =>
    setHours(p => ({ ...p, [row.part_id]: Number(e.target.value) }));

  const toggleReplacement = (row: TemplateRow) => () => {
    setReplacements(p => {
      const newReplacements = { ...p };
      if (p[row.part_id]) {
        // Если уже была выбрана замена - отменяем её
        delete newReplacements[row.part_id];
      } else {
        // Если замены не было - добавляем с пустым значением (null)
        newReplacements[row.part_id] = null;
      }
      return newReplacements;
    });
  };

  const selectNewComponent = (row: TemplateRow) => (e: any) => {
    setReplacements(p => ({
      ...p,
      [row.part_id]: Number(e.target.value) || null
    }));
  };

  /* ─────────── submit ─────────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dredgerId) return setError("Выберите землесос");

    // формируем items; backend ждёт component = id агрегата
    const items = template
      .map(t => {
        const newComponentId = replacements[t.part_id];
        return {
          component: newComponentId || t.component_id,
          hours: hours[t.part_id] ?? t.current_hours,
          note: newComponentId ? "Замена компонента" : ""
        };
      })
      .filter(it => it.hours > 0 && it.component !== null);

    if (items.length === 0)
      return setError("Выберите хотя бы один агрегат и укажите наработку.");

    const payload = {
      dredger_id: dredgerId,
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
    <div className="p-6 bg-[#fafbfc] min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        {isEdit ? "Редактировать ремонт" : "Новый ремонт"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow">
        <form onSubmit={handleSubmit}>
          {/* Фильтры/поля */}
          <div className="p-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Землесос</label>
              <select
                value={dredgerId}
                onChange={e => setDredgerId(Number(e.target.value) || "")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              >
                <option value="">-- землесос --</option>
                {dredgers.map(d =>
                  <option key={d.id} value={d.id}>{d.inv_number}</option>
                )}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Период с</label>
              <input
                type="date"
                value={start}
                onChange={e => setStart(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">по</label>
              <input
                type="date"
                value={end}
                onChange={e => setEnd(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
            </div>
          </div>
          <div className="border-t border-gray-200"></div>

          {/* Таблица агрегатов */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold" style={{width: '25%'}}>Агрегат</th>
                  <th className="px-4 py-3 text-left font-semibold" style={{width: '20%'}}>Производитель</th>
                  <th className="px-4 py-3 text-center font-semibold" style={{width: '12%'}}>Норма, ч</th>
                  <th className="px-4 py-3 text-center font-semibold" style={{width: '15%'}}>Текущая наработка</th>
                  <th className="px-4 py-3 text-center font-semibold" style={{width: '13%'}}>Новая наработка</th>
                  <th className="px-4 py-3 text-center font-semibold" style={{width: '15%'}}>Замена</th>
                </tr>
              </thead>
              <tbody>
                {template.map(row => (
                  <tr key={row.part_id} className="border-t border-gray-200 hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3">
                      <div className="truncate">{row.part_name}</div>
                      {row.serial_number && (
                        <div className="text-sm text-gray-500">SN: {row.serial_number}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 truncate">{row.manufacturer}</td>
                    <td className="px-4 py-3 text-center">{row.norm_hours}</td>
                    <td className="px-4 py-3 text-center">{row.current_hours}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={row.current_hours}
                        value={hours[row.part_id] ?? row.current_hours}
                        onChange={changeHours(row)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-center"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={row.part_id in replacements}
                            onChange={toggleReplacement(row)}
                            className="rounded"
                          />
                        </label>
                        {row.part_id in replacements && (
                          <select
                            value={replacements[row.part_id] || ""}
                            onChange={selectNewComponent(row)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1"
                          >
                            <option value="">Выберите новый</option>
                            {availableComponents[row.part_id]?.map(comp => (
                              <option key={comp.id} value={comp.id}>
                                SN: {comp.serial_number || "—"} ({comp.total_hours} ч)
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 pt-4 flex flex-col gap-4">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Примечание"
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
              rows={3}
            />

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-6 py-2 rounded-lg shadow transition self-end"
            >
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
