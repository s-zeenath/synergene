"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface AllPrediction {
  id: string;
  name: string;
  drugs: string;
  concentrationA: number;
  concentrationB: number;
  cellLine: string;
  score: number;
  confidence: number;
  confidenceLevel: string;
  date: string;
  isSaved: boolean;
}

export default function AllPredictionsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [predictions, setPredictions] = useState<AllPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }

    if (isLoaded && isSignedIn) {
      fetchAllPredictions();
    }
  }, [isLoaded, isSignedIn]);

  const fetchAllPredictions = async () => {
    try {
      const response = await fetch("/api/predictions/all");
      const data = await response.json();

      if (response.ok) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error("Error fetching all predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        All Predictions (Last 30 Days)
      </h1>

      {predictions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No predictions found from the last 30 days.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {predictions.map((pred) => (
            <div
              key={pred.id}
              className="border rounded-lg p-4 bg-white shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{pred.name}</h3>
                    {!pred.isSaved && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Unsaved
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{pred.drugs}</p>
                  <p className="text-sm text-gray-500">
                    Concentrations: {pred.concentrationA}μM +{" "}
                    {pred.concentrationB}μM
                  </p>
                  <p className="text-sm text-gray-500">
                    Cell Line: {pred.cellLine} | {pred.date}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xl font-bold ${
                      pred.score >= 80
                        ? "text-green-600"
                        : pred.score >= 60
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {pred.score}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Confidence: {pred.confidence}%
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {pred.confidenceLevel.toLowerCase()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
