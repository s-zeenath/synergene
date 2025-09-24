import React from "react";
import Card from "@/components/ui/Card";
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
  return (
    <Card minHeight={minHeight}>
      <div className="flex items-center gap-6 mb-6">
        <div className="hidden lg:flex bg-slate-600 p-8 rounded-2xl items-center justify-center flex-shrink-0">
          <img src="/folder.png" alt="folder" className="h-24 w-24" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-white">
            You have <span className="text-blue-400">{count}</span>
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-white">
            saved predictions
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-slate-700/30">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="text-left text-blue-400 text-xs uppercase">
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
                  className="border-t border-slate-700/40 last:border-0"
                >
                  <td className="py-2 px-2">{p.drugA}</td>
                  <td className="py-2 px-2">{p.drugB}</td>
                  <td className="py-2 px-2">{p.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-xs opacity-70 py-4">
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
