import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { showSuccess, showError } from "@/utils/toast";
import demoScenarios, { DemoScenario } from "@/data/demoScenarios";
import CodeInputCard from "@/components/CodeInputCard";
import AnalysisResultsCard from "@/components/AnalysisResultsCard";
import FindingsCard from "@/components/FindingsCard";
import RecommendedTestsCard from "@/components/RecommendedTestsCard";
import ReleaseDecisionCard from "@/components/ReleaseDecisionCard";

const Analyze = () => {
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(demoScenarios[0]);
  const [analysisResult, setAnalysisResult] = useState<DemoScenario | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCode(selectedScenario.code);
    setLanguage(selectedScenario.language);
  }, [selectedScenario]);

  const handleAnalyze = () => {
    if (!code.trim()) {
      showError("Please enter some code to analyze");
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const matchedScenario = demoScenarios.find(s => s.id === selectedScenario.id);

      if (matchedScenario) {
        setAnalysisResult(matchedScenario);
        showSuccess("Analysis complete!");
      } else {
        const complexity = Math.min(90, Math.max(10, code.length / 10));
        const impact = Math.min(90, Math.max(20, code.includes("payment") || code.includes("auth") ? 70 : 40));
        const reachability = Math.min(90, Math.max(20, code.includes("public") || code.includes("export") ? 80 : 30));
        const testCoverage = Math.min(90, Math.max(10, 100 - complexity));

        const overallScore = Math.round((complexity + impact + reachability + (100 - testCoverage)) / 4);

        let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
        if (overallScore >= 81) riskLevel = "CRITICAL";
        else if (overallScore >= 61) riskLevel = "HIGH";
        else if (overallScore >= 31) riskLevel = "MEDIUM";

        const releaseDecisionMap: Record<string, string> = {
          LOW: "SAFE TO RELEASE",
          MEDIUM: "REVIEW RECOMMENDED",
          HIGH: "REVIEW REQUIRED",
          CRITICAL: "HIGH RISK — RELEASE BLOCKED"
        };

        const genericResult: DemoScenario = {
          id: "generic",
          name: "Custom Analysis",
          description: "Analysis of your custom code",
          language,
          code,
          riskScore: overallScore,
          riskLevel,
          riskBreakdown: {
            complexity: Math.round(complexity),
            impact: Math.round(impact),
            reachability: Math.round(reachability),
            testCoverage: Math.round(testCoverage)
          },
          findings: [
            {
              id: 1,
              severity: riskLevel === "LOW" ? "LOW" : riskLevel === "MEDIUM" ? "MEDIUM" : "HIGH",
              file: "main." + language.toLowerCase(),
              problem: "Custom code analysis - review highlighted areas",
              whyItMatters: "Ensure changes align with intended functionality",
              potentialImpact: "Depends on specific implementation and context"
            }
          ],
          recommendedTests: [
            {
              type: "Unit Test",
              description: "Test core functionality with various inputs"
            },
            {
              type: "Integration Test",
              description: "Test interaction with dependent systems"
            }
          ],
          releaseDecision: releaseDecisionMap[riskLevel]
        };

        setAnalysisResult(genericResult);
        showSuccess("Analysis complete!");
      }

      setIsAnalyzing(false);
    }, 1500);
  };

  const saveToHistory = () => {
    if (!analysisResult) return;

    const historyItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...analysisResult
    };

    const history = JSON.parse(localStorage.getItem("releaseGuardHistory") || "[]");
    history.push(historyItem);
    localStorage.setItem("releaseGuardHistory", JSON.stringify(history));

    showSuccess("Analysis saved to history");
  };

  const handleReset = () => {
    const defaultScenario = demoScenarios[0];
    setSelectedScenario(defaultScenario);
    setCode(defaultScenario.code);
    setLanguage(defaultScenario.language);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1 lg:w-1/2">
          <CodeInputCard
            language={language}
            code={code}
            selectedScenario={selectedScenario}
            scenarios={demoScenarios}
            onLanguageChange={setLanguage}
            onCodeChange={setCode}
            onScenarioSelect={setSelectedScenario}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            isAnalyzing={isAnalyzing}
          />
        </div>

        <div className="flex-1 lg:w-1/2 space-y-4">
          {analysisResult && (
            <>
              <AnalysisResultsCard
                result={analysisResult}
                onSaveToHistory={saveToHistory}
              />
              <FindingsCard findings={analysisResult.findings} />
              <RecommendedTestsCard tests={analysisResult.recommendedTests} />
              <ReleaseDecisionCard result={analysisResult} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyze;