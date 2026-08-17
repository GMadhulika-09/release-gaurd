import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { showSuccess, showError } from "@/utils/toast";
import demoScenarios, { DemoScenario } from "@/data/demoScenarios";
import CodeInputCard from "@/components/CodeInputCard";
import AnalysisResultsCard from "@/components/AnalysisResultsCard";
import FindingsCard from "@/components/FindingsCard";
import RecommendedTestsCard from "@/components/RecommendedTestsCard";
import ReleaseDecisionCard from "@/components/ReleaseDecisionCard";
import UploadSection from "@/components/UploadSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// File type detection
function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    'py': 'Python',
    'java': 'Java',
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'c': 'C',
    'cpp': 'C++',
    'cc': 'C++',
    'cxx': 'C++',
    'cs': 'C#',
    'go': 'Go',
    'php': 'PHP',
    'rb': 'Ruby',
    'html': 'HTML',
    'css': 'CSS',
    'sql': 'SQL'
  };
  return typeMap[ext] || 'Unknown';
}

function getFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function detectLanguage(filename: string): string {
  return getFileType(filename);
}

interface UploadedFile {
  name: string;
  type: string;
  size: string;
  language: string;
  status: 'ready' | 'error' | 'processing';
  error?: string;
}

interface ZipInfo {
  name: string;
  size: string;
  totalFiles: number;
  codeFiles: number;
  testFiles: number;
  configFiles: number;
  languages: string[];
}

const Analyze = () => {
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(demoScenarios[0]);
  const [analysisResult, setAnalysisResult] = useState<DemoScenario | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [zipInfo, setZipInfo] = useState<ZipInfo | null>(null);
  const [previousRelease, setPreviousRelease] = useState<UploadedFile | ZipInfo | null>(null);
  const [currentRelease, setCurrentRelease] = useState<UploadedFile | ZipInfo | null>(null);
  const [compareStatus, setCompareStatus] = useState<{message: string, type: 'success'} | null>(null);

  useEffect(() => {
    setCode(selectedScenario.code);
    setLanguage(selectedScenario.language);
  }, [selectedScenario]);

  // Handle file selection
  const handleFileSelect = async (files: File[]) => {
    const filePromises = files.map(file => {
      return new Promise<UploadedFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const name = file.name;
          const type = getFileType(name);
          const size = getFileSize(file.size);
          const language = detectLanguage(name);
          resolve({ name, type, size, language, status: 'ready' });
        };
        reader.onerror = () => {
          resolve({ name: file.name, type: getFileType(file.name), size: 'Unknown', language: 'Unknown', status: 'error', error: 'Failed to read file' });
        };
        reader.readAsDataURL(file);
      });
    });
    const results = await Promise.all(filePromises);
    setUploadedFiles(prev => [...prev, ...results]);
  };

  // Handle ZIP file
  const handleZipSelect = async (file: File) => {
    return new Promise<ZipInfo | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const name = file.name.replace('.zip', '');
        const size = getFileSize(file.size);
        const mockZipInfo: ZipInfo = {
          name,
          size,
          totalFiles: Math.floor(Math.random() * 50) + 10,
          codeFiles: Math.floor(Math.random() * 40) + 5,
          testFiles: Math.floor(Math.random() * 15) + 2,
          configFiles: Math.floor(Math.random() * 10) + 1,
          languages: ['Python', 'JavaScript', 'HTML']
        };
        resolve(mockZipInfo);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsArrayBuffer(file);
    });
  };

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
            { type: "Unit Test", description: "Test core functionality with various inputs" },
            { type: "Integration Test", description: "Test interaction with dependent systems" }
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
    setUploadedFiles([]);
    setZipInfo(null);
  };

  const getReleaseLabel = (item: UploadedFile | ZipInfo) => {
    return `${item.name} (${item.size})`;
  };

  const getReleaseOptions = () => {
    const options: {label: string, value: UploadedFile | ZipInfo}[] = [];
    uploadedFiles.forEach((file, index) => {
      options.push({
        label: `${file.name} (${file.size})`,
        value: file
      });
    });
    if (zipInfo) {
      options.push({
        label: `${zipInfo.name} (${zipInfo.size})`,
        value: zipInfo
      });
    }
    return options;
  };

  const handleCompare = () => {
    if (!previousRelease && !currentRelease) {
      showError("Please select both a Previous Release and a Current Release");
      setCompareStatus(null);
    } else if (!previousRelease) {
      showError("Please select a Previous Release");
      setCompareStatus(null);
    } else if (!currentRelease) {
      showError("Please select a Current Release");
      setCompareStatus(null);
    } else {
      setCompareStatus({
        message: "Ready to compare",
        type: 'success'
      });
    }
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
          {/* Upload Section */}
          <UploadSection onFileSelect={handleFileSelect} onZipSelect={handleZipSelect} />

          {/* Previous Release Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-muted-foreground mb-4">Previous Release</h3>
            <Select 
              value={previousRelease ? getReleaseLabel(previousRelease) : null}
              onValueChange={(value) => {
                const option = getReleaseOptions().find(opt => opt.label === value);
                if (option) {
                  setPreviousRelease(option.value);
                }
              }}
              className="w-full mb-4"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a release" />
              </SelectTrigger>
              <SelectContent>
                {getReleaseOptions().map((option) => (
                  <SelectItem 
                    key={option.label} 
                    value={option.label}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Release Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-muted-foreground mb-4">Current Release</h3>
            <Select 
              value={currentRelease ? getReleaseLabel(currentRelease) : null}
              onValueChange={(value) => {
                const option = getReleaseOptions().find(opt => opt.label === value);
                if (option) {
                  setCurrentRelease(option.value);
                }
              }}
              className="w-full mb-4"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a release" />
              </SelectTrigger>
              <SelectContent>
                {getReleaseOptions().map((option) => (
                  <SelectItem 
                    key={option.label} 
                    value={option.label}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compare Button and Status */}
          <div className="flex flex-col items-center">
            <Button 
              onClick={handleCompare}
              className="w-full max-w-xs"
            >
              Compare Releases
            </Button>
            {compareStatus && compareStatus.type === 'success' && (
              <div className="mt-4 text-center">
                <p className="text-success">{compareStatus.message}</p>
                <div className="mt-2 text-sm space-y-1">
                  <div>Previous: {getReleaseLabel(previousRelease!)}</div>
                  <div>Current: {getReleaseLabel(currentRelease!)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;