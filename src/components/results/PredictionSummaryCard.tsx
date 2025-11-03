"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function PredictionSummaryCard({ className = "" }: { className?: string }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <Card
      className={`bg-[#184A80] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow ${className}`}
    >
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="text-[64px] font-extrabold leading-none text-[#2B9FFF]">
          87%
        </div>

        <div className="mt-2 text-2xl font-bold italic text-[#A0A0A0]">
          Synergistic!
        </div>

        <p
          className={`mt-2 text-sm font-medium ${
            isLight ? "text-black" : "text-white"
          }`}
        >
          At a confidence level of{" "}
          <span className="font-semibold text-[#2B9FFF]">65%</span>
        </p>

        <Link
          href="/prediction-summary"
          className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#2B9FFF] hover:bg-[#1E8EEA] font-semibold text-white transition"
        >
          Download
        </Link>
      </div>
    </Card>
  );
}
