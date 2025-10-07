"use client";
import React from "react";
import Card from "@/components/ui/Card";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function LookupDrugCard() {
  const { theme } = useTheme();

  const titleColor = theme === "light" ? "text-gray-900" : "text-white";

  return (
    <Card className="flex flex-col items-center justify-between min-h-[200px] py-4">
      <Link
        href="/lookup-drug"
        className="flex-1 flex items-center justify-center w-full"
      >
        <Image
          src="/lookup.png"
          alt="Lookup Drug"
          width={160}
          height={160}
          className="object-contain cursor-pointer hover:opacity-90 transition"
        />
      </Link>

      <h3 className={`font-semibold text-lg mt-4 ${titleColor}`}>
        Lookup Drug
      </h3>
    </Card>
  );
}
