"use client";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useNavbar } from "@/app/contexts/NavbarContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InvertedThemeProvider } from "@/app/contexts/InvertedTabContext";

const INITIAL_DRUG_OPTIONS: string[] = [];

export default function NewPredictionPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { theme } = useTheme();
  const { setPageTitle } = useNavbar();

  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");
  const [drug1Concentration, setDrug1Concentration] = useState("");
  const [drug2Concentration, setDrug2Concentration] = useState("");
  const [cellLine, setCellLine] = useState("");
  const [showDrug1Dropdown, setShowDrug1Dropdown] = useState(false);
  const [showDrug2Dropdown, setShowDrug2Dropdown] = useState(false);

  const [availableDrugs, setAvailableDrugs] =
    useState<string[]>(INITIAL_DRUG_OPTIONS);
  const [availableDrug2, setAvailableDrug2] = useState<string[]>([]);
  const [availableCellLines, setAvailableCellLines] = useState<any[]>([]);
  const [concentrationRanges, setConcentrationRanges] = useState<{
    minConcA: number;
    maxConcA: number;
    minConcB: number;
    maxConcB: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [synergyScore, setSynergyScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [predictionName, setPredictionName] = useState("");
  const [predictionCounter, setPredictionCounter] = useState(1);
  const [allPredictions, setAllPredictions] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    drug2: false,
    cellLines: false,
    concentrations: false,
  });

  const validateConcentrations = useCallback(() => {
    if (!concentrationRanges) return false;

    const concA = parseFloat(drug1Concentration);
    const concB = parseFloat(drug2Concentration);

    if (isNaN(concA) || isNaN(concB)) {
      return false;
    }

    const validA =
      concA >= concentrationRanges.minConcA &&
      concA <= concentrationRanges.maxConcA;
    const validB =
      concB >= concentrationRanges.minConcB &&
      concB <= concentrationRanges.maxConcB;

    return validA && validB;
  }, [drug1Concentration, drug2Concentration, concentrationRanges]);

  const getConcentrationValidationMessage = () => {
    if (!concentrationRanges) return null;

    return (
      <div className="space-y-1">
        <p className="text-base text-blue-700 dark:text-blue-300">
          <span className="font-medium">Drug 1:</span>{" "}
          {concentrationRanges.minConcA} - {concentrationRanges.maxConcA} μM
        </p>
        <p className="text-base text-blue-700 dark:text-blue-300">
          <span className="font-medium">Drug 2:</span>{" "}
          {concentrationRanges.minConcB} - {concentrationRanges.maxConcB} μM
        </p>
      </div>
    );
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }
    setPageTitle("new predictions");

    if (isLoaded && isSignedIn) {
      loadInitialData();
      const savedCounter = localStorage.getItem("predictionCounter");
      if (savedCounter) {
        setPredictionCounter(parseInt(savedCounter));
      }
    }
  }, [isLoaded, isSignedIn, setPageTitle]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/drugs/available");

      if (!response.ok) {
        throw new Error(`Failed to load drugs: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAvailableDrugs(data.drugs);
      } else {
        throw new Error(data.error || "Failed to load drug data");
      }
    } catch (error) {
      console.error("Error loading drug data:", error);
      setErrorMessage("Failed to load drug data. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced drug2 loading
  useEffect(() => {
    if (!drug1) {
      setAvailableDrug2([]);
      setDrug2("");
      return;
    }

    const loadDrug2Options = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, drug2: true }));
        setErrorMessage(null);

        const response = await fetch(
          `/api/drugs/available-pairs?drug1=${encodeURIComponent(drug1)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to load drug pairs: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setAvailableDrug2(data.drugs || []);
          // Reset drug2 if it's no longer available
          if (drug2 && !data.drugs.includes(drug2)) {
            setDrug2("");
          }
        } else {
          throw new Error(data.error || "Failed to load compatible drugs");
        }
      } catch (error) {
        console.error("Error loading drug2 options:", error);
        setAvailableDrug2([]);
        setDrug2("");
        if (drug1) {
          setErrorMessage("Failed to load compatible drugs. Please try again.");
        }
      } finally {
        setLoadingStates((prev) => ({ ...prev, drug2: false }));
      }
    };

    const timer = setTimeout(loadDrug2Options, 300);
    return () => clearTimeout(timer);
  }, [drug1, drug2]);

  // Load cell lines when both drugs are selected
  useEffect(() => {
    if (!drug1 || !drug2) {
      setAvailableCellLines([]);
      setCellLine("");
      return;
    }

    const loadCellLines = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, cellLines: true }));
        setErrorMessage(null);

        const response = await fetch(
          `/api/cell-lines/available?drug1=${encodeURIComponent(
            drug1
          )}&drug2=${encodeURIComponent(drug2)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to load cell lines: ${response.status}`);
        }

        const data = await response.json();

        console.log("Cell lines response:", data);

        if (data.success) {
          const cellLines = data.cellLines || [];
          setAvailableCellLines(cellLines);

          // Reset cell line if it's no longer available
          if (cellLine && !cellLines.find((cl: any) => cl.value === cellLine)) {
            setCellLine("");
          }

          // Auto-select first cell line if only one is available
          if (cellLines.length === 1 && !cellLine) {
            setCellLine(cellLines[0].value);
          }
        } else {
          throw new Error(data.error || "No cell lines available");
        }
      } catch (error) {
        console.error("Error loading cell lines:", error);
        setAvailableCellLines([]);
        setCellLine("");
        if (drug1 && drug2) {
          setErrorMessage(
            `No cell line data available for ${drug1} + ${drug2} combination`
          );
        }
      } finally {
        setLoadingStates((prev) => ({ ...prev, cellLines: false }));
      }
    };

    const timer = setTimeout(loadCellLines, 300);
    return () => clearTimeout(timer);
  }, [drug1, drug2, cellLine]);

  // Load concentration ranges when all three are selected
  useEffect(() => {
    if (!drug1 || !drug2 || !cellLine) {
      setConcentrationRanges(null);
      setDrug1Concentration("");
      setDrug2Concentration("");
      return;
    }

    const loadConcentrations = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, concentrations: true }));

        const response = await fetch(
          `/api/concentration-ranges?drug1=${encodeURIComponent(
            drug1
          )}&drug2=${encodeURIComponent(drug2)}&cellLine=${encodeURIComponent(
            cellLine
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load concentration ranges: ${response.status}`
          );
        }

        const data = await response.json();

        if (data.success) {
          setConcentrationRanges(data.ranges);
        } else {
          throw new Error(data.error || "Failed to load concentration ranges");
        }
      } catch (error) {
        console.error("Error loading concentration ranges:", error);
        setConcentrationRanges(null);
        setErrorMessage("Failed to load concentration ranges");
      } finally {
        setLoadingStates((prev) => ({ ...prev, concentrations: false }));
      }
    };

    loadConcentrations();
  }, [drug1, drug2, cellLine]);

  const filteredDrugs1 = availableDrugs.filter((drug) =>
    drug.toLowerCase().includes(drug1.toLowerCase())
  );

  const filteredDrugs2 = availableDrug2.filter((drug) =>
    drug.toLowerCase().includes(drug2.toLowerCase())
  );

  const handleDrug1Select = (selectedDrug: string) => {
    setDrug1(selectedDrug);
    setShowDrug1Dropdown(false);
    // Reset dependent fields
    setDrug2("");
    setCellLine("");
    setDrug1Concentration("");
    setDrug2Concentration("");
    setSynergyScore(null);
  };

  const handleDrug2Select = (selectedDrug: string) => {
    setDrug2(selectedDrug);
    setShowDrug2Dropdown(false);
    // Reset dependent fields
    setCellLine("");
    setDrug1Concentration("");
    setDrug2Concentration("");
    setSynergyScore(null);
  };

  // Save to all predictions (without name) - extracted as separate function
  const saveToAllPredictions = async (score: number) => {
    try {
      const saveResponse = await fetch("/api/predictions/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          drug1,
          drug2,
          drug1Concentration: parseFloat(drug1Concentration),
          drug2Concentration: parseFloat(drug2Concentration),
          cellLine,
          synergyScore: score,
          confidenceScore: 65,
        }),
      });

      if (!saveResponse.ok) {
        let errorText = "Failed to save prediction to history";
        try {
          const errorData = await saveResponse.json();
          errorText = errorData.error || errorData.message || errorText;
        } catch (e) {
          errorText = saveResponse.statusText || errorText;
        }
        throw new Error(errorText);
      }

      const savedData = await saveResponse.json();

      // Update local state with the saved prediction
      const newPrediction = {
        id: savedData.prediction.id,
        drugs: `${drug1} + ${drug2}`,
        concentrationA: parseFloat(drug1Concentration),
        concentrationB: parseFloat(drug2Concentration),
        cellLine: cellLine,
        score: score,
        confidence: 65,
        date: new Date().toLocaleDateString(),
      };

      setAllPredictions((prev) => [newPrediction, ...prev]);
      return true;
    } catch (error) {
      console.error("Error saving to all predictions:", error);
      throw error;
    }
  };

  const calculateSynergyScore = async () => {
    if (!validateConcentrations()) {
      setErrorMessage("Please enter valid concentrations first");
      return;
    }

    setIsCalculating(true);
    setErrorMessage(null);

    try {
      // Calculate score (mock calculation)
      setTimeout(async () => {
        const score = 87;
        setSynergyScore(score);

        // ALWAYS save to all predictions when score is calculated
        try {
          await saveToAllPredictions(score);
          setSuccessMessage("Synergy score calculated and saved to history!");
        } catch (error) {
          console.error("Error saving to all predictions:", error);
          // Don't show error for all predictions save - just log it
          // The score calculation was still successful
          setSuccessMessage("Synergy score calculated!");
        } finally {
          setIsCalculating(false);
        }
      }, 2000);
    } catch (error) {
      console.error("Error calculating synergy score:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error calculating synergy score"
      );
      setIsCalculating(false);
    }
  };

  const generateReport = () => {
    if (!synergyScore) {
      setErrorMessage("Please calculate synergy score first");
      return;
    }
    setSuccessMessage("Generating report...");
    // Your report generation logic here
  };

  const handleSavePrediction = () => {
    if (!synergyScore) {
      setErrorMessage("Please calculate synergy score first");
      return;
    }
    setShowSaveOptions(true);
  };

  const savePredictionWithName = async (customName?: string) => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const finalName = customName || `PRED_${predictionCounter}`;

      // Save to saved predictions (with name)
      const response = await fetch("/api/predictions/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: finalName,
          drug1,
          drug2,
          drug1Concentration: parseFloat(drug1Concentration),
          drug2Concentration: parseFloat(drug2Concentration),
          cellLine,
          synergyScore,
          confidenceScore: 65,
        }),
      });

      if (!response.ok) {
        let errorMessage = response.statusText || "Failed to save prediction";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const text = await response.text();
            if (text) errorMessage = text;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Update local state
      if (!customName) {
        setPredictionCounter((prev) => prev + 1);
        localStorage.setItem(
          "predictionCounter",
          (predictionCounter + 1).toString()
        );
      }

      setShowSaveOptions(false);
      setPredictionName("");
      setSuccessMessage(`Prediction saved as: ${finalName}`);
    } catch (error) {
      console.error("Error saving prediction:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error saving prediction";
      setErrorMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelSave = () => {
    setShowSaveOptions(false);
    setPredictionName("");
    setErrorMessage(null);
  };

  const getSynergyType = () => {
    if (synergyScore === null) return "";
    return synergyScore >= 0 ? "Synergistic" : "Antagonistic";
  };

  const getScoreColor = () => {
    if (synergyScore === null) return "text-gray-500";
    if (synergyScore >= 80) return "text-green-600 dark:text-green-400";
    if (synergyScore >= 60) return "text-blue-600 dark:text-blue-400";
    if (synergyScore >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
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

  if (isLoading) {
    return (
      <main
        className="relative min-h-screen bg-blue-100"
        style={theme === "light" ? { backgroundColor: "#5175b0" } : {}}
      >
        <div className="px-16 md:px-24 lg:px-40 py-12 relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading drug data...</div>
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
      <div className="px-16 md:px-24 lg:px-40 py-12 relative z-10">
        {/* Messages */}
        {(errorMessage || successMessage) && (
          <div className="max-w-7xl mx-auto mb-6">
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                {successMessage}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Card */}
          <div>
            <Card
              title="Make New Prediction"
              minHeight="700px"
              className="shadow-lg"
            >
              <div className="space-y-8">
                {/* Drug 1 */}
                <div className="relative">
                  <label className="block text-base font-semibold mb-3">
                    Drug 1
                  </label>
                  <input
                    type="text"
                    value={drug1}
                    onChange={(e) => {
                      setDrug1(e.target.value);
                      setShowDrug1Dropdown(true);
                    }}
                    onFocus={() => setShowDrug1Dropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowDrug1Dropdown(false), 200)
                    }
                    placeholder="Type to search drugs..."
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                  {showDrug1Dropdown && filteredDrugs1.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredDrugs1.map((drug) => (
                        <div
                          key={drug}
                          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white text-base"
                          onMouseDown={() => handleDrug1Select(drug)}
                        >
                          {drug}
                        </div>
                      ))}
                    </div>
                  )}
                  {drug1 && !availableDrugs.includes(drug1) && (
                    <p className="text-red-500 text-sm mt-1">
                      Drug not found in database
                    </p>
                  )}
                </div>

                {/* Drug 2 */}
                <div className="relative">
                  <label className="block text-base font-semibold mb-3">
                    Drug 2
                  </label>
                  <input
                    type="text"
                    value={drug2}
                    onChange={(e) => {
                      setDrug2(e.target.value);
                      setShowDrug2Dropdown(true);
                    }}
                    onFocus={() => setShowDrug2Dropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowDrug2Dropdown(false), 200)
                    }
                    placeholder={
                      drug1
                        ? "Type to search compatible drugs..."
                        : "Select Drug 1 first"
                    }
                    disabled={!drug1}
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  />
                  {showDrug2Dropdown && filteredDrugs2.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredDrugs2.map((drug) => (
                        <div
                          key={drug}
                          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white text-base"
                          onMouseDown={() => handleDrug2Select(drug)}
                        >
                          {drug}
                        </div>
                      ))}
                    </div>
                  )}
                  {loadingStates.drug2 && (
                    <p className="text-blue-500 text-sm mt-1">
                      Loading compatible drugs...
                    </p>
                  )}
                  {drug2 && !availableDrug2.includes(drug2) && (
                    <p className="text-red-500 text-sm mt-1">
                      This drug combination is not available in database
                    </p>
                  )}
                  {!drug1 && (
                    <p className="text-gray-500 text-sm mt-1">
                      Please select Drug 1 first
                    </p>
                  )}
                </div>

                {/* Cell Line */}
                <div>
                  <label className="block text-base font-semibold mb-3">
                    Cell Line
                  </label>
                  <select
                    value={cellLine}
                    onChange={(e) => setCellLine(e.target.value)}
                    disabled={
                      !drug1 ||
                      !drug2 ||
                      availableCellLines.length === 0 ||
                      loadingStates.cellLines
                    }
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    <option value="">
                      {!drug1 || !drug2
                        ? "Select both drugs first"
                        : loadingStates.cellLines
                        ? "Loading cell lines..."
                        : availableCellLines.length === 0
                        ? "No cell lines available for this combination"
                        : "Select Cell Line"}
                    </option>
                    {availableCellLines.map((line) => (
                      <option key={line.value} value={line.value}>
                        {line.label}
                      </option>
                    ))}
                  </select>
                  {loadingStates.cellLines && (
                    <p className="text-blue-500 text-sm mt-1">
                      Loading cell lines...
                    </p>
                  )}
                  {drug1 &&
                    drug2 &&
                    availableCellLines.length === 0 &&
                    !loadingStates.cellLines && (
                      <p className="text-red-500 text-sm mt-1">
                        No cell line data available for {drug1} + {drug2}{" "}
                        combination
                      </p>
                    )}
                </div>

                {concentrationRanges && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Valid Concentration Ranges:
                    </p>
                    {getConcentrationValidationMessage()}
                  </div>
                )}

                {loadingStates.concentrations && concentrationRanges && (
                  <p className="text-blue-500 text-sm">
                    Updating concentration ranges...
                  </p>
                )}

                <div>
                  <label className="block text-base font-semibold mb-3">
                    Drug 1 Concentration (μM)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={drug1Concentration}
                    onChange={(e) => setDrug1Concentration(e.target.value)}
                    placeholder="Enter concentration"
                    disabled={!concentrationRanges}
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  />
                  {drug1Concentration &&
                    concentrationRanges &&
                    !validateConcentrations() && (
                      <p className="text-red-500 text-sm mt-1">
                        Must be between {concentrationRanges.minConcA} and{" "}
                        {concentrationRanges.maxConcA} μM
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-base font-semibold mb-3">
                    Drug 2 Concentration (μM)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={drug2Concentration}
                    onChange={(e) => setDrug2Concentration(e.target.value)}
                    placeholder="Enter concentration"
                    disabled={!concentrationRanges}
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  />
                  {drug2Concentration &&
                    concentrationRanges &&
                    !validateConcentrations() && (
                      <p className="text-red-500 text-sm mt-1">
                        Must be between {concentrationRanges.minConcB} and{" "}
                        {concentrationRanges.maxConcB} μM
                      </p>
                    )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Card - Synergy Score with INVERTED THEME */}
          <div>
            <InvertedThemeProvider invert={true}>
              <Card
                title="Synergy Score"
                minHeight="700px"
                className="bg-transparent border-0 shadow-none"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1 flex flex-col items-center justify-center p-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-3xl mb-8 min-h-[400px]">
                    {synergyScore !== null ? (
                      <>
                        <div
                          className={`text-9xl font-bold ${getScoreColor()} mb-8`}
                        >
                          {synergyScore}%
                        </div>
                        <div className="text-4xl font-semibold text-gray-700 dark:text-gray-300 mb-10">
                          {getSynergyType()}
                        </div>
                        <div className="text-xl text-gray-500 dark:text-gray-400">
                          at a confidence level of 65%
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-3xl font-normal text-gray-500 dark:text-gray-400 mb-4">
                          Calculate synergy score to see results
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Save Prediction UI */}
                    {showSaveOptions ? (
                      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                          Save Prediction
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Prediction Name (Optional)
                            </label>
                            <input
                              type="text"
                              value={predictionName}
                              onChange={(e) =>
                                setPredictionName(e.target.value)
                              }
                              placeholder={`Or use default: PRED_${predictionCounter}`}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="primary"
                              className="flex-1 py-3"
                              onClick={() =>
                                savePredictionWithName(
                                  predictionName || undefined
                                )
                              }
                              disabled={isSaving}
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              variant="secondary"
                              className="flex-1 py-3"
                              onClick={cancelSave}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <Button
                            variant="primary"
                            className="w-full py-5 text-lg font-semibold"
                            onClick={calculateSynergyScore}
                            disabled={
                              isCalculating || !validateConcentrations()
                            }
                          >
                            {isCalculating
                              ? "Calculating..."
                              : "Generate Score"}
                          </Button>
                          <Button
                            variant="secondary"
                            className="w-full py-5 text-lg font-semibold"
                            onClick={generateReport}
                            disabled={!synergyScore}
                          >
                            Generate Report
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <Button
                            variant="secondary"
                            className="w-full py-5 text-lg font-semibold"
                            onClick={handleSavePrediction}
                            disabled={!synergyScore}
                          >
                            Save Prediction
                          </Button>
                          <div className="h-14"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </InvertedThemeProvider>
          </div>
        </div>
      </div>
    </main>
  );
}
