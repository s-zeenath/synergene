"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useNavbar } from "../../contexts/NavbarContext";

export default function LogExperimentalPage() {
  const { theme } = useTheme();
  const { isLoaded, isSignedIn } = useUser();
  const { setPageTitle } = useNavbar();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) redirect("/sign-in");
    setPageTitle("Log Experimental");
  }, [isLoaded, isSignedIn, setPageTitle]);

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
          className={`max-w-4xl mx-auto rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
            theme === "light" ? "bg-white text-gray-900" : "bg-[#1b2b4a] text-white"
          }`}
        >
          <h1 className="text-center text-3xl font-semibold mb-8">
            Log Experimental Result
          </h1>

          {msg && (
            <div className="mb-4 rounded-md bg-red-100 text-red-800 px-4 py-2 text-sm">
              {msg}
            </div>
          )}

          <form
            ref={formRef}
            className="grid gap-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg(null);
              setSaving(true);

              const form = formRef.current!;
              const fd = new FormData(form);

              const payload = {
                drugA: fd.get("drugA"),
                drugB: fd.get("drugB"),
                concA: fd.get("concA"),
                concB: fd.get("concB"),
                cellLine: fd.get("cellLine"),
                metricType: fd.get("metricType"),
                metricValue: fd.get("metricValue"),
                notes: fd.get("notes"),
              };

              try {
                const res = await fetch("/api/experiments/log", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok || !data?.success) throw new Error(data?.error || res.statusText);
                form.reset();
                router.replace("/results/experimental-logs");
              } catch (err: any) {
                setMsg(err?.message || "Failed to save");
              } finally {
                setSaving(false);
              }
            }}
          >
            {[
              { label: "Drug A", name: "drugA", required: true },
              { label: "Drug B", name: "drugB", required: true },
            ].map((f) => (
              <div key={f.name}>
                <label className="block mb-2 text-sm font-medium">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  name={f.name}
                  required={f.required}
                  placeholder={`Enter ${f.label}`}
                  className={`w-full rounded-xl px-4 py-3 border transition-colors duration-300 ${
                    theme === "light"
                      ? "bg-white border-gray-300 text-gray-900"
                      : "bg-[#0f1a33] border-[#334568] text-white"
                  }`}
                />
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {["concA", "concB"].map((n, i) => (
                <div key={n}>
                  <label className="block mb-2 text-sm font-medium">
                    {`Concentration ${i === 0 ? "A" : "B"} (μM)`}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    name={n}
                    required
                    placeholder={`Enter concentration ${i === 0 ? "A" : "B"}`}
                    className={`w-full rounded-xl px-4 py-3 border transition-colors duration-300 ${
                      theme === "light"
                        ? "bg-white border-gray-300 text-gray-900"
                        : "bg-[#0f1a33] border-[#334568] text-white"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Cell Line <span className="text-red-500">*</span>
              </label>
              <input
                name="cellLine"
                required
                placeholder="Enter cell line"
                className={`w-full rounded-xl px-4 py-3 border transition-colors duration-300 ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-[#0f1a33] border-[#334568] text-white"
                }`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Metric Type <span className="text-red-500">*</span>
              </label>
              <select
                name="metricType"
                defaultValue="SYNERGY"
                className={`w-full rounded-xl px-4 py-3 border transition-colors duration-300 ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-[#0f1a33] border-[#334568] text-white"
                }`}
              >
                <option value="SYNERGY">Synergy</option>
                <option value="VIABILITY">Viability</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Metric Value <span className="text-red-500">*</span>
              </label>
              <input
                name="metricValue"
                required
                placeholder="Enter metric value"
                className={`w-full rounded-xl px-4 py-3 border transition-colors duration-300 ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-[#0f1a33] border-[#334568] text-white"
                }`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Notes (optional)</label>
              <textarea
                name="notes"
                placeholder="Enter notes"
                className={`w-full rounded-xl px-4 py-3 border min-h-[100px] transition-colors duration-300 ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-[#0f1a33] border-[#334568] text-white"
                }`}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-[#2B9FFF] hover:bg-[#1E8EEA] text-white font-semibold py-3 transition disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/results/experimental-logs")}
                className={`flex-1 rounded-xl font-semibold py-3 transition-colors ${
                  theme === "light"
                    ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                    : "bg-[#0f1a33] hover:bg-[#334568] text-white"
                }`}
              >
                View Experimental Logs
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}