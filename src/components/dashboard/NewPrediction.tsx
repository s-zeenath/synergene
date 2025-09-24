import React from "react";
import Card from "@/components/ui/Card";
import Image from "next/image";
import Link from "next/link";

export default function NewPredictionCard() {
  return (
    <Card className="flex flex-col items-center justify-between min-h-[200px] py-4">
      {/* Image (clickable) */}
      <Link
        href="/new-prediction"
        className="flex-1 flex items-center justify-center w-full"
      >
        <Image
          src="/add.png" // put add.png inside /public
          alt="Make New Prediction"
          width={160}
          height={160}
          className="object-contain cursor-pointer hover:opacity-90 transition"
        />
      </Link>

      {/* Title at bottom */}
      <h3 className="font-semibold text-lg mt-4">Make New Prediction</h3>
    </Card>
  );
}
