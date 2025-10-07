import React from "react";
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
  const baseStyles =
    "px-5 py-2.5 rounded-lg text-base font-medium transition focus:outline-none";

  const variants = {
    primary:
      "bg-blue-400 text-white hover:bg-blue-500 focus:ring-2 focus:ring-blue-300", // changed to match 75%
    secondary:
      "bg-gray-200 text-black hover:bg-gray-300 focus:ring-2 focus:ring-gray-400",
  };

  const finalClass = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={finalClass}>
        {children}
      </Link>
    );
  }

  return (
    <button className={finalClass} onClick={onClick}>
      {children}
    </button>
  );
}
