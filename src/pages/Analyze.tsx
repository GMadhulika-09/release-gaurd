import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { showSuccess, showError } from "@/utils/toast";
import demoScenarios, { DemoScenario } from "@/data/demoScenarios";
import CodeInputCard from "@/components/CodeInputCard";
import AnalysisResultsCard from "@/components/AnalysisResultsCard";
import FindingsCard from "@/components/FindingsCard";
import RecommendedTestsCard from "@/components/RecommendedTestsCard";
import ReleaseDecisionCard from "@/components/ReleaseDecisionCard";
import FileUploader from "@/components/FileUploader";
import { 
  processFiles, 
  ProcessedFileInfo, 
  ComparisonResult,
  compareReleases
} from "@/utils/fileInspection";

const Analyze = () => {
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(demoScenarios[0]);
  const [analysisResult, setAnalysisResult] = useState<DemoScenario | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previousRelease, setPreviousRelease] = useState<ProcessedFileInfo | null>(null);
  const [currentRelease, setCurrentRelease] = useState<ProcessedFileInfo | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCode(selectedScenario.code);
    setLanguage(selectedScenario.language);
  }, [selectedScenario]);

  const handleAnalyze = () => {
    // Determine what code to analyze: uploaded current release or manual input
    let analyzeCode = code;
    let analyzeLanguage = language;
    
    if (currentRelease && currentRelease.content) {
      analyzeCode = currentRelease.content;
      // Try to detect language from the content if available
      if (currentRelease.language !== 'ZIP Archive' && currentRelease.language !== 'Unknown / Unsupported') {
        analyzeLanguage = currentRelease.language;
      }
    }

    if (!analyzeCode.trim()) {
      showError("Please enter some code to analyze or upload a file");
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const matchedScenario = demoScenarios.find(s => s.id === selectedScenario.id);

      if (matchedScenario) {
        setAnalysisResult(matchedScenario);
        showSuccess("Analysis complete!");
      } else {
        const complexity = Math.min(90, Math.max(10, analyzeCode.length / 10));
        const impact = Math.min(90, Math.max(20, analyzeCode.includes("payment") || analyzeCode.includes("auth") ? 70 : 40));
        const reachability = Math.min(90, Math.max(20, analyzeCode.includes("public") || analyzeCode.includes("export") ? 80 : 30));
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
          language: analyzeLanguage,
          code: analyzeCode,
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
              file: "main." + analyzeLanguage.toLowerCase(),
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

  const handlePreviousFiles = (files: ProcessedFileInfo[]) => {
    setPreviousRelease(files.length > 0 ? files[0] : null);
    // Update comparison when either release changes
    updateComparison();
  };

  const handleCurrentFiles = (files: ProcessedFileInfo[]) => {
    setCurrentRelease(files.length > 0 ? files[0] : null);
    // Update comparison when either release changes
    updateComparison();
  };

  const updateComparison = useCallback(async () => {
    setIsComparing(true);
    try {
      const result = compareReleases(previousRelease, currentRelease);
      setComparisonResult(result);
    } catch (error) {
      console.error('Error comparing releases:', error);
      showError('Failed to compare releases');
    } finally {
      setIsComparing(false);
    }
  }, [previousRelease, currentRelease]);

  const saveToHistory = () => {
    if (!analysisResult) return;

    const historyItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      name: analysisResult.name,
      description: analysisResult.description,
      language: analysisResult.language,
      riskScore: analysisResult.riskScore,
      riskLevel: analysisResult.riskLevel,
      releaseDecision: analysisResult.releaseDecision,
      // Add file upload info if available
      ...(currentRelease && {
        uploadName: currentRelease.name,
        uploadSize: currentRelease.size,
        uploadType: currentRelease.language,
        fileCount: currentRelease.zipMetadata?.totalFiles || 1,
        codeFileCount: currentRelease.zipMetadata?.codeFiles || 0,
        languagesDetected: currentRelease.zipMetadata?.languageBreakdown.map(l => l.language) || [analysisResult.language],
      }),
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
    setPreviousRelease(null);
    setCurrentRelease(null);
    setComparisonResult(null);
  };

  const handleDemoComparison = () => {
    // Create demo previous and current releases for demonstration
    const demoPrevious: ProcessedFileInfo = {
      name: "auth-v1.zip",
      type: "application/zip",
      size: 2457600, // 2.34 MB
      language: "ZIP Archive",
      status: "Project: 15 code files, 3 test files, 2 config files",
      content: "// Previous auth service\nfunction validateToken(token) {\n  return token.length > 10;\n}",
      isCode: false,
      isTest: false,
      isConfig: false,
      zipMetadata: {
        totalFiles: 20,
        codeFiles: 15,
        testFiles: 3,
        configFiles: 2,
        totalSize: 2457600,
        languageBreakdown: [
          { language: "JavaScript", percentage: 60 },
          { language: "HTML", percentage: 20 },
          { language: "CSS", percentage: 15 },
          { language: "JSON", percentage: 5 }
        ],
        largestCodeFile: { name: "auth.js", size: 1200 }
      }
    };

    const demoCurrent: ProcessedFileInfo = {
      name: "auth-v2.zip",
      type: "application/zip",
      size: 3145728, // 3 MB
      language: "ZIP Archive",
      status: "Project: 18 code files, 4 test files, 3 config files",
      content: "// Current auth service with 2FA\nfunction validateToken(token, code) {\n  if (!token || token.length < 10) return false;\n  if (!code || code.length < 6) return false;\n  return verifyCode(token, code);\n}\n\nfunction verifyCode(token, code) {\n  // Implementation...\n  return true;\n}",
      isCode: false,
      isTest: false,
      isConfig: false,
      zipMetadata: {
        totalFiles: 25,
        codeFiles: 18,
        testFiles: 4,
        configFiles: 3,
        totalSize: 3145728,
        languageBreakdown: [
          { language: "JavaScript", percentage: 55 },
          { language: "TypeScript", percentage: 25 },
          { language: "HTML", percentage: 10 },
          { language: "CSS", percentage: 5 },
          { language: "JSON", percentage: 5 }
        ],
        largestCodeFile: { name: "auth.ts", size: 1500 }
      }
    };

    setPreviousRelease(demoPrevious);
    setCurrentRelease(demoCurrent);
    // Trigger comparison update
    updateComparison();
    
    showSuccess("Demo comparison loaded!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1 lg:w-1/2">
          <div className="space-y-4">
            {/* File Upload Section */}
            <div className="space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <FileUploader
                    label="Upload Previous Release (Optional)"
                    onFilesProcessed={handlePreviousFiles}
                    accept=".zip,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.cs,.go,.php,.rb,.html,.css,.txt,.md,.pdf,.docx"
                  />
                </div>
                
                <div className="flex-1">
                  <FileUploader
                    label="Upload Current Release"
                    onFilesProcessed={handleCurrentFiles}
                    accept=".zip,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.cs,.go,.php,.rb,.html,.css,.txt,.md,.pdf,.docx"
                  />
                </div>
              </div>
              
              {/* Demo comparison button */}
              <div className="flex justify-end">
                <button 
                  onClick={handleDemoComparison}
                  variant="outline"
                  disabled={isComparing}
                  className="text-sm px-3 py-1.5"
                >
                  {isComparing? "Loading Demo..." : "Load Demo Comparison"}
                </button>
              </div>
            </div>
            
            {/* Comparison Results */}
            {comparisonResult && (
              <div className="space-y-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Search className="h-4 w-4" />
                      <h3>Release Comparison</h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Release Info */}
                    <div className="space-y-3">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="border rounded-lg p-3">
                          <h4 className="font-medium mb-2">Previous Release</h4>
                          {comparisonResult.hasPrevious ? (
                            <>
                              <p className="text-sm"><strong>Name:</strong> {previousRelease?.name || 'N/A'}</p>
                              <p className="text-sm"><strong>Size:</strong> {previousRelease ? formatFileSize(previousRelease.size) : 'N/A'}</p>
                              <p className="text-sm"><strong>Files:</strong> {previousRelease?.zipMetadata?.totalFiles || 0}</p>
                              <p className="text-sm"><strong>Language:</strong> {previousRelease?.language}</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                          )}
                        </div>
                        
                        <div className="border rounded-lg p-3">
                          <h4 className="font-medium mb-2">Current Release</h4>
                          {comparisonResult.hasCurrent ? (
                            <>
                              <p className="text-sm"><strong>Name:</strong> {currentRelease?.name || 'N/A'}</p>
                              <p className="text-sm"><strong>Size:</strong> {currentRelease ? formatFileSize(currentRelease.size) : 'N/A'}</p>
                              <p className="text-sm"><strong>Files:</strong> {currentRelease?.zipMetadata?.totalFiles || 0}</p>
                              <p className="text-sm"><strong>Language:</strong> {currentRelease?.language}</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Change Summary */}
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Release Change Summary</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-sm"><strong>Files Added:</strong> {comparisonResult.summary.filesAdded}</p>
                        </div>
                        <div>
                          <p className="text-sm"><strong>Files Modified:</strong> {comparisonResult.summary.filesModified}</p>
                        </div>
                        <div>
                          <p className="text-sm"><strong>Files Deleted:</strong> {comparisonResult.summary.filesDeleted}</p>
                        </div>
                        <div>
                          <p className="text-sm"><strong>Lines Added:</strong> {comparisonResult.summary.linesAdded}</p>
                        </div>
                        <div>
                          <p className="text-sm"><strong>Lines Removed:</strong> {comparisonResult.summary.linesRemoved}</p>
                        </div>
                        <div>
                          <p className="text-sm"><strong>New Languages:</strong> {comparisonResult.summary.newLanguages.join(', ') || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-sm"><strong>New Test Files:</strong> {comparisonResult.summary.newTestFiles}</p>
                        </div>
                        <div>
                          <p className="text-sm"><strong>New Config Changes:</strong> {comparisonResult.summary.newConfigChanges}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* File Changes Table */}
                    {comparisonResult.fileChanges.length > 0 && (
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium mb-2">File-Level Changes</h4>
                        <div class="overflow-x-auto">
                          <table className="min-w-full divide-y divide-muted-foreground">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">File</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Previous Size</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Current Size</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-muted-foreground">
                              {comparisonResult.fileChanges.map((change, index) => (
                                <tr key={index} className="hover:bg-muted/50">
                                  <td className="px-4 py-2 text-sm font-medium">{change.name}</td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className={cn(
                                      'px-2 py-0.5 text-xs rounded',
                                      change.status === 'Added' && 'bg-success/20 text-success',
                                      change.status === 'Modified' && 'bg-warning/20 text-warning',
                                      change.status === 'Deleted' && 'bg-destructive/20 text-destructive',
                                      change.status === 'Unchanged' && 'bg-muted/20 text-muted-foreground'
                                    )}>
                                      {change.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-muted-foreground">{formatFileSize(change.prevSize)}</td>
                                  <td className="px-4 py-2 text-sm text-muted-foreground">{formatFileSize(change.currSize)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
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