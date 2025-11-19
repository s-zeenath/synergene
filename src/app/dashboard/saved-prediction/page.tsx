"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useNavbar } from "@/app/contexts/NavbarContext";

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

export default function SavedPredictionPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { isLoaded, isSignedIn } = useUser();
  const { setPageTitle } = useNavbar();

  const [rows, setRows] = useState<PredRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PredRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) redirect("/sign-in");
    setPageTitle("saved predictions");
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
            btnEdit: "border text-gray-800 hover:bg-black/5",
            btnDelete: "bg-red-600 text-white hover:bg-red-700",
            btnPrimary: "bg-blue-600 text-white hover:bg-blue-700",
            modal: "bg-white text-gray-900",
          }
        : {
            pageBg: {},
            card: "bg-[#1b2b4a] text-white",
            thead: "bg-[#0f1a33]",
            border: "border-[#334568]",
            ring: "ring-1 ring-white/10",
            btnEdit: "border border-white/30 text-white hover:bg-white/10",
            btnDelete: "bg-red-600 text-white hover:bg-red-700",
            btnPrimary: "bg-blue-600 text-white hover:bg-blue-700",
            modal: "bg-[#0f1a33] text-white",
          },
    [isLight]
  );

  const loadPredictions = async () => {
    try {
      const r = await fetch("/api/predictions/saved", { cache: "no-store" });
      const d = await r.json();
      setRows(d.predictions ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;

    try {
      setSaving(true);
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;

      const res = await fetch("/api/predictions/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, name }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update");
      }

      setEditing(null);
      await loadPredictions();
    } catch (err: any) {
      alert(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this prediction?")) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/predictions/delete?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete");
      }

      await loadPredictions();
    } catch (err: any) {
      alert(err.message || "Failed to delete prediction");
    } finally {
      setDeletingId(null);
    }
  }

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
            Saved Predictions
          </h1>

          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-400">
              No saved predictions found.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1150px]">
                  <thead
                    className={`${colors.thead} sticky top-0 z-10 text-xs uppercase tracking-wide`}
                  >
                    <tr className="text-center">
                      {[
                        "Date",
                        "Name",
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
                        "Actions",
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
                            <span className="font-medium">{p.name ?? "—"}</span>
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
                          <td className="px-5 py-3 text-center align-middle">
                            <div className="flex gap-2 justify-center">
                              <button
                                className={`px-3 py-1.5 rounded-md text-xs ${colors.btnEdit}`}
                                onClick={() => setEditing(p)}
                              >
                                Edit
                              </button>
                              <button
                                className={`px-3 py-1.5 rounded-md text-xs ${colors.btnDelete} disabled:opacity-60`}
                                onClick={() => handleDelete(p.id)}
                                disabled={deletingId === p.id}
                              >
                                {deletingId === p.id ? "Deleting…" : "Delete"}
                              </button>
                            </div>
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

      {/* Edit Modal */}
      {editing && (
        <Modal
          onClose={() => !saving && setEditing(null)}
          className={colors.modal}
        >
          <h2 className="text-lg font-semibold mb-4">Edit Prediction Name</h2>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="text-sm block mb-2">
                Prediction Name
                <input
                  name="name"
                  defaultValue={editing.name || ""}
                  placeholder="Enter prediction name"
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-transparent"
                  required
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                className="px-3 py-1.5 rounded-md border hover:bg-black/5 dark:border-white/30 dark:hover:bg-white/10 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-1.5 rounded-md ${colors.btnPrimary} disabled:opacity-60`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}

// Helper Components
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

// Modal Component (same as experimental logs)
function Modal({
  children,
  onClose,
  className,
}: {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative w-full max-w-md mx-auto rounded-2xl p-6 shadow-xl ${
          className ?? ""
        }`}
      >
        <div className="absolute top-3 right-3">
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-md border hover:bg-black/5 dark:border-white/30 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
