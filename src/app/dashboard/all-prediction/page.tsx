"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useNavbar } from "@/app/contexts/NavbarContext";

type PredRow = {
  id: string;
  drugs: string;
  cellLine: string;
  concentrationA?: number;
  concentrationB?: number;
  score: number;
  confidence: number;
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
  date: string;
};

export default function AllPredictionPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { isLoaded, isSignedIn } = useUser();
  const { setPageTitle } = useNavbar();

  const [rows, setRows] = useState<PredRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) redirect("/sign-in");
    setPageTitle("all predictions");
  }, [isLoaded, isSignedIn, setPageTitle]);

  const colors = useMemo(
    () =>
      isLight
        ? {
            pageBg: { backgroundColor: "#5175b0" },
            card: "bg-white text-gray-900",
            thead: "bg-gray-50 text-gray-700",
            border: "border-gray-200",
            ring: "ring-1 ring-black/5",
          }
        : {
            pageBg: {},
            card: "bg-[#1b2b4a] text-white",
            thead: "bg-[#0f1a33]",
            border: "border-[#334568]",
            ring: "ring-1 ring-white/10",
          },
    [isLight]
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

  if (!isLoaded || !isSignedIn) {
    return (
      <main
        className="relative min-h-screen bg-blue-100"
        style={!isLight ? {} : {}}
      >
        <div className="px-6 md:px-12 lg:px-24 py-6 relative z-10">
          <div className="flex justify-center items-center h-64 text-lg">
            Loading...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen w-full bg-blue-100"
      style={colors.pageBg}
    >
      <div className="px-6 md:px-12 lg:px-24 pt-16 pb-10 relative z-10">
        <div
          className={`max-w-6xl mx-auto rounded-2xl shadow-xl ${colors.ring} p-8 transition-colors duration-300 ${colors.card}`}
        >
          <h1 className="text-3xl font-semibold mb-6 text-center">
            All Predictions (Last 30 Days)
          </h1>

          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-400">
              No predictions found from the last 30 days.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1050px]">
                  <thead
                    className={`${colors.thead} sticky top-0 z-10 text-xs uppercase tracking-wide`}
                  >
                    <tr className="text-center">
                      {[
                        "Date",
                        "Drug A",
                        "Drug B",
                        <span key="concA">
                          Conc A (<span className="normal-case">µM</span>)
                        </span>,
                        <span key="concB">
                          Conc B (<span className="normal-case">µM</span>)
                        </span>,
                        "Cell Line",
                        "Score",
                        "Confidence",
                      ].map((h, i) => (
                        <th key={i} className="px-5 py-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((p: PredRow, idx: number) => {
                      const [drugA, drugB] = (p.drugs || "").split(" + ");
                      const confPct =
                        p.confidence <= 1
                          ? Math.round(p.confidence * 100)
                          : Math.round(p.confidence);
                      const score =
                        typeof p.score === "number"
                          ? Number(p.score.toFixed(1))
                          : (p.score as any);
                      const scoreCls =
                        score >= 80
                          ? "text-green-500"
                          : score >= 60
                          ? "text-blue-500"
                          : score >= 0
                          ? isLight
                            ? "text-gray-900"
                            : "text-white"
                          : "text-red-400";

                      return (
                        <tr
                          key={p.id}
                          className={`${
                            idx % 2 === 0
                              ? "bg-black/[.01] dark:bg-white/[.02]"
                              : "bg-transparent"
                          } border-t ${
                            colors.border
                          } hover:bg-black/[.03] dark:hover:bg-white/[.04] transition-colors`}
                        >
                          <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                            {p.date}
                          </td>
                          <td className="px-5 py-3 text-center align-middle">
                            {drugA ?? "—"}
                          </td>
                          <td className="px-5 py-3 text-center align-middle">
                            {drugB ?? "—"}
                          </td>
                          <td className="px-5 py-3 text-center align-middle">
                            <Numeric>{p.concentrationA}</Numeric>
                          </td>
                          <td className="px-5 py-3 text-center align-middle">
                            <Numeric>{p.concentrationB}</Numeric>
                          </td>
                          <td className="px-5 py-3 text-center align-middle">
                            {p.cellLine}
                          </td>
                          <td className="px-5 py-3 text-center align-middle">
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${scoreCls}`}
                            >
                              {score}%
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center align-middle">
                            <ConfidenceBadge
                              level={p.confidenceLevel}
                              value={confPct}
                            />
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
      </div>
    </main>
  );
}

function Numeric({ children }: { children: any }) {
  const text =
    children === null || children === undefined || children === ""
      ? "—"
      : String(children);
  return <span className="tabular-nums">{text}</span>;
}

function ConfidenceBadge({
  level,
  value,
}: {
  level: "LOW" | "MEDIUM" | "HIGH";
  value: number;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const base =
    "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm min-w-[100px] text-center text-white";
  let tone = "";

  switch (level) {
    case "HIGH":
      tone = "bg-emerald-500 shadow-emerald-500/40";
      break;
    case "MEDIUM":
      tone = "bg-[#2B9FFF] shadow-[#2B9FFF]/40";
      break;
    case "LOW":
      tone = "bg-rose-500 shadow-rose-500/40";
      break;
    default:
      tone = "bg-gray-500 shadow-gray-500/40";
  }

  return (
    <span className={`${base} ${tone}`}>
      {level} <span className="ml-1 font-bold">{pct}%</span>
    </span>
  );
}
