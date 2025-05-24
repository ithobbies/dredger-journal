import { createPortal } from "react-dom";
import { ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  message: string | ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="mb-6 text-sm text-gray-700">{message}</div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="btn bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Отмена
          </button>
          <button onClick={onConfirm} className="btn">
            Подтвердить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
