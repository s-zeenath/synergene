"use client";

import React from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/components/ui/ThemeToggle";

export default function ComparePastPredictionsCard() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const data = [
    { name: "Drug A", value: 70 },
    { name: "Drug B", value: 88 },
  ];

  return (
    <Link
      href="/results/old-predictions"
      className="block h-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-2xl"
      aria-label="Go to old predictions"
    >
      <Card
        className={`h-full w-full flex flex-col items-center justify-center rounded-2xl p-6 shadow-md cursor-pointer hover:scale-[1.01] transition-transform ${
          isLight ? "bg-[#D9E6FF]" : "bg-[#1d2e57]"
        }`}
      >
        <div
          className={`w-full max-w-sm h-[44px] rounded-xl px-4 flex items-center justify-between shadow-sm whitespace-nowrap mb-6 ${
            isLight ? "bg-[#a6a6a6] text-black" : "bg-[#a6a6a6] text-white"
          }`}
        >
          <span className="text-[16px] font-medium tracking-wide truncate">
            Select old prediction
          </span>
          <span className="text-[18px] leading-none flex-shrink-0">▾</span>
        </div>

        <div className="w-full flex-1 flex items-center justify-center">
          <div className="w-full max-w-md h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#C0C0C0" : "#8C8C8C"} />
                <XAxis
                  dataKey="name"
                  stroke={isLight ? "#000000" : "#FFFFFF"}
                  tick={{ fill: isLight ? "#000000" : "#FFFFFF", fontSize: 13, fontWeight: "bold" }}
                />
                <YAxis
                  stroke={isLight ? "#000000" : "#FFFFFF"}
                  tick={{ fill: isLight ? "#000000" : "#FFFFFF", fontSize: 13, fontWeight: "bold" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? "#FFFFFF" : "#1d2e57",
                    borderRadius: 8,
                    border: "none",
                    color: isLight ? "#000000" : "#FFFFFF",
                    fontWeight: "bold",
                  }}
                  labelStyle={{ color: isLight ? "#000000" : "#FFFFFF", fontWeight: "bold" }}
                />
                <Bar dataKey="value" fill="#2B9FFF" barSize={30} radius={[6, 6, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </Link>
  );
}