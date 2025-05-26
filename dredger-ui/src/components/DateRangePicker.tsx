import type { ChangeEvent } from "react";

interface Props {
  from: string;
  to: string;
  onChange: (field: "from" | "to", value: string) => void;
}

export default function DateRangePicker({ from, to, onChange }: Props) {
  const handle = (field: "from" | "to") => (e: ChangeEvent<HTMLInputElement>) =>
    onChange(field, e.target.value);

  return (
    <div className="flex items-center gap-2">
      <input type="date" value={from} onChange={handle("from")} className="border px-2 py-1 rounded" />
      <span>–</span>
      <input type="date" value={to} onChange={handle("to")} className="border px-2 py-1 rounded" />
    </div>
  );
}
