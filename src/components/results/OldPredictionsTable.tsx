"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function OldPredictionsCard() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const titleColor    = isLight ? "text-gray-900" : "text-white";
  const subtitleColor = isLight ? "text-gray-700" : "text-gray-300";

  return (
    <Card className="bg-[#184A80] text-white rounded-2xl p-6 h-full w-full flex flex-col items-center justify-center">
      <Link
        href="/results/old-predictions"
        className="flex flex-col items-center justify-center w-full h-full text-center cursor-pointer hover:scale-[1.01] transition-transform"
      >
        <div className="relative h-40 w-40 mb-8">
          <Image
            src="/prediction.png"
            alt="Old Predictions"
            fill
            className="object-contain"
            sizes="160px"
          />
        </div>

        <h3 className={`text-base md:text-lg font-semibold leading-snug ${titleColor}`}>
          View Old Predictions
        </h3>

        <p className={`mt-1 text-[13px] md:text-sm font-normal tracking-wide max-w-xs ${subtitleColor}`}>
          Browse and compare your previous SynerGene predictions
        </p>
      </Link>
    </Card>
  );
}
