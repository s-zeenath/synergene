"use client";
import React from "react";
import Card, { useCardTheme } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Prediction {
  drugA: string;
  drugB: string;
  score: string;
}

interface SavedPredictionsCardProps {
  count?: number;
  predictions?: Prediction[];
  minHeight?: string;
}

export default function SavedPredictionsCard({
  count = 0,
  predictions = [],
  minHeight = "400px",
}: SavedPredictionsCardProps) {
  const {
    theme,
    textColor,
    highlightColor,
    tableHeaderBg,
    tableRowBorder,
    emptyText,
  } = useCardTheme();

  return (
    <Card minHeight={minHeight}>
      <div className="flex items-center gap-6 mb-6">
        <div
          className={`hidden lg:flex ${
            theme === "light" ? "bg-gray-300" : "bg-slate-600"
          } p-8 rounded-2xl items-center justify-center flex-shrink-0`}
        >
          <img src="/folder.png" alt="folder" className="h-24 w-24" />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold ${textColor}`}
          >
            You have <span className={highlightColor}>{count}</span>
          </p>
          <p
            className={`text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold ${textColor}`}
          >
            saved predictions
          </p>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-lg ${tableHeaderBg}`}>
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className={`text-left ${highlightColor} text-xs uppercase`}>
              <th className="py-2 px-2">Drug A</th>
              <th className="py-2 px-2">Drug B</th>
              <th className="py-2 px-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {predictions.length > 0 ? (
              predictions.map((p, idx) => (
                <tr
                  key={idx}
                  className={`border-t ${tableRowBorder} last:border-0`}
                >
                  <td className={textColor + " py-2 px-2"}>{p.drugA}</td>
                  <td className={textColor + " py-2 px-2"}>{p.drugB}</td>
                  <td className={textColor + " py-2 px-2"}>{p.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className={`${emptyText} text-center text-xs py-4`}
                >
                  No saved predictions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          href="/saved-predictions"
          variant="secondary"
          className="w-full sm:w-auto"
        >
          View saved predictions
        </Button>
      </div>
    </Card>
  );
}
