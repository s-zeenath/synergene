"use client";
import { useEffectiveTheme } from "@/app/contexts/InvertedTabContext";
import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  minHeight?: string;
  className?: string;
}

export default function Card({
  title,
  children,
  minHeight = "300px",
  className = "",
}: CardProps) {
  const effectiveTheme = useEffectiveTheme();

  const bg =
    effectiveTheme === "light"
      ? "bg-[#f0edeb] border border-gray-200"
      : "bg-blue-950/95";

  const textColor = effectiveTheme === "light" ? "text-gray-900" : "text-white";
  const highlightColor =
    effectiveTheme === "light" ? "text-blue-600" : "text-blue-400";
  const secondaryBg =
    effectiveTheme === "light" ? "bg-gray-100" : "bg-white/10";

  return (
    <section
      className={`${bg} ${textColor} p-4 sm:p-6 rounded-2xl shadow w-full ${className}`}
      style={{ minHeight }}
      data-theme={effectiveTheme}
    >
      {title && (
        <h3 className="font-semibold mb-3 text-lg sm:text-xl">{title}</h3>
      )}
      {children}
    </section>
  );
}

export const useCardTheme = () => {
  const effectiveTheme = useEffectiveTheme();

  return {
    theme: effectiveTheme,
    textColor: effectiveTheme === "light" ? "text-gray-900" : "text-white",
    highlightColor:
      effectiveTheme === "light" ? "text-blue-600" : "text-blue-400",
    secondaryBg: effectiveTheme === "light" ? "bg-gray-100" : "bg-white/10",
    chartColors:
      effectiveTheme === "light"
        ? ["#3b82f6", "#1e40af"]
        : ["#60a5fa", "#1e3a8a"],
    chartStrokeColor: effectiveTheme === "light" ? "#1e40af" : "#1e3a8a",
    tableHeaderBg:
      effectiveTheme === "light" ? "bg-gray-100" : "bg-slate-700/30",
    tableRowBorder:
      effectiveTheme === "light" ? "border-gray-300/40" : "border-slate-700/40",
    emptyText: effectiveTheme === "light" ? "text-gray-500" : "text-white/70",
  };
};
