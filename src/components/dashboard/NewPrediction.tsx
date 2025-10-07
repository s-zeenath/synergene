"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function NewPredictionCard() {
  const { theme } = useTheme();

  const titleColor = theme === "light" ? "text-gray-900" : "text-white";

  return (
    <Card className="flex flex-col items-center justify-between min-h-[200px] py-4">
      <Link
        href="/new-prediction"
        className="flex-1 flex items-center justify-center w-full"
      >
        <Image
          src="/add.png"
          alt="Make New Prediction"
          width={160}
          height={160}
          className="object-contain cursor-pointer hover:opacity-90 transition"
        />
      </Link>

      <h3 className={`font-semibold text-lg mt-4 ${titleColor}`}>
        Make New Prediction
      </h3>
    </Card>
  );
}
