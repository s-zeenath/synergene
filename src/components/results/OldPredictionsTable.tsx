"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";

type PredRow = {
  id: string;
  name?: string | null;
  drugs: string;
  cellLine: string;
  concentrationA?: number;
  concentrationB?: number; 
  score: number;
  confidence: number;
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
  date: string;
};

export default function OldPredictionsTable() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<PredRow[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = useMemo(
    () =>
      theme === "light"
        ? {
            card: "bg-white text-gray-900",
            thead: "bg-gray-50 text-gray-700",
            border: "border-gray-200",
            ring: "ring-1 ring-black/5",
          }
        : {
            card: "bg-[#1b2b4a] text-white",
            thead: "bg-[#0f1a33]",
            border: "border-[#334568]",
            ring: "ring-1 ring-white/10",
          },
    [theme]
  );

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/predictions/all", { cache: "no-store" });
        const d = await r.json();
        setRows(d.predictions ?? []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div
      className={`max-w-6xl mx-auto rounded-2xl shadow-xl ${colors.ring} p-8 transition-colors duration-300 ${colors.card}`}
    >
      <h1 className="text-3xl font-semibold mb-6 text-center">Old Predictions</h1>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-center text-gray-400">No predictions found from the last 30 days.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1050px]">
              <thead className={`${colors.thead} sticky top-0 z-10 text-xs uppercase tracking-wide`}>
                <tr className="text-center">
                  {[
                    "Date",
                    "Name",
                    "Drug A",
                    "Drug B",
                    "Conc A (μM)",
                    "Conc B (μM)",
                    "Cell Line",
                    "Score",
                    "Confidence",
                  ].map((h) => (
                    <th key={h} className="px-5 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((p: PredRow, idx: number) => {
                  const [drugA, drugB] = (p.drugs || "").split(" + ");
                  const confPct = p.confidence <= 1 ? Math.round(p.confidence * 100) : Math.round(p.confidence);
                  const score = typeof p.score === "number" ? Number(p.score.toFixed(1)) : p.score;
                  const scoreCls =
                    score >= 80
                      ? "text-green-500"
                      : score >= 60
                      ? "text-blue-500"
                      : score >= 0
                      ? "text-white/90"
                      : "text-red-400";

                  return (
                    <tr
                      key={p.id}
                      className={`${
                        idx % 2 === 0 ? "bg-black/[.01] dark:bg-white/[.02]" : "bg-transparent"
                      } border-t ${colors.border} hover:bg-black/[.03] dark:hover:bg-white/[.04] transition-colors`}
                    >
                      <td className="px-5 py-3 text-center align-middle whitespace-nowrap">{p.date}</td>
                      <td className="px-5 py-3 text-center align-middle">
                        <span className="font-medium">{p.name ?? "—"}</span>
                      </td>
                      <td className="px-5 py-3 text-center align-middle">{drugA ?? "—"}</td>
                      <td className="px-5 py-3 text-center align-middle">{drugB ?? "—"}</td>
                      <td className="px-5 py-3 text-center align-middle">
                        <Numeric>{p.concentrationA}</Numeric>
                      </td>
                      <td className="px-5 py-3 text-center align-middle">
                        <Numeric>{p.concentrationB}</Numeric>
                      </td>
                      <td className="px-5 py-3 text-center align-middle">{p.cellLine}</td>
                      <td className="px-5 py-3 text-center align-middle">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${scoreCls}`}
                        >
                          {score}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center align-middle">
                        <ConfidenceBadge level={p.confidenceLevel} value={confPct} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Numeric({ children }: { children: any }) {
  const text =
    children === null || children === undefined || children === "" ? "—" : String(children);
  return <span className="tabular-nums">{text}</span>;
}

function ConfidenceBadge({ level, value }: { level: "LOW" | "MEDIUM" | "HIGH"; value: number }) {
  const base =
    "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm";
  const tone =
    level === "HIGH"
      ? "bg-emerald-700 text-emerald-50 ring-1 ring-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-500/30"
      : level === "MEDIUM"
      ? "bg-[#2B9FFF] text-white ring-1 ring-[#2B9FFF] dark:bg-[#2B9FFF]/20 dark:text-[#9fd6ff] dark:ring-[#2B9FFF]/30"
      : "bg-pink-700 text-pink-50 ring-1 ring-pink-700 dark:bg-pink-500/20 dark:text-pink-200 dark:ring-pink-500/30";
  return (
    <span className={`${base} ${tone}`}>
      {level} · {Math.max(0, Math.min(100, value))}%
    </span>
  );
}