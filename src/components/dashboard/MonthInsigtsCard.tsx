"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useTheme } from "@/components/ui/ThemeToggle";

interface MonthInsightsCardProps {
  totalTests: number;
  synergisticRate?: number;
  mostPopularCellLine?: string;
  className?: string;
}

export default function MonthInsightsCard({
  totalTests = 4,
  synergisticRate = 75,
  mostPopularCellLine = "AF49",
  className = "",
}: MonthInsightsCardProps) {
  const { theme } = useTheme();

  const pieData = [
    { name: "Synergistic", value: synergisticRate },
    { name: "Non-synergistic", value: 100 - synergisticRate },
  ];

  const barData = [
    { cellLine: "AF49", occurrences: 12 },
    { cellLine: "BF23", occurrences: 8 },
    { cellLine: "CF12", occurrences: 5 },
  ];

  // Colors based on theme
  const COLORS =
    theme === "light" ? ["#3b82f6", "#1e40af"] : ["#60a5fa", "#1e3a8a"];
  const textColor = theme === "light" ? "text-gray-900" : "text-white";
  const highlightBlue = theme === "light" ? "text-blue-600" : "text-blue-400"; // <-- match SavedPredictionsCard
  const chartBackground = theme === "light" ? "bg-gray-100" : "bg-white/10";
  const chartStrokeColor = theme === "light" ? "#1e40af" : "#1e3a8a";

  return (
    <Card className={`flex flex-col p-4 ${className} max-h-[730px]`}>
      <p className={`text-2xl md:text-3xl font-semibold mb-6 ${textColor}`}>
        This month, you tested{" "}
        <strong className={highlightBlue}>{totalTests}</strong> drug
        combinations.
      </p>

      <div className="relative mb-6">
        <div
          className={`absolute inset-0 rounded-2xl shadow-md ${chartBackground}`}
        ></div>

        <div
          className="relative flex flex-col md:flex-row items-center gap-6 p-6"
          style={{ minHeight: "160px" }}
        >
          <div className="w-48 h-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index]}
                      stroke={chartStrokeColor}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "light" ? "#f1f5f9" : "#1e3a8a",
                    border: "none",
                    color: chartStrokeColor,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col flex-1 items-center md:items-end justify-center h-full">
            <p
              className={`text-2xl md:text-3xl font-bold mb-4 text-right ${textColor}`}
            >
              <strong className={highlightBlue}>{synergisticRate}%</strong> of
              these were synergistic
            </p>
            <Button
              variant="primary"
              className="w-full md:w-auto"
              href="/all-predictions"
            >
              View all predictions
            </Button>
          </div>
        </div>
      </div>

      <p
        className={`text-2xl md:text-3xl font-semibold mb-4 text-left ${textColor}`}
      >
        The most popular cell line over the last month was{" "}
        <strong className={highlightBlue}>{mostPopularCellLine}</strong>.
      </p>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex flex-col gap-2 md:w-48 mt-6">
          <Button variant="secondary" className="w-full">
            Recommend Cell Lines
          </Button>
          <Button variant="secondary" className="w-full">
            View Cell Line by Disease
          </Button>
          <Button variant="secondary" className="w-full">
            Adjust Timeframe
          </Button>
        </div>

        <div className="flex-1 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cellLine" stroke={chartStrokeColor} />
              <YAxis stroke={chartStrokeColor} />
              <Tooltip />
              <Bar dataKey="occurrences" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
