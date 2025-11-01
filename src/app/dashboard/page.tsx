"use client";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";
import SavedPredictionsCard from "@/components/dashboard/SavedPredictionsCard";
import LookupDrugCard from "@/components/dashboard/LookupDrugCard";
import NewPredictionCard from "@/components/dashboard/NewPrediction";
import MonthInsightsCard from "@/components/dashboard/MonthInsigtsCard";
import PopularDrugsCard from "@/components/dashboard/PopularDrugsCard";
import ReportCard from "@/components/dashboard/ReportCard";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { theme } = useTheme();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return (
      <main
        className="relative min-h-screen bg-blue-100"
        style={theme === "dark" ? { backgroundColor: "#5175b0" } : {}}
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

  const popularDrugs = [
    { name: "Cisplatin", count: 23 },
    { name: "Palbociclib", count: 12 },
    { name: "Sorafenib", count: 6 },
  ];

  return (
    <main
      className="relative min-h-screen bg-blue-100"
      style={theme === "light" ? { backgroundColor: "#5175b0" } : {}}
    >
      <div className="px-6 md:px-12 lg:px-24 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
          <div className="flex flex-col gap-6">
            <SavedPredictionsCard count={10} predictions={predictions} />
            <div className="flex flex-col lg:flex-row gap-4">
              <LookupDrugCard />
              <NewPredictionCard />
            </div>
          </div>

          <MonthInsightsCard totalTests={4} />

          <div className="flex flex-col gap-4">
            <PopularDrugsCard drugs={popularDrugs} />
            <ReportCard latestReportDate="24/3/25" />
          </div>
        </div>
      </div>
    </main>
  );
}
