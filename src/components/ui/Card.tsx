import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  minHeight?: string;
  className?: string;
  bgColor?: string;
}

export default function Card({
  title,
  children,
  minHeight = "300px",
  className = "",
  bgColor = "bg-blue-950/95",
}: CardProps) {
  return (
    <section
      className={`${bgColor} text-white p-4 sm:p-6 rounded-2xl shadow w-full ${className}`}
      style={{ minHeight }}
    >
      {title && (
        <h3 className="font-semibold mb-3 text-lg sm:text-xl">{title}</h3>
      )}
      {children}
    </section>
  );
}
