"use client";
import React from "react";
import Card, { useCardTheme } from "@/components/ui/Card";
import Image from "next/image";
import Link from "next/link";

export default function NewPredictionCard() {
  const { textColor } = useCardTheme();

  return (
    <Card className="flex flex-col items-center justify-between min-h-[200px] py-4">
      <Link
        href="dashboard/newPrediction"
        className="flex-1 flex items-center justify-center w-full"
      >
        <div className="relative group">
          <Image
            src="/add.png"
            alt="Make New Prediction"
            width={160}
            height={160}
            className="object-contain cursor-pointer group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </Link>

      <h3 className={`font-semibold text-lg mt-4 ${textColor}`}>
        Make New Prediction
      </h3>
    </Card>
  );
}
