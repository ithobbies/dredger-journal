// src/pages/DeviationForm.tsx
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Dredger { id: number; inv_number: string }

const TYPE_CHOICES = [
  { value: "mechanical",    label: "Механический"  },
  { value: "electrical",    label: "Электрический" },
  { value: "technological", label: "Технологический" },
];

const LOCATION_CHOICES = ["ПНС", "ТВС", "ШХ"];

export default function DeviationForm() {
  const nav = useNavigate();

  // справочник землесосов
  const [dredgers, setDredgers] = useState<Dredger[]>([]);
  const [dredger, setDredger]   = useState<number | "">("");

  // собственные поля
  const [date, setDate]             = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType]             = useState(TYPE_CHOICES[0].value);
  const [location, setLocation]     = useState(LOCATION_CHOICES[0]);
  const [lastPpr, setLastPpr]       = useState("");
  const [hours, setHours]           = useState(0);
  const [desc, setDesc]             = useState("");
  const [shift, setShift]           = useState("");
  const [mech, setMech]             = useState("");
  const [elec, setElec]             = useState("");

  useEffect(() => {
    api.get("/dredgers/").then(r => setDredgers(r.data.results ?? r.data));
  }, []);

  /** submit */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api.post("/deviations/", {
      dredger,
      date,
      type,
      location,
      last_ppr_date: lastPpr,
      hours_at_deviation: hours,
      description: desc,
      shift_leader: shift,
      mechanic: mech,
      electrician: elec,
    });
    nav("/deviations");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Новое отклонение</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {/* дата и землесос */}
        <div className="flex gap-4">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
                 className="border px-3 py-2 rounded w-48" required />
          <select value={dredger} onChange={e => setDredger(Number(e.target.value)||"")}
                  className="border px-3 py-2 rounded flex-1" required>
            <option value="">-- землесос --</option>
            {dredgers.map(d => <option key={d.id} value={d.id}>{d.inv_number}</option>)}
          </select>
        </div>

        {/* тип и участок */}
        <div className="flex gap-4">
          <select value={type} onChange={e => setType(e.target.value)}
                  className="border px-3 py-2 rounded flex-1">
            {TYPE_CHOICES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={location} onChange={e => setLocation(e.target.value)}
                  className="border px-3 py-2 rounded flex-1">
            {LOCATION_CHOICES.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* послед. ППР и наработка */}
        <div className="flex gap-4">
          <label className="flex flex-col flex-1">
            <span className="text-sm text-gray-600 mb-1">Дата последнего ППР</span>
            <input type="date" value={lastPpr} onChange={e => setLastPpr(e.target.value)}
                   className="border px-3 py-2 rounded" required />
          </label>
          <label className="flex flex-col w-48">
            <span className="text-sm text-gray-600 mb-1">Наработка, ч</span>
            <input type="number" min={0} value={hours}
                   onChange={e => setHours(Number(e.target.value))}
                   className="border px-3 py-2 rounded" required />
          </label>
        </div>

        {/* описание */}
        <textarea value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="Коротко опишите обстоятельства"
                  className="w-full border rounded px-3 py-2" rows={3} required />

        {/* ФИО */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="border px-3 py-2 rounded" placeholder="Нач. смены"
                 value={shift} onChange={e => setShift(e.target.value)} required />
          <input className="border px-3 py-2 rounded" placeholder="Механик"
                 value={mech} onChange={e => setMech(e.target.value)} required />
          <input className="border px-3 py-2 rounded" placeholder="Электрик"
                 value={elec} onChange={e => setElec(e.target.value)} required />
        </div>

        <button className="btn mt-4">Сохранить</button>
      </form>
    </div>
  );
}
