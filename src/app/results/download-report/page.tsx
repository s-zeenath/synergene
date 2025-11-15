"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useNavbar } from "../../contexts/NavbarContext";

export default function DownloadReportPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { theme } = useTheme();
  const { setPageTitle } = useNavbar();

  const isLight = theme === "light";

  useEffect(() => {
    if (isLoaded && !isSignedIn) redirect("/sign-in");
    setPageTitle("Report");
  }, [isLoaded, isSignedIn, setPageTitle]);

  if (!isLoaded || !isSignedIn) {
    return (
      <main
        className="relative min-h-screen bg-blue-100"
        style={!isLight ? {} : { backgroundColor: "#5175b0" }}
      >
        <div className="px-6 md:px-12 lg:px-24 py-6 flex justify-center items-center h-64 text-lg">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen w-full bg-blue-100 flex items-center justify-center"
      style={isLight ? { backgroundColor: "#5175b0" } : {}}
    >
      <div
        className={`max-w-5xl w-full mx-6 md:mx-auto rounded-2xl shadow-xl 
                    p-14 min-h-[420px] text-center flex flex-col items-center justify-center
                    transition-colors duration-300 ${
          isLight ? "bg-white text-gray-900" : "bg-[#1b2b4a] text-white"
        }`}
      >
        <h1 className="text-3xl font-semibold mb-4">Download Report</h1>

        <p className={`text-lg mb-8 ${
            isLight ? "text-gray-500" : "text-gray-300"
          }`}>
          You can download your synergy analysis reports here
        </p>

        <button
          className="bg-[#2B9FFF] hover:brightness-110 px-8 py-3 rounded-xl font-semibold text-white shadow transition-all duration-200"
          onClick={() => alert("Downloading report...")}>
          Download Report
        </button>
      </div>
    </main>
  );
}
