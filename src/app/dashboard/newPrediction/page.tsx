"use client";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ui/ThemeToggle";
import { useNavbar } from "@/app/contexts/NavbarContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InvertedThemeProvider } from "@/app/contexts/InvertedTabContext";

const INITIAL_DRUG_OPTIONS: string[] = [];
const INITIAL_CELL_LINE_DATA = {};

export default function NewPredictionPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { theme } = useTheme();
  const { setPageTitle } = useNavbar();

  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");
  const [drug1Concentration, setDrug1Concentration] = useState("");
  const [drug2Concentration, setDrug2Concentration] = useState("");
  const [cellLineType, setCellLineType] = useState("");
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
  const [savedPredictions, setSavedPredictions] = useState<
    Array<{
      id: string;
      name: string;
      drugs: string;
      concentrationA: number;
      concentrationB: number;
      cellLine: string;
      score: number;
      confidence: number;
      date: string;
    }>
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Move validateConcentrations to the top
  const validateConcentrations = () => {
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
  };

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
      const data = await response.json();

      if (data.success) {
        setAvailableDrugs(data.drugs);
      }
    } catch (error) {
      console.error("Error loading drug data:", error);
      setErrorMessage("Failed to load drug data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (drug1) {
      loadAvailableDrug2Options(drug1);
    } else {
      setAvailableDrug2([]);
      setDrug2("");
    }
  }, [drug1]);

  useEffect(() => {
    if (drug1 && drug2) {
      loadAvailableCellLines(drug1, drug2);
    } else {
      setAvailableCellLines([]);
      setCellLine("");
      setCellLineType("");
    }
  }, [drug1, drug2]);

  useEffect(() => {
    if (drug1 && drug2 && cellLine) {
      loadConcentrationRanges(drug1, drug2, cellLine);
    } else {
      setConcentrationRanges(null);
      setDrug1Concentration("");
      setDrug2Concentration("");
    }
  }, [drug1, drug2, cellLine]);

  const loadAvailableDrug2Options = async (selectedDrug1: string) => {
    try {
      const response = await fetch(
        `/api/drugs/available-pairs?drug1=${encodeURIComponent(selectedDrug1)}`
      );
      const data = await response.json();

      if (data.success) {
        setAvailableDrug2(data.drugs);
        if (drug2 && !data.drugs.includes(drug2)) {
          setDrug2("");
        }
      }
    } catch (error) {
      console.error("Error loading drug2 options:", error);
      setErrorMessage("Failed to load compatible drugs");
    }
  };

  const loadAvailableCellLines = async (
    selectedDrug1: string,
    selectedDrug2: string
  ) => {
    try {
      const response = await fetch(
        `/api/cell-lines/available?drug1=${encodeURIComponent(
          selectedDrug1
        )}&drug2=${encodeURIComponent(selectedDrug2)}`
      );
      const data = await response.json();

      if (data.success) {
        setAvailableCellLines(data.cellLines);
        if (
          cellLine &&
          !data.cellLines.find((cl: any) => cl.value === cellLine)
        ) {
          setCellLine("");
          setCellLineType("");
        }
      }
    } catch (error) {
      console.error("Error loading cell lines:", error);
      setErrorMessage("Failed to load cell lines");
    }
  };

  const loadConcentrationRanges = async (
    selectedDrug1: string,
    selectedDrug2: string,
    selectedCellLine: string
  ) => {
    try {
      const response = await fetch(
        `/api/concentration-ranges?drug1=${encodeURIComponent(
          selectedDrug1
        )}&drug2=${encodeURIComponent(
          selectedDrug2
        )}&cellLine=${encodeURIComponent(selectedCellLine)}`
      );
      const data = await response.json();

      if (data.success) {
        setConcentrationRanges(data.ranges);
      }
    } catch (error) {
      console.error("Error loading concentration ranges:", error);
      setErrorMessage("Failed to load concentration ranges");
    }
  };

  const filteredDrugs1 = availableDrugs.filter((drug) =>
    drug.toLowerCase().includes(drug1.toLowerCase())
  );

  const filteredDrugs2 = availableDrug2.filter((drug) =>
    drug.toLowerCase().includes(drug2.toLowerCase())
  );

  const handleDrug1Select = (selectedDrug: string) => {
    setDrug1(selectedDrug);
    setShowDrug1Dropdown(false);
  };

  const handleDrug2Select = (selectedDrug: string) => {
    setDrug2(selectedDrug);
    setShowDrug2Dropdown(false);
  };

  const handleCellLineTypeChange = (type: string) => {
    setCellLineType(type);
    setCellLine("");
  };

  const calculateSynergyScore = async () => {
    if (!validateConcentrations()) {
      setErrorMessage("Please enter valid concentrations first");
      return;
    }

    setIsCalculating(true);
    setErrorMessage(null);

    setTimeout(() => {
      const score = 87;
      setSynergyScore(score);
      setIsCalculating(false);
    }, 2000);
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

      const response = await fetch("/api/predictions/save", {
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

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        // Try to get error message from response, fallback to status text
        let errorMessage = response.statusText || "Failed to save prediction";

        try {
          // Only try to parse as JSON if there's content
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            // If not JSON, get text instead
            const text = await response.text();
            if (text) errorMessage = text;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          // If JSON parsing fails, use the original error message
        }

        throw new Error(errorMessage);
      }

      // Now safely parse the successful response
      const data = await response.json();

      // Update local state
      if (!customName) {
        setPredictionCounter((prev) => prev + 1);
        localStorage.setItem(
          "predictionCounter",
          (predictionCounter + 1).toString()
        );
      }

      // After successful response
      const newPrediction = {
        id: data.prediction.id,
        name: data.prediction.name,
        drugs: data.prediction.drugs, // This should now be available
        concentrationA: data.prediction.concentrationA,
        concentrationB: data.prediction.concentrationB,
        cellLine: data.prediction.cellLine,
        score: data.prediction.synergyScore, // Note: using synergyScore from API
        confidence: data.prediction.confidence,
        date: data.prediction.date,
      };

      setSavedPredictions((prev) => [...prev, newPrediction]);
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
          {/* Left Card - Keep exactly as is */}
          <div>
            <Card
              title="Make New Prediction"
              minHeight="700px"
              className="shadow-lg"
            >
              <div className="space-y-8">
                {/* Drug 1 - Stacked vertically */}
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

                {/* Drug 2 - Stacked vertically */}
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

                <div>
                  <label className="block text-base font-semibold mb-3">
                    Cell Line
                  </label>
                  <select
                    value={cellLine}
                    onChange={(e) => setCellLine(e.target.value)}
                    disabled={
                      !drug1 || !drug2 || availableCellLines.length === 0
                    }
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    <option value="">
                      {!drug1 || !drug2
                        ? "Select both drugs first"
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
                  {drug1 && drug2 && availableCellLines.length === 0 && (
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
