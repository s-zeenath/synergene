"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useNavbar } from "../../contexts/NavbarContext";

type ExpRow = {
  id: string;
  date: string;
  drugA: string;
  drugB: string;
  concA: number | null;
  concB: number | null;
  cellLine: string;
  metricType: "SYNERGY" | "VIABILITY" | string;
  metricValue: number | null;
  notes: string;
};

export default function ExperimentalLogsPage() {
  const { theme } = useTheme();
  const { isLoaded, isSignedIn } = useUser();
  const { setPageTitle } = useNavbar();

  const [logs, setLogs] = useState<ExpRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editing, setEditing] = useState<ExpRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) redirect("/sign-in");
    setPageTitle("experimental archive");
  }, [isLoaded, isSignedIn, setPageTitle]);

  const colors = useMemo(
    () =>
      theme === "light"
        ? {
            card: "bg-white text-gray-900",
            thead: "bg-gray-50 text-gray-700",
            border: "border-gray-200",
            btnEdit: "border text-gray-800 hover:bg-black/5",
            btnDelete: "bg-red-600 text-white hover:bg-red-700",
            btnPrimary: "bg-blue-600 text-white hover:bg-blue-700",
            modal: "bg-white text-gray-900",
          }
        : {
            card: "bg-[#1b2b4a] text-white",
            thead: "bg-[#0f1a33]",
            border: "border-[#334568]",
            btnEdit: "border border-white/30 text-white hover:bg-white/10",
            btnDelete: "bg-red-600 text-white hover:bg-red-700",
            btnPrimary: "bg-blue-600 text-white hover:bg-blue-700",
            modal: "bg-[#0f1a33] text-white",
          },
    [theme]
  );

  async function load() {
    setIsLoading(true);
    try {
      const r = await fetch("/api/experiments/all", { cache: "no-store" });
      const d = await r.json();
      setLogs(d.experiments ?? []);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSaving(true);
      const f = new FormData(e.currentTarget);
      const payload = {
        drugA: f.get("drugA"),
        drugB: f.get("drugB"),
        concA: f.get("concA"),
        concB: f.get("concB"),
        cellLine: f.get("cellLine"),
        metricType: f.get("metricType"),
        metricValue: f.get("metricValue"),
        notes: f.get("notes"),
      };
      const res = await fetch("/api/experiments/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await safeMsg(res));
      setCreating(false);
      await load();
    } catch (err: any) {
      alert(err.message || "Failed to create.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    try {
      setSaving(true);
      const f = new FormData(e.currentTarget);
      const payload = {
        id: editing.id,
        drugA: f.get("drugA"),
        drugB: f.get("drugB"),
        concA: f.get("concA"),
        concB: f.get("concB"),
        cellLine: f.get("cellLine"),
        metricType: f.get("metricType"),
        metricValue: f.get("metricValue"),
        notes: f.get("notes"),
      };
      const res = await fetch("/api/experiments/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await safeMsg(res));
      setEditing(null);
      await load();
    } catch (err: any) {
      alert(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this experiment?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/experiments/delete?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await safeMsg(res));
      await load();
    } catch (err: any) {
      alert(err.message || "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <main
        className="relative min-h-screen bg-blue-100"
        style={theme === "dark" ? { backgroundColor: "#5175b0" } : {}}
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
      style={theme === "light" ? { backgroundColor: "#5175b0" } : {}}
    >
      <div className="px-6 md:px-12 lg:px-24 pt-16 pb-10 relative z-10">
        <div
          className={`max-w-6xl mx-auto rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 p-8 transition-colors duration-300 ${colors.card}`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Experimental Logs</h1>
            <button
              onClick={() => setCreating(true)}
              className={`px-4 py-2 rounded-md ${colors.btnPrimary}`}
            >
              Add New
            </button>
          </div>

          {isLoading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-400">No experiments found.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1100px]">
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
                        "Metric",
                        "Score",
                        "Notes",
                        "Actions",
                      ].map((h, i) => (
                        <th key={i} className="px-5 py-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((log, idx) => (
                      <tr
                        key={log.id}
                        className={`${
                          idx % 2 === 0
                            ? "bg-black/[.01] dark:bg-white/[.02]"
                            : "bg-transparent"
                        } border-t ${
                          colors.border
                        } hover:bg-black/[.03] dark:hover:bg-white/[.04] transition-colors`}
                      >
                        <td className="px-5 py-3 text-center align-middle whitespace-nowrap">
                          {formatDate(log.date)}
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          {log.drugA}
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          {log.drugB}
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          <Numeric>{log.concA}</Numeric>
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          <Numeric>{log.concB}</Numeric>
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          {log.cellLine}
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          <MetricBadge type={String(log.metricType)} />
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                              theme === "dark"
                                ? "bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/30"
                                : "bg-blue-700 text-blue-50 ring-1 ring-blue-700"
                            }`}
                          >
                            <Numeric>{log.metricValue}</Numeric>
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          <NotesCell text={log.notes} centered />
                        </td>
                        <td className="px-5 py-3 text-center align-middle">
                          <div className="flex gap-2 justify-center">
                            <button
                              className={`px-3 py-1.5 rounded-md ${colors.btnEdit}`}
                              onClick={() => setEditing(log)}
                            >
                              Edit
                            </button>
                            <button
                              className={`px-3 py-1.5 rounded-md ${colors.btnDelete} disabled:opacity-60`}
                              onClick={() => handleDelete(log.id)}
                              disabled={deletingId === log.id}
                            >
                              {deletingId === log.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {creating && (
        <Modal
          onClose={() => !saving && setCreating(false)}
          className={colors.modal}
        >
          <h2 className="text-lg font-semibold mb-4">Add Experiment</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <GridTwo>
              <InputL label="Drug A" name="drugA" required />
              <InputL label="Drug B" name="drugB" required />
              <InputL
                label="Conc A (μM)"
                name="concA"
                type="number"
                step="0.1"
                required
              />
              <InputL
                label="Conc B (μM)"
                name="concB"
                type="number"
                step="0.1"
                required
              />
              <InputL label="Cell Line" name="cellLine" required />
              <label className="text-sm">
                Metric Type
                <select
                  name="metricType"
                  defaultValue="SYNERGY"
                  className="mt-1 w-full rounded-md border px-2 py-1.5 bg-transparent"
                >
                  <option value="SYNERGY">SYNERGY</option>
                  <option value="VIABILITY">VIABILITY</option>
                </select>
              </label>
              <InputL
                label="Score"
                name="metricValue"
                type="number"
                step="0.1"
                required
              />
            </GridTwo>
            <label className="text-sm block">
              Notes
              <textarea
                name="notes"
                rows={3}
                className="mt-1 w-full rounded-md border px-2 py-1.5 bg-transparent"
              />
            </label>
            <RightRow>
              <ButtonGhost onClick={() => setCreating(false)} disabled={saving}>
                Cancel
              </ButtonGhost>
              <ButtonPrimary disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </ButtonPrimary>
            </RightRow>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal
          onClose={() => !saving && setEditing(null)}
          className={colors.modal}
        >
          <h2 className="text-lg font-semibold mb-4">Edit Experimental Log</h2>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <GridTwo>
              <InputL
                label="Drug A"
                name="drugA"
                defaultValue={editing.drugA}
                required
              />
              <InputL
                label="Drug B"
                name="drugB"
                defaultValue={editing.drugB}
                required
              />
              <InputL
                label="Conc A (μM)"
                name="concA"
                type="number"
                step="0.1"
                defaultValue={editing.concA ?? undefined}
              />
              <InputL
                label="Conc B (μM)"
                name="concB"
                type="number"
                step="0.1"
                defaultValue={editing.concB ?? undefined}
              />
              <InputL
                label="Cell Line"
                name="cellLine"
                defaultValue={editing.cellLine}
                required
              />
              <label className="text-sm">
                Metric Type
                <select
                  name="metricType"
                  defaultValue={(editing.metricType as any) || "SYNERGY"}
                  className="mt-1 w-full rounded-md border px-2 py-1.5 bg-transparent"
                >
                  <option value="SYNERGY">SYNERGY</option>
                  <option value="VIABILITY">VIABILITY</option>
                </select>
              </label>
              <InputL
                label="Score"
                name="metricValue"
                type="number"
                step="0.1"
                defaultValue={editing.metricValue ?? undefined}
              />
            </GridTwo>
            <label className="text-sm block">
              Notes
              <textarea
                name="notes"
                defaultValue={editing.notes}
                rows={3}
                className="mt-1 w-full rounded-md border px-2 py-1.5 bg-transparent"
              />
            </label>
            <RightRow>
              <ButtonGhost onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </ButtonGhost>
              <ButtonPrimary disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </ButtonPrimary>
            </RightRow>
          </form>
        </Modal>
      )}
    </main>
  );
}

function GridTwo({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}
function RightRow({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 pt-2">{children}</div>;
}
function InputL(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }
) {
  const { label, ...rest } = props;
  return (
    <label className="text-sm">
      {label}
      <input
        {...rest}
        className="mt-1 w-full rounded-md border px-2 py-1.5 bg-transparent"
      />
    </label>
  );
}
function ButtonPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 ${
        props.className ?? ""
      }`}
    />
  );
}
function ButtonGhost(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-3 py-1.5 rounded-md border hover:bg-black/5 dark:border-white/30 dark:hover:bg-white/10 ${
        props.className ?? ""
      }`}
    />
  );
}
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
        className={`relative w-full max-w-2xl mx-auto rounded-2xl p-6 shadow-xl ${
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
async function safeMsg(res: Response) {
  try {
    const txt = await res.text();
    try {
      const j = JSON.parse(txt);
      return j?.error || txt;
    } catch {
      return txt;
    }
  } catch {
    return "";
  }
}
function formatDate(d: string) {
  try {
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) {
      return dt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }
    return d;
  } catch {
    return d;
  }
}
function Numeric({ children }: { children: React.ReactNode }) {
  const text =
    children === null || children === undefined || children === ""
      ? "—"
      : String(children);
  return <span className="tabular-nums tracking-normal">{text}</span>;
}

function MetricBadge({ type }: { type: string }) {
  const { theme } = useTheme();
  const t = String(type || "").toUpperCase();
  const isSyn = t === "SYNERGY";
  const cls =
    theme === "dark"
      ? isSyn
        ? "bg-green-500/20 text-green-200 ring-1 ring-green-500/30"
        : "bg-pink-500/20 text-pink-200 ring-1 ring-pink-500/30"
      : isSyn
      ? "bg-green-700 text-green-50 ring-1 ring-green-700"
      : "bg-pink-700 text-pink-50 ring-1 ring-pink-700";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${cls}`}
    >
      {t || "—"}
    </span>
  );
}

function NotesCell({ text, centered }: { text?: string; centered?: boolean }) {
  const [open, setOpen] = React.useState(false);
  if (!text) return <span className="text-gray-400">—</span>;
  return (
    <div className={`max-w-[360px] ${centered ? "mx-auto" : ""}`}>
      {open ? (
        <>
          <p className="leading-relaxed">{text}</p>
          <button
            className="mt-1 text-xs text-blue-600 hover:underline dark:text-blue-300"
            onClick={() => setOpen(false)}
          >
            Collapse
          </button>
        </>
      ) : (
        <div
          className="truncate cursor-pointer"
          title={text}
          onClick={() => setOpen(true)}
        >
          {text}
        </div>
      )}
    </div>
  );
}
