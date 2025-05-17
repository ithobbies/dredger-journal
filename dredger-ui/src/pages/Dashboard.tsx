// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface Down { type: string; count: number }
interface Wear { dredger: string; part: string; pct: number }

export default function Dashboard() {
  const [down, setDown] = useState<Down[]>([]);
  const [wear, setWear] = useState<Wear[]>([]);

  useEffect(() => {
    api.get("/reports/dashboard/").then(r => {
      setDown(r.data.downtime);
      setWear(r.data.wear_top);
    });
  }, []);

  const COLORS = ["#4ade80", "#fde047", "#f87171"];   // green / yellow / red

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* диаграмма простоев */}
        <div className="w-full h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie dataKey="count" data={down} cx="50%" cy="50%" outerRadius={80} label>
                {down.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center mt-2 font-medium">Простои по видам</p>
        </div>

        {/* топ-5 изношенных */}
        <div className="w-full h-80">
          <ResponsiveContainer>
            <BarChart layout="vertical" data={wear} margin={{ left: 40 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="part" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="pct" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center mt-2 font-medium">Топ-5 износа, %</p>
        </div>
      </div>
    </div>
  );
}
