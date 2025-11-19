"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useNavbar } from "@/app/contexts/NavbarContext";
import {
  InvertedThemeProvider,
  useEffectiveTheme,
} from "@/app/contexts/InvertedTabContext";

interface DrugInfo {
  name: string;
  description?: string;
  molecularFormula?: string;
  molecularWeight?: string;
  iupacName?: string;
  canonicalSmiles?: string;
  target?: string;
  mechanism?: string;
  classification?: string;
  pubchemId?: string;
}

// Inner card component that uses inverted theme
function DrugInfoCard({ drugInfo }: { drugInfo: DrugInfo }) {
  const effectiveTheme = useEffectiveTheme();
  const isLight = effectiveTheme === "light";

  return (
    <div
      className={`rounded-2xl shadow-lg p-6 transition-all duration-300 animate-in fade-in-50 ${
        isLight
          ? "bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200"
          : "bg-gradient-to-br from-blue-900/50 to-indigo-900 border border-blue-700"
      }`}
    >
      <h2 className="text-2xl font-bold mb-4 italic text-blue-400 border-b pb-2 border-blue-200 dark:border-blue-700">
        {drugInfo.name}
      </h2>

      <div className="space-y-4">
        {/* Target */}
        {drugInfo.target && (
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 text-opacity-100 uppercase tracking-wide mb-1">
              Target
            </h3>
            <p className="text-lg text-gray-800 dark:text-gray-200">
              {drugInfo.target}
            </p>
          </div>
        )}

        {/* Mechanism */}
        {drugInfo.mechanism && (
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 text-opacity-100 uppercase tracking-wide mb-1">
              Mechanism of Action
            </h3>
            <p className="text-lg text-gray-800 dark:text-gray-200">
              {drugInfo.mechanism}
            </p>
          </div>
        )}

        {/* Molecular Information */}
        {(drugInfo.molecularFormula || drugInfo.molecularWeight) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {drugInfo.molecularFormula && (
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 text-opacity-100 uppercase tracking-wide mb-1">
                  Molecular Formula
                </h3>
                <p className="text-base text-gray-800 dark:text-gray-200 font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                  {drugInfo.molecularFormula}
                </p>
              </div>
            )}
            {drugInfo.molecularWeight && (
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 text-opacity-100 uppercase tracking-wide mb-1">
                  Molecular Weight
                </h3>
                <p className="text-base text-gray-800 dark:text-gray-200">
                  {drugInfo.molecularWeight} g/mol
                </p>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {drugInfo.description && (
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 text-opacity-100 uppercase tracking-wide mb-1">
              Description
            </h3>
            <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
              {drugInfo.description}
            </p>
          </div>
        )}

        {/* PubChem ID */}
        {drugInfo.pubchemId && (
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Source: PubChem CID {drugInfo.pubchemId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LookupDrugPage() {
  const { theme } = useTheme();
  const { isLoaded, isSignedIn } = useUser();
  const { setPageTitle } = useNavbar();
  const [searchTerm, setSearchTerm] = useState("");
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) redirect("/sign-in");
    setPageTitle("drug lookup");
  }, [isLoaded, isSignedIn, setPageTitle]);

  const searchDrug = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setDrugInfo(null);

    try {
      const response = await fetch(
        `/api/drugs/lookup?name=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch drug information");
      }

      const data = await response.json();

      if (data.success && data.drug) {
        setDrugInfo(data.drug);
      } else {
        setError("Drug not found");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while searching");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchDrug();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <main
        className="relative min-h-screen bg-blue-100"
        style={theme === "dark" ? { backgroundColor: "#5175b0" } : {}}
      >
        <div className="px-16 md:px-24 lg:px-40 py-12 relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  const isLight = theme === "light";

  return (
    <main
      className="relative min-h-screen bg-blue-100"
      style={theme === "light" ? { backgroundColor: "#5175b0" } : {}}
    >
      <div className="px-16 md:px-24 lg:px-40 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Messages */}
          {error && (
            <div className="mb-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            </div>
          )}

          {/* Main Content Card */}
          <div
            className={`rounded-2xl shadow-xl p-8 transition-colors duration-300 min-h-[600px] ${
              isLight ? "bg-white text-gray-900" : "bg-[#1b2b4a] text-white"
            }`}
          >
            <h1 className="text-3xl font-semibold mb-8 text-center">
              Lookup Drug Information
            </h1>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter drug name (e.g., Aspirin, Metformin, Ibuprofen)"
                  className={`flex-1 rounded-xl px-4 py-3 border transition-colors duration-300 text-base ${
                    isLight
                      ? "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      : "bg-[#0f1a33] border-[#334568] text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-800"
                  }`}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !searchTerm.trim()}
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    "Search Drug"
                  )}
                </button>
              </div>
            </form>

            {/* Drug Information Card with Inverted Theme - Only this part is inverted */}
            {drugInfo && (
              <div className="mt-8">
                <InvertedThemeProvider invert={true}>
                  <DrugInfoCard drugInfo={drugInfo} />
                </InvertedThemeProvider>
              </div>
            )}

            {/* Instructions */}
            {!drugInfo && !loading && !error && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-16 space-y-4">
                <p className="text-lg font-medium">
                  Search for drug information using PubChem database
                </p>
                <p className="text-base">
                  Try searching for common drugs like: Aspirin, Metformin,
                  Ibuprofen, Atorvastatin, Lisinopril, etc.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
