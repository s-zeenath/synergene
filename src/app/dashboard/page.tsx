"use client";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";
import SavedPredictionsCard from "@/components/dashboard/SavedPredictionsCard";
import LookupDrugCard from "@/components/dashboard/LookupDrugCard";
import NewPredictionCard from "@/components/dashboard/NewPrediction";
import MonthInsightsCard from "@/components/dashboard/MonthInsigtsCard";
import PopularDrugsCard from "@/components/dashboard/PopularDrugsCard";
import ExperimentsCard from "@/components/dashboard/ExperimentsCard";
import { useNavbar } from "../contexts/NavbarContext";

interface AllPrediction {
  id: string;
  drugs: string;
  concentrationA: number;
  concentrationB: number;
  cellLine: string;
  score: number;
  confidence: number;
  confidenceLevel: string;
  date: string;
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { theme } = useTheme();
  const { setPageTitle } = useNavbar();
  const [savedPredictions, setSavedPredictions] = useState<any[]>([]);
  const [allPredictions, setAllPredictions] = useState<AllPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }
    setPageTitle("dashboard");

    if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn, setPageTitle]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch both saved predictions and all predictions in parallel
      const [savedResponse, allResponse] = await Promise.all([
        fetch("/api/predictions/saved"),
        fetch("/api/predictions/all"),
      ]);

      if (!savedResponse.ok || !allResponse.ok) {
        throw new Error("Failed to fetch predictions");
      }

      const savedData = await savedResponse.json();
      const allData = await allResponse.json();

      setSavedPredictions(savedData.predictions || []);
      setAllPredictions(allData.predictions || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setSavedPredictions([]);
      setAllPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate month insights from all predictions
  const calculateMonthInsights = () => {
    const totalTests = allPredictions.length;

    // Count synergistic tests (score > 20)
    const synergisticTests = allPredictions.filter(
      (pred) => pred.score > 20
    ).length;

    // Calculate cell line statistics
    const cellLineCount: Record<string, number> = {};
    allPredictions.forEach((pred) => {
      cellLineCount[pred.cellLine] = (cellLineCount[pred.cellLine] || 0) + 1;
    });

    const cellLineStats = Object.entries(cellLineCount)
      .map(([cellLine, occurrences]) => ({ cellLine, occurrences }))
      .sort((a, b) => b.occurrences - a.occurrences);

    return {
      totalTests,
      synergisticTests,
      cellLineStats,
    };
  };

  const { totalTests, synergisticTests, cellLineStats } =
    calculateMonthInsights();

  // Format predictions for the saved predictions card
  const formattedPredictions = savedPredictions.slice(0, 3).map((pred) => ({
    drugA: pred.drugs.split(" + ")[0],
    drugB: pred.drugs.split(" + ")[1],
    score: `${Math.round(pred.score)}%`,
  }));

  // Calculate popular drugs from all predictions
  const calculatePopularDrugs = (predictions: AllPrediction[]) => {
    const drugCount: Record<string, number> = {};

    predictions.forEach((pred) => {
      const drugs = pred.drugs.split(" + ");
      drugs.forEach((drug: string) => {
        drugCount[drug] = (drugCount[drug] || 0) + 1;
      });
    });

    return Object.entries(drugCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const popularDrugs = calculatePopularDrugs(allPredictions);

  // Get latest report date from predictions or use current date
  const getLatestReportDate = () => {
    if (allPredictions.length === 0) {
      return "No reports yet";
    }

    // Find the most recent prediction date
    const latestDate = allPredictions.reduce((latest, pred) => {
      const predDate = new Date(pred.date);
      return predDate > latest ? predDate : latest;
    }, new Date(0)); // Start with earliest possible date

    // Format as DD/MM/YY
    return latestDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

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

  return (
    <main
      className="relative min-h-screen bg-blue-100"
      style={theme === "light" ? { backgroundColor: "#5175b0" } : {}}
    >
      <div className="px-6 md:px-12 lg:px-24 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
          <div className="flex flex-col gap-6">
            <SavedPredictionsCard
              count={savedPredictions.length}
              predictions={formattedPredictions}
              isLoading={isLoading}
            />
            <div className="flex flex-col lg:flex-row gap-4">
              <LookupDrugCard />
              <NewPredictionCard />
            </div>
          </div>

          <MonthInsightsCard
            totalTests={totalTests}
            synergisticTests={synergisticTests}
            cellLineStats={cellLineStats}
            latestReportDate={getLatestReportDate()}
          />

          <div className="flex flex-col gap-4">
            <PopularDrugsCard drugs={popularDrugs} isLoading={isLoading} />
            <ExperimentsCard />
          </div>
        </div>
      </div>
    </main>
  );
}
