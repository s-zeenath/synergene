"use client";
import React from "react";
import Card from "@/components/ui/Card";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function LogExperimentalResultCard() {
  const { theme } = useTheme();
  const titleColor = theme === "light" ? "text-gray-900" : "text-white";

  return (
    <Card className="bg-[#184A80] text-white rounded-2xl p-6 h-full w-full flex flex-col items-center justify-center">
      <Link
        href="/results/log-experimental"
        className="flex flex-col items-center justify-center w-full h-full text-center cursor-pointer hover:scale-[1.01] transition-transform"
      >
        <div className="relative w-2/3 max-w-[180px] aspect-square mb-4">
          <Image
            src="/log.png"
            alt="Log Experimental Result"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 25vw"
          />
        </div>
        <h3 className={`text-base md:text-lg font-semibold leading-snug ${titleColor}`}>
          Log experimental result
        </h3>
      </Link>
    </Card>
  );
}