// src/pages/SparePartForm.tsx
import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function SparePartForm() {
  const nav = useNavigate();
  const { id } = useParams();                 // если есть → режим edit
  const fileRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [man, setMan]   = useState("");
  const [norm, setNorm] = useState(0);
  const [drawingUrl, setDrawingUrl] = useState<string | null>(null);

  // загрузка существующей
  useEffect(() => {
    if (id)
      api.get(`/refdata/spare-parts/${id}/`).then((r) => {
        const d = r.data;
        setCode(d.code);
        setName(d.name);
        setMan(d.manufacturer);
        setNorm(d.norm_hours);
        setDrawingUrl(d.drawing_file);
      });
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("code", code);
    fd.append("name", name);
    fd.append("manufacturer", man);
    fd.append("norm_hours", String(norm));
    if (fileRef.current?.files?.[0]) fd.append("drawing_file", fileRef.current.files[0]);

    if (id) await api.put(`/refdata/spare-parts/${id}/`, fd);
    else await api.post("/refdata/spare-parts/", fd);

    nav("/spare-parts");
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">
        {id ? "Редактировать запчасть" : "Новая запчасть"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input"
          placeholder="Код"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Производитель"
          value={man}
          onChange={(e) => setMan(e.target.value)}
        />
        <input
          type="number"
          min={0}
          className="input"
          placeholder="Норматив, ч"
          value={norm}
          onChange={(e) => setNorm(Number(e.target.value))}
          required
        />

        <label className="block">
          <span className="text-sm text-gray-600">Чертёж (PDF)</span>
          <input type="file" accept="application/pdf" ref={fileRef} className="mt-1" />
        </label>
        {drawingUrl && (
          <p className="text-sm">
            Текущий файл:{" "}
            <a
              href={`http://localhost:8000${drawingUrl}`}
              target="_blank"
              className="text-blue-600 underline"
            >
              открыть
            </a>
          </p>
        )}

        <button className="btn">Сохранить</button>
      </form>
    </div>
  );
}
