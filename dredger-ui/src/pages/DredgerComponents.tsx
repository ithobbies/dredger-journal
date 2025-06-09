import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import HistoryModal from "../components/HistoryModal";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

/* ─────────── типы ─────────── */
interface Row {
  id: number;
  part: {
    id: number;
    name: string;
    norm_hours: number;
  };
  total_hours: number;
  serial_number: string | null;
}

interface AvailableComponent {
  id: number;
  part_id: number;
  serial_number: string;
  total_hours: number;
  norm_hours: number;
}

/* ─────────── компонент ─────────── */
export default function DredgerComponents() {
  const { id } = useParams();                 // ID землесоса из URL
  const [rows, setRows] = useState<Row[]>([]);
  const [invNum, setInvNum] = useState("");
  const [historyFor, setHistoryFor] = useState<number | null>(null);  // ID компонента для модалки
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [availableComponents, setAvailableComponents] = useState<AvailableComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string>("");
  const [error, setError] = useState<string>("");

  /* загрузка списка компонентов и самого землесоса */
  useEffect(() => {
    if (!id) return;

    api.get(`/dredgers/${id}/components/`).then(r => setRows(r.data));
    api.get(`/dredgers/${id}/`).then(r => setInvNum(r.data.inv_number));
  }, [id]);

  /* загрузка доступных компонентов при открытии диалога */
  useEffect(() => {
    if (!showAddDialog || !id) return;

    // Получаем список ID частей, которые могут быть установлены на этот землесос
    api.get(`/dredgers/${id}/template/`).then(r => {
      const partIds = r.data.map((item: any) => item.part_id).join(',');
      if (partIds) {
        api.get(`/available-components/?part_ids=${partIds}`).then(r => {
          setAvailableComponents(r.data);
        });
      }
    });
  }, [showAddDialog, id]);

  const handleAddComponent = async () => {
    if (!selectedComponent) {
      setError("Выберите компонент для установки");
      return;
    }

    try {
      await api.post(`/dredgers/${id}/add_component/`, {
        component_id: selectedComponent
      });
      
      // Обновляем список компонентов
      const response = await api.get(`/dredgers/${id}/components/`);
      setRows(response.data);
      
      // Закрываем диалог и очищаем состояние
      setShowAddDialog(false);
      setSelectedComponent("");
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка при добавлении компонента");
    }
  };

  const handleRemoveComponent = async (componentId: number) => {
    if (!confirm("Вы уверены, что хотите снять этот агрегат?")) return;

    try {
      await api.post(`/dredgers/${id}/remove_component/`, {
        component_id: componentId
      });
      
      // Обновляем список компонентов
      const response = await api.get(`/dredgers/${id}/components/`);
      setRows(response.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Ошибка при снятии компонента");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">
          Компоненты землесоса {invNum}
        </h1>
        <Button onClick={() => setShowAddDialog(true)}>
          Добавить агрегат
        </Button>
      </div>

      <table className="w-full border shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Агрегат</th>
            <th className="border px-2 py-1 w-1/3">Ресурс</th>
            <th className="border px-2 py-1 text-center">Часы / норматив</th>
            <th className="border px-2 py-1">Сер. № / История</th>
            <th className="border px-2 py-1">Действия</th>
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

                {/* действия */}
                <td className="px-2 py-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveComponent(c.id)}
                  >
                    Снять
                  </Button>
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

      {/* диалог добавления компонента */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить агрегат</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Выберите агрегат
              </label>
              <Select
                value={selectedComponent}
                onValueChange={setSelectedComponent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите агрегат" />
                </SelectTrigger>
                <SelectContent>
                  {availableComponents.map(comp => (
                    <SelectItem key={comp.id} value={comp.id.toString()}>
                      {comp.serial_number} (наработка: {comp.total_hours} ч)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedComponent("");
                  setError("");
                }}
              >
                Отмена
              </Button>
              <Button onClick={handleAddComponent}>
                Добавить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
