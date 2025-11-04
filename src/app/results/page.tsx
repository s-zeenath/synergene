"use client";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useNavbar } from "../contexts/NavbarContext";

import React from "react";
import ComparePastPredictionsCard from "@/components/results/ComparePastPredictionsCard";
import LogExpResultCard from "@/components/results/LogExpResultCard";
import PredictionSummaryCard from "@/components/results/PredictionSummaryCard";

  export default function ResultsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { theme } = useTheme();
  const { setPageTitle } = useNavbar();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }
    setPageTitle("results");
  }, [isLoaded, isSignedIn, setPageTitle]);

  if (!isLoaded || !isSignedIn) {
    return (
      <main
        className="relative min-h-screen bg-blue-100"
        style={theme === "dark" ? { backgroundColor: "#151b0e" } : {}}
      >
        <div className="px-6 md:px-12 lg:px-24 py-6 relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </main>
    );
  }
      const predictions = [
    { drugA: "Cyclocytidine", drugB: "Chlorambucil", score: "90%" },
    { drugA: "Nilotinib", drugB: "Fludarabine", score: "85%" },
  ];

  return (
    <main
      className="relative min-h-screen w-full bg-blue-100"
      style={theme === "light" ? { backgroundColor: "#5175b0" } : {}}
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-16 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch min-h-[420px] md:min-h-[460px] lg:min-h-[480px]">
          <ComparePastPredictionsCard />
          <LogExpResultCard />
          <PredictionSummaryCard className="h-full" />
        </div>
      </div>
    </main>
  );
}

