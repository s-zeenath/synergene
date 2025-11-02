"use client";
import { useTheme } from "@/components/ui/ThemeToggle";
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
  const { theme } = useTheme();

  const bg =
    theme === "light"
      ? "bg-[#f0edeb] border border-gray-200"
      : "bg-blue-950/95";

  const textColor = theme === "light" ? "text-gray-900" : "text-white";
  const highlightColor = theme === "light" ? "text-blue-600" : "text-blue-400";
  const secondaryBg = theme === "light" ? "bg-gray-100" : "bg-white/10";

  return (
    <section
      className={`${bg} ${textColor} p-4 sm:p-6 rounded-2xl shadow w-full ${className}`}
      style={{ minHeight }}
      data-theme={theme}
    >
      {title && (
        <h3 className="font-semibold mb-3 text-lg sm:text-xl">{title}</h3>
      )}
      {children}
    </section>
  );
}

// Export theme utilities for more complex components
export const useCardTheme = () => {
  const { theme } = useTheme();

  return {
    theme,
    textColor: theme === "light" ? "text-gray-900" : "text-white",
    highlightColor: theme === "light" ? "text-blue-600" : "text-blue-400",
    secondaryBg: theme === "light" ? "bg-gray-100" : "bg-white/10",
    chartColors:
      theme === "light" ? ["#3b82f6", "#1e40af"] : ["#60a5fa", "#1e3a8a"],
    chartStrokeColor: theme === "light" ? "#1e40af" : "#1e3a8a",
    tableHeaderBg: theme === "light" ? "bg-gray-100" : "bg-slate-700/30",
    tableRowBorder:
      theme === "light" ? "border-gray-300/40" : "border-slate-700/40",
    emptyText: theme === "light" ? "text-gray-500" : "text-white/70",
  };
};
