"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useNavbar } from "../contexts/NavbarContext";
import LogExpResultCard from "@/components/results/LogExpResultCard";
import PredictionSummaryCard from "@/components/results/PredictionSummaryCard";
import OldPredictionsCard from "@/components/results/OldPredictionsTable";

export default function ResultsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { theme } = useTheme();
  const { setPageTitle } = useNavbar();

  useEffect(() => {
    if (isLoaded && !isSignedIn) redirect("/sign-in");
    setPageTitle("Results");
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

  return (
    <main
      className="relative min-h-screen w-full bg-blue-100"
      style={theme === "light" ? { backgroundColor: "#5175b0" } : {}}
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-16 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch min-h-[420px] md:min-h-[460px] lg:min-h-[480px]">
          <OldPredictionsCard />
          <LogExpResultCard />
          <PredictionSummaryCard className="h-full" />
        </div>
      </div>
    </main>
  );
}