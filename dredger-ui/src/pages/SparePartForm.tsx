// src/pages/SparePartForm.tsx
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function SparePartForm() {
  const nav = useNavigate();
  const { id } = useParams();                 // если есть → режим edit
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [man, setMan]   = useState("");
  const [norm, setNorm] = useState(0);
  const [drawingUrl, setDrawingUrl] = useState<string | null>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Получаем только цифры из ввода
    const digits = e.target.value.replace(/\D/g, '');
    
    // Форматируем ввод
    let formatted = '';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += '.' + digits.slice(2, 4);
    if (digits.length > 4) formatted += '.' + digits.slice(4, 10);
    if (digits.length > 10) formatted += '.' + digits.slice(10, 15);
    
    setCode(formatted);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      if (fileRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileRef.current.files = dataTransfer.files;
      }
    }
  };

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
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        {id ? "Редактировать запчасть" : "Новая запчасть"}
      </h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Код<span className="text-red-500">*</span></label>
          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            className="input border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="XX.XX.XXXXXX.XXXXX"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Наименование<span className="text-red-500">*</span></label>
          <input
            className="input border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите наименование"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Производитель<span className="text-red-500">*</span></label>
          <input
            className="input border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Производитель"
            value={man}
            onChange={(e) => setMan(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Норматив, ч<span className="text-red-500">*</span></label>
          <input
            type="number"
            min={0}
            className="input border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Число часов"
            value={norm}
            onChange={(e) => setNorm(Number(e.target.value))}
            required
          />
        </div>
        <div className="md:col-span-2 flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Чертёж (PDF)</label>
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition cursor-pointer mb-2 ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ minHeight: 120 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3.5 3.5M12 8l3.5 3.5" />
            </svg>
            <span className="text-gray-500">
              {isDragging 
                ? 'Отпустите файл для загрузки' 
                : 'Перетащите PDF или нажмите для выбора'}
            </span>
            <input
              type="file"
              accept="application/pdf"
              ref={fileRef}
              className="hidden"
            />
          </div>
          {drawingUrl && (
            <p className="text-sm">
              Текущий файл: {" "}
              <a
                href={`http://localhost:8000${drawingUrl}`}
                target="_blank"
                className="text-blue-600 underline"
              >
                открыть
              </a>
            </p>
          )}
        </div>
        <div className="md:col-span-2 flex justify-center mt-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg shadow transition"
            type="submit"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}
