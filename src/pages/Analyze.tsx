import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import demoScenarios, { DemoScenario } from "@/data/demoScenarios";
import CodeInputCard from "@/components/CodeInputCard";
import AnalysisResultsCard from "@/components/AnalysisResultsCard";
import FindingsCard from "@/components/FindingsCard";
import RecommendedTestsCard from "@/components/RecommendedTestsCard";
import ReleaseDecisionCard from "@/components/ReleaseDecisionCard";
import UploadSection from "@/components/UploadSection";
import FileComparison from "@/components/FileComparison";
import PreviousAnalysisContext from "@/components/PreviousAnalysisContext";
import NoPreviousAnalysis from "@/components/NoPreviousAnalysis";
import {
  compareReleases,
  extractZipInfo,
  readFileContent,
  type ComparisonResult,
  type ReleaseData,
  type ReleaseFile,
} from "@/utils/fileComparison";
import { saveAnalysis, getAnalysisByReleaseName } from "@/utils/analysisStorage";
import { saveComparisonToHistory } from "@/utils/comparisonHistory";
import { 
  FileCode, 
  File, 
  Layers, 
  Clock, 
  ArrowRight,
  CheckCircle
} from "lucide-react";

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
    'ql': 'SQL'
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
  status: 'eady' | 'error' | 'processing';
  error?: string;
  file?: File;
}

interface ZipInfo {
  name: string;
  size: string;
  totalFiles: number;
  codeFiles: number;
  testFiles: number;
  configFiles: number;
  languages: string[];
  file?: File;
}

const Analyze = () => {
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(demoScenarios[0]);
  const [analysisResult, setAnalysisResult] = useState<DemoScenario | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [zipInfo, setZipInfo] = useState<ZipInfo | null>(null);
  const [previousRelease, setPreviousRelease] = useState<UploadedFile | ZipInfo | null>(null);
  const [currentRelease, setCurrentRelease] = useState<UploadedFile | ZipInfo | null>(null);
  const [compareStatus, setCompareStatus] = useState<{ message: string; type: 'success' } | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  // New state for previous analysis context
  const [previousAnalysis, setPreviousAnalysis] = useState<any>(null);

  // State for file analysis data
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [addedFiles, setAddedFiles] = useState<string[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);
  const [modifiedFiles, setModifiedFiles] = useState<string[]>([]);
  const [testFileCount, setTestFileCount] = useState(0);
  const [codeFileCount, setCodeFileCount] = useState(0);
  const [hasTestFiles, setHasTestFiles] = useState(false);

  useEffect(() => {
    setCode(selectedScenario.code);
    setLanguage(selectedScenario.language);
  }, [selectedScenario]);

  // Load previous analysis when previous release changes
  useEffect(() => {
    if (previousRelease) {
      const releaseName = previousRelease.name;
      const analysis = getAnalysisByReleaseName(releaseName);
      setPreviousAnalysis(analysis);
    } else {
      setPreviousAnalysis(null);
    }
  }, [previousRelease]);

  // Update file analysis data when comparison result changes
  useEffect(() => {
    if (comparisonResult) {
      const added = comparisonResult.changes.filter(c => c.status === 'Added').map(c => c.fileName);
      const deleted = comparisonResult.changes.filter(c => c.status === 'Deleted').map(c => c.fileName);
      const modified = comparisonResult.changes.filter(c => c.status === 'Modified').map(c => c.fileName);
      const allChanged = [...added, ...deleted, ...modified];
      const tests = allChanged.filter(f => /test|spec/i.test(f));
      const code = allChanged.filter(f => !/test|spec/i.test(f));
      
      setChangedFiles(allChanged);
      setAddedFiles(added);
      setDeletedFiles(deleted);
      setModifiedFiles(modified);
      setTestFileCount(tests.length);
      setCodeFileCount(code.length);
      setHasTestFiles(tests.length > 0);
    } else {
      setChangedFiles([]);
      setAddedFiles([]);
      setDeletedFiles([]);
      setModifiedFiles([]);
      setTestFileCount(0);
      setCodeFileCount(0);
      setHasTestFiles(false);
    }
  }, [comparisonResult]);

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
          resolve({ name, type, size, language, status: 'eady', file });
        };
        reader.onerror = () => {
          resolve({ name: file.name, type: getFileType(file.name), size: 'Unknown', language: 'Unknown', status: 'error', error: 'Failed to read file', file });
        };
        reader.readAsDataURL(file.size > 0? file : new Blob());
      });
    });
    const results = await Promise.all(filePromises);
    setUploadedFiles(prev => [...prev,...results]);
  };

  // Handle ZIP file
  const handleZipSelect = async (file: File) => {
    try {
      const result = await extractZipInfo(file);
      const info: ZipInfo = {
        name: file.name.replace(/\.zip$/i, ''),
        size: getFileSize(file.size),
        totalFiles: result.totalFiles,
        codeFiles: result.codeFiles,
        testFiles: result.testFiles,
        configFiles: result.configFiles,
        languages: result.languages,
        file,
      };
      setZipInfo(info);
      showSuccess(`ZIP file loaded: ${file.name}`);
    } catch (error) {
      showError("Failed to read ZIP file. Please ensure it's a valid ZIP archive.");
    }
  };

  const handleAnalyze = () => {
    if (!code.trim()) {
      showError("Please enter some code to analyze");
      return;
    }
    setIsAnalyzing(true)
    setTimeout(() => {
      const matchedScenario = demoScenarios.find(s => s.id === selectedScenario.id);
      if (matchedScenario) {
        setAnalysisResult(matchedScenario);
        // Save analysis if a release is selected
        const releaseName = currentRelease?.name || previousRelease?.name;
        if (releaseName) {
          saveAnalysis({
            releaseName,
            riskScore: matchedScenario.riskScore,
            riskLevel: matchedScenario.riskLevel,
            findingsCount: matchedScenario.findings.length,
            recommendedTestsCount: matchedScenario.recommendedTests.length,
            releaseDecision: matchedScenario.releaseDecision,
          });
        }
        showSuccess("Analysis complete!");
      } else {
        const complexity = Math.min(90, Math.max(10, code.length / 10));
        const impact = Math.min(90, Math.max(20, code.includes("payment") || code.includes("auth")? 70 : 40));
        const reachability = Math.min(90, Math.max(20, code.includes("public") || code.includes("export")? 80 : 30));
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
              severity: riskLevel === "LOW"? "LOW" : riskLevel === "MEDIUM"? "MEDIUM" : "HIGH",
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
        // Save analysis if a release is selected
        const releaseName = currentRelease?.name || previousRelease?.name;
        if (releaseName) {
          saveAnalysis({
            releaseName,
            riskScore: genericResult.riskScore,
            riskLevel: genericResult.riskLevel,
            findingsCount: genericResult.findings.length,
            recommendedTestsCount: genericResult.recommendedTests.length,
            releaseDecision: genericResult.releaseDecision,
          });
        }
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
    setPreviousRelease(null);
    setCurrentRelease(null);
    setCompareStatus(null);
    setComparisonResult(null);
    setAnalysisResult(null);
    setPreviousAnalysis(null);
    setChangedFiles([]);
    setAddedFiles([]);
    setDeletedFiles([]);
    setModifiedFiles([]);
    setTestFileCount(0);
    setCodeFileCount(0);
    setHasTestFiles(false);
  };

  const getReleaseLabel = (item: UploadedFile | ZipInfo) => {
    return `${item.name} (${item.size})`;
  };

  const getReleaseOptions = () => {
    const options: { label: string; value: UploadedFile | ZipInfo }[] = [];
    uploadedFiles.forEach((file) => {
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

  const extractReleaseData = async (
    release: UploadedFile | ZipInfo
  ): Promise<ReleaseData> => {
    const files = new Map<string, ReleaseFile>();

    if ('totalFiles' in release) {
      // It's a ZipInfo
      if (release.file) {
        const result = await extractZipInfo(release.file);
        return { name: release.name, files: result.files };
      }
      files.set(release.name, { name: release.name, content: '', size: 0 });
      return { name: release.name, files };
    } else {
      // It's an UploadedFile
      if (release.file) {
        const fileData = await readFileContent(release.file);
        files.set(fileData.name, fileData);
      } else {
        files.set(release.name, { name: release.name, content: '', size: 0 });
      }
      return { name: release.name, files };
    }
  };

  const handleCompare = async () => {
    if (!previousRelease || !currentRelease) {
      showError("Please select both a Previous Release and a Current Release");
      setCompareStatus(null);
      setComparisonResult(null);
      return;
    }

    setIsComparing(true);
    try {
      const prevData = await extractReleaseData(previousRelease);
      const currData = await extractReleaseData(currentRelease);
      const result = compareReleases(prevData, currData);
      setComparisonResult(result);
      setCompareStatus({
        message: "Comparison complete",
        type: 'success'
      });
    } catch (error) {
      showError("Failed to compare releases");
      setComparisonResult(null);
    } finally {
      setIsComparing(false);
    }
  };

  const handleSaveComparisonToHistory = () => {
    if (!comparisonResult || !previousRelease || !currentRelease) {
      showError("No comparison to save");
      return;
    }

    // Calculate risk scores for the comparison
    const addedFiles = comparisonResult.changes.filter(c => c.status === 'Added');
    const deletedFiles = comparisonResult.changes.filter(c => c.status === 'Deleted');
    const highRiskKeywords = ['auth', 'payment', 'security', 'admin', 'config'];

    const getFileRisk = (fileName: string) => {
      const base = 2;
      const isHighRisk = highRiskKeywords.some(keyword => 
        fileName.toLowerCase().includes(keyword));
      const typeAdj = isHighRisk ? 5 : 0;
      return base + typeAdj;
    };

    const riskFromAdded = addedFiles.reduce((sum, file) => sum + getFileRisk(file.fileName), 0);
    const riskFromDeleted = deletedFiles.reduce((sum, file) => sum + getFileRisk(file.fileName), 0);
    let riskChange = riskFromAdded - riskFromDeleted;
    riskChange = Math.max(-50, Math.min(50, riskChange));

    const previousRisk = 50 - riskChange / 2;
    const currentRisk = 50 + riskChange / 2;
    const clampedCurrentRisk = Math.max(0, Math.min(100, currentRisk));

    const getReleaseStatus = (score: number) => {
      if (score <= 30) return 'SAFE TO RELEASE';
      if (score <= 70) return 'REVIEW RECOMMENDED';
      if (score <= 85) return 'REVIEW REQUIRED';
      return 'HIGH RISK — RELEASE BLOCKED';
    };

    const entry = {
      previousReleaseName: previousRelease.name,
      currentReleaseName: currentRelease.name,
      previousRiskScore: Math.round(previousRisk),
      currentRiskScore: Math.round(clampedCurrentRisk),
      riskChange: Math.round(riskChange),
      filesAdded: comparisonResult.summary.added,
      filesModified: comparisonResult.summary.modified,
      filesDeleted: comparisonResult.summary.deleted,
      releaseStatus: getReleaseStatus(clampedCurrentRisk),
    };

    if (saveComparisonToHistory(entry)) {
      showSuccess("Comparison saved to history");
    } else {
      showError("Failed to save comparison to history");
    }
  };

  return (
    <div className="space-y-8 pb-20">
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
        <div className="flex-1 lg:w-1/2 space-y-6">
          {/* Upload Section */}
          <UploadSection onFileSelect={handleFileSelect} onZipSelect={handleZipSelect} />

          {/* Previous Analysis Context */}
          <div>
            {previousAnalysis ? (
              <PreviousAnalysisContext
                riskScore={previousAnalysis.riskScore}
                riskLevel={previousAnalysis.riskLevel}
                findingsCount={previousAnalysis.findingsCount}
                recommendedTestsCount={previousAnalysis.recommendedTestsCount}
                releaseDecision={previousAnalysis.releaseDecision}
              />
            ) : (
              <NoPreviousAnalysis />
            )}
          </div>

          {/* Release Selection Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Previous Release Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-muted to-muted/50 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative h-full border-2 border-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Previous Release</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <File className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {previousRelease? getReleaseLabel(previousRelease) : "No release selected"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {previousRelease? `${previousRelease.totalFiles || 0} files • ${previousRelease.size}` : "Select a file to view details"}
                        </p>
                      </div>
                    </div>
                    <Select
                      value={previousRelease? getReleaseLabel(previousRelease) : undefined}
                      onValueChange={(value) => {
                        const option = getReleaseOptions().find(opt => opt.label === value);
                        if (option) {
                          setPreviousRelease(option.value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-muted/30">
                        <SelectValue placeholder="Select previous release" />
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
                  </CardContent>
                </Card>
              </div>

              {/* Current Release Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative h-full border-2 border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2 text-primary">
                      <Layers className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Current Release</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileCode className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {currentRelease? getReleaseLabel(currentRelease) : "No release selected"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentRelease? `${currentRelease.totalFiles || 0} files • ${currentRelease.size}` : "Select a file to view details"}
                        </p>
                      </div>
                    </div>
                    <Select
                      value={currentRelease? getReleaseLabel(currentRelease) : undefined}
                      onValueChange={(value) => {
                        const option = getReleaseOptions().find(opt => opt.label === value);
                        if (option) {
                          setCurrentRelease(option.value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-muted/30">
                        <SelectValue placeholder="Select current release" />
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
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex flex-col items-center pt-4">
              <Button
                onClick={handleCompare}
                className="w-full max-w-md py-6 text-lg shadow-lg shadow-primary/20 group"
                disabled={isComparing || !previousRelease || !currentRelease}
              >
                {isComparing? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">◌</span> Comparing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Compare Releases <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
              {compareStatus && compareStatus.type === 'success' && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-emerald-600 font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Comparison complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnalysisResultsCard 
            result={analysisResult} 
            onSaveToHistory={saveToHistory}
            changedFiles={changedFiles}
            addedFiles={addedFiles}
            deletedFiles={deletedFiles}
            modifiedFiles={modifiedFiles}
            testFileCount={testFileCount}
            codeFileCount={codeFileCount}
            hasTestFiles={hasTestFiles}
          />
          <ReleaseDecisionCard result={analysisResult} />
          <FindingsCard findings={analysisResult.findings} />
          <div className="md:col-span-2 lg:col-span-3">
            <RecommendedTestsCard tests={analysisResult.recommendedTests} />
          </div>
        </div>
      )}

      {/* File Comparison Results */}
      {comparisonResult && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FileComparison result={comparisonResult} />
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleSaveComparisonToHistory}
              variant="default"
              className="px-6 py-3"
            >
              Save Comparison to History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyze;