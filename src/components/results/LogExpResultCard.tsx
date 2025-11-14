// app/components/results/LogExpResultCard.tsx
"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function LogExperimentalResultCard() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const titleColor    = isLight ? "text-gray-900" : "text-white";
  const subtitleColor = isLight ? "text-gray-700" : "text-gray-300";

  return (
    <Card className="bg-[#184A80] text-white rounded-2xl p-6 h-full w-full flex flex-col items-center justify-center">
      <Link
        href="/results/log-experimental"
        className="flex flex-col items-center justify-center w-full h-full text-center cursor-pointer hover:scale-[1.01] transition-transform"
      >
        {/* IMAGE with more spacing */}
        <div className="relative h-40 w-40 mb-8">
          <Image
            src="/logg.png"
            alt="Log Experimental Result"
            fill
            className="object-contain"
            sizes="160px"
          />
        </div>

        <h3 className={`text-base md:text-lg font-semibold leading-snug ${titleColor}`}>
          Log Experimental Results
        </h3>

        <p className={`mt-1 text-[13px] md:text-sm font-normal tracking-wide max-w-xs ${subtitleColor}`}>
          Record and save your own experimental test results
        </p>
      </Link>
    </Card>
  );
}
