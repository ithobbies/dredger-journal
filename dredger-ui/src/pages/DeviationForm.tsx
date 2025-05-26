import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

interface Dredger { id: number; inv_number: string }

const TYPE_CHOICES = [
  { value: "mechanical", label: "Механический" },
  { value: "electrical", label: "Электрический" },
  { value: "technological", label: "Технологический" },
];

const LOCATION_CHOICES = ["ПНС", "ТВС", "ШХ"];

export default function DeviationForm() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  // справочник землесосов
  const [dredgers, setDredgers] = useState<Dredger[]>([]);
  const [dredger, setDredger]   = useState<number | "">("");

  // собственные поля
  const [date, setDate]         = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [type, setType]         = useState(TYPE_CHOICES[0].value);
  const [location, setLocation] = useState(LOCATION_CHOICES[0]);
  const [lastPpr, setLastPpr]   = useState<string>("");
  const [hours, setHours]       = useState<number>(0);
  const [desc, setDesc]         = useState<string>("");

  // загрузка списка землесосов
  useEffect(() => {
    api.get("/dredgers/").then(r => setDredgers(r.data.results ?? r.data));
  }, []);

  // при редактировании загружаем данные
  useEffect(() => {
    if (id) {
      api.get(`/deviations/${id}/`).then(r => {
        const data = r.data;
        setDredger(data.dredger);
        setDate(data.date);
        setType(data.type);
        setLocation(data.location);
        setLastPpr(data.last_ppr_date || "");
        setHours(data.hours_at_deviation || 0);
        setDesc(data.description || "");
      });
    }
  }, [id]);

  /** submit */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      dredger,
      date,
      type,
      location,
      last_ppr_date: lastPpr,
      hours_at_deviation: hours,
      description: desc,
    };
    if (isEdit) {
      await api.put(`/deviations/${id}/`, payload);
    } else {
      await api.post("/deviations/", payload);
    }
    nav("/deviations");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {isEdit ? "Редактировать отклонение" : "Новое отклонение"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {/* дата и землесос */}
        <div className="flex gap-4">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border px-3 py-2 rounded w-48"
            required
          />
          <select
            value={dredger}
            onChange={e => setDredger(Number(e.target.value) || "")}
            className="border px-3 py-2 rounded flex-1"
            required
          >
            <option value="">-- землесос --</option>
            {dredgers.map(d =>
              <option key={d.id} value={d.id}>{d.inv_number}</option>
            )}
          </select>
        </div>

        {/* тип и участок */}
        <div className="flex gap-4">
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border px-3 py-2 rounded flex-1"
          >
            {TYPE_CHOICES.map(t =>
              <option key={t.value} value={t.value}>{t.label}</option>
            )}
          </select>
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="border px-3 py-2 rounded flex-1"
          >
            {LOCATION_CHOICES.map(l =>
              <option key={l} value={l}>{l}</option>
            )}
          </select>
        </div>

        {/* послед. ППР и наработка */}
        <div className="flex gap-4">
          <label className="flex flex-col flex-1">
            <span className="text-sm text-gray-600 mb-1">Дата последнего ППР</span>
            <input
              type="date"
              value={lastPpr}
              onChange={e => setLastPpr(e.target.value)}
              className="border px-3 py-2 rounded"
              required
            />
          </label>
          <label className="flex flex-col w-48">
            <span className="text-sm text-gray-600 mb-1">Пробег, ч</span>
            <input
              type="number"
              min={0}
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="border px-3 py-2 rounded"
              required
            />
          </label>
        </div>

        {/* описание */}
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Коротко опишите обстоятельства"
          className="w-full border rounded px-3 py-2"
          rows={3}
          required
        />

        <button className="btn mt-4" type="submit">
          Сохранить
        </button>
      </form>
    </div>
  );
}
