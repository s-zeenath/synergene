"use client";
import { useTheme } from "@/components/ui/ThemeToggle";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function Button({
  children,
  href,
  onClick,
  variant = "secondary",
  className = "",
}: ButtonProps) {
  const { theme } = useTheme();

  const base = "px-5 py-2.5 rounded-lg text-base font-medium transition";

  const variants = {
    primary:
      theme === "light"
        ? "bg-blue-500 text-white hover:bg-blue-600"
        : "bg-blue-500 text-white hover:bg-blue-400",
    secondary:
      theme === "light"
        ? "bg-gray-200 text-black hover:bg-gray-300"
        : "bg-slate-600 text-white hover:bg-slate-500",
  };

  const final = `${base} ${variants[variant]} ${className}`;

  if (href)
    return (
      <Link href={href} className={final}>
        {children}
      </Link>
    );

  return (
    <button onClick={onClick} className={final}>
      {children}
    </button>
  );
}
