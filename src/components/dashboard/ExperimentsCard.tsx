"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function ExperimentsCard() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const titleColor = isLight ? "text-gray-900" : "text-white";
  const subtitleColor = isLight ? "text-gray-700" : "text-gray-300";

  return (
    <Card
      minHeight="400px"
      className="bg-[#184A80] text-white rounded-2xl p-8 h-full w-full flex flex-col items-center justify-center"
    >
      <div className="flex flex-col items-center justify-center w-full h-full text-center">
        <Link
          href="/results/log-experimental"
          className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
        >
          {" "}
          <div className="relative h-40 w-40 mb-8 group">
            <Image
              src="/book.png"
              alt="Log Experimental Result"
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-300"
              sizes="160px"
              priority
            />
          </div>
          <div className="space-y-4">
            <h3
              className={`text-xl md:text-2xl font-bold leading-tight ${titleColor}`}
            >
              Log Experimental Results
            </h3>

            <p
              className={`text-[15px] md:text-base font-normal tracking-wide max-w-sm leading-relaxed ${subtitleColor}`}
            >
              Record, manage, and analyze your experimental test results with
              detailed insights
            </p>
          </div>
        </Link>
      </div>
    </Card>
  );
}
