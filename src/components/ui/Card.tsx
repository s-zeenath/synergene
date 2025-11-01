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
      ? "bg-[#f0edeb] border border-gray-200 text-black"
      : "bg-blue-950/95 text-white";

  return (
    <section
      className={`${bg} p-4 sm:p-6 rounded-2xl shadow w-full ${className}`}
      style={{ minHeight }}
    >
      {title && (
        <h3 className="font-semibold mb-3 text-lg sm:text-xl">{title}</h3>
      )}
      {children}
    </section>
  );
}
