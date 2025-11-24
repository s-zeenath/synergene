"use client";
import React from "react";
import Card, { useCardTheme } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface MonthInsightsCardProps {
  totalTests: number;
  synergisticTests: number;
  cellLineStats: Array<{ cellLine: string; occurrences: number }>;
  latestReportDate: string;
  className?: string;
}

export default function MonthInsightsCard({
  totalTests = 0,
  synergisticTests = 0,
  cellLineStats = [],
  latestReportDate,
  className = "",
}: MonthInsightsCardProps) {
  const {
    theme,
    textColor,
    highlightColor,
    chartColors,
    chartStrokeColor,
    secondaryBg,
  } = useCardTheme();

  const synergisticRate =
    totalTests > 0 ? Math.round((synergisticTests / totalTests) * 100) : 0;
  const mostPopularCellLine =
    cellLineStats.length > 0 ? cellLineStats[0].cellLine : "N/A";

  const pieData = [
    { name: "Synergistic", value: synergisticRate },
    { name: "Non-synergistic", value: 100 - synergisticRate },
  ];

  return (
    <Card minHeight="755px" className={`flex flex-col p-4 ${className}`}>
      <p className={`text-2xl md:text-3xl font-semibold mb-6 ${textColor}`}>
        This month, you tested{" "}
        <strong className={highlightColor}>{totalTests}</strong> drug
        combination{totalTests !== 1 ? "s" : ""}.
      </p>

      <div className="relative mb-6">
        <div
          className={`absolute inset-0 rounded-2xl shadow-md ${secondaryBg}`}
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
                      fill={chartColors[index]}
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
              <strong className={highlightColor}>{synergisticRate}%</strong> of
              these were synergistic
            </p>
            <Button
              variant="primary"
              className="w-full md:w-auto"
              href="dashboard/all-prediction"
            >
              View all predictions
            </Button>
          </div>
        </div>
      </div>

      <p
        className={`text-2xl md:text-3xl font-semibold mb-2 text-left ${textColor}`}
      >
        The most popular cell line over the last month was{" "}
        <strong className={highlightColor}>{mostPopularCellLine}</strong>.
      </p>

      {/* Report Section - Updated Layout */}
      <div className="relative mt-4">
        <div
          className={`absolute inset-0 rounded-xl shadow-md ${secondaryBg}`}
        ></div>

        <div
          className="relative flex items-center justify-between gap-4 p-4"
          style={{ minHeight: "140px" }}
        >
          {/* Left side - Date information */}
          <div className="flex-1">
            <p
              className={`text-lg sm:text-xl md:text-2xl font-bold ${textColor}`}
            >
              Latest report saved on:
            </p>
            <p
              className={`text-lg sm:text-xl md:text-2xl font-bold mt-1 ${highlightColor}`}
            >
              {latestReportDate}
            </p>
          </div>

          {/* Middle - Report image */}
          <div className="flex-1 flex justify-center">
            <img
              src="/report.png"
              alt="report"
              className="h-48 w-auto object-contain"
            />
          </div>

          {/* Right side - Buttons */}
          <div className="flex-1 flex flex-col gap-3 max-w-[150px]">
            <Button
              href="/view-reports"
              variant="secondary"
              className="w-full py-2 text-base text-center"
            >
              View reports
            </Button>
            <Button
              href="/generate-report"
              variant="secondary"
              className="w-full py-2 text-base text-center"
            >
              Generate report
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
