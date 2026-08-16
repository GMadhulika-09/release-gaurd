import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { showSuccess, showError } from "@/utils/toast";
import demoScenarios, { DemoScenario } from "@/data/demoScenarios";
import CodeInputCard from "@/components/CodeInputCard";
import AnalysisResultsCard from "@/components/AnalysisResultsCard";
import FindingsCard from "@/components/FindingsCard";
import RecommendedTestsCard from "@/components/RecommendedTestsCard";
import ReleaseDecisionCard from "@/components/ReleaseDecisionCard";

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
  const [previousRelease, setPreviousRelease] = useState<DemoScenario | null>(null);

  useEffect(() => {
    setCode(selectedScenario.code);
    setLanguage(selectedScenario.language);
  }, [selectedScenario]);

  // Handle file selection
  const handleFileSelect = (files: File[]) => {
    setUploadedFiles(
      files.map(file => {
        const reader = new FileReader();
        return new Promise<UploadedFile>((resolve) => {
          reader.onload = (e) => {
            const name = file.name;
            const type = getFileType(name);
            const size = getFileSize(file.size);
            const language = detectLanguage(name);
            
            resolve({
              name,
              type,
              size,
              language,
              status: 'ready'
            });
          };
          reader.onerror = () => {
            resolve({
              name: file.name,
              type: getFileType(file.name),
              size: 'Unknown',
              language: 'Unknown',
              status: 'error',
              error: 'Failed to read file'
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
  };

  // Handle ZIP file
  const handleZipSelect = (file: File) => {
    const reader = new FileReader();
    return new Promise<ZipInfo>((resolve) => {
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // Simple ZIP inspection - just get basic info
        // In a real app, we'd parse the ZIP structure
        const name = file.name.replace('.zip', '');
        const size = getFileSize(file.size);
        
        // For prototype, create mock structure
        const mockZipInfo: ZipInfo = {
          name,
          size,
          totalFiles: Math.floor(Math.random() * 50) + 10,
          codeFiles: Math.floor(Math.random() * 40) + 5,
          testFiles: Math.floor(Math.random() * 15) + 2,
          configFiles: Math.floor(Math.random() * 10) + 1,
          languages: ['Python', 'JavaScript', 'HTML'] // Mock detection
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
        // Generic analysis logic
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
    setUploadedFiles([]);
    setZipInfo(null);
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
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold text-muted-foreground mb-4">1. Upload</h2>
            
            <div className="space-y-4">
              {/* Individual Files */}
              {uploadedFiles.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Uploaded Files</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="p-3 bg-muted rounded">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{file.type}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm mt-1">
                          <span>{file.size}</span>
                          <span>{file.language}</span>
                          <span className="text-success">{file.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or browse files here
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="text-xs mt-2"
                  >
                    Browse Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileSelect(Array.from(e.target.files));
                      }
                    }}
                  />
                </div>
              )}

              {/* ZIP File */}
              {zipInfo ? (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Project Upload</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Project:</strong> {zipInfo.name}</p>
                      <p><strong>Size:</strong> {zipInfo.size}</p>
                      <p><strong>Files:</strong> {zipInfo.totalFiles}</p>
                      <p><strong>Code files:</strong> {zipInfo.codeFiles}</p>
                      <p><strong>Test files:</strong> {zipInfo.testFiles}</p>
                      <p><strong>Config files:</strong> {zipInfo.configFiles}</p>
                    </div>
                    <div>
                      <p><strong>Languages:</strong></p>
                      {zipInfo.languages.map((lang, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <span className="w-3 h-3 rounded bg-primary"></span>
                          <span>{lang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setZipInfo(null)}
                    className="mt-2 text-xs"
                  >
                    Remove ZIP
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop ZIP file here or browse
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('zip-upload')?.click()}
                    className="text-xs"
                  >
                    Browse ZIP
                  </Button>
                  <input
                    id="zip-upload"
                    type="file"
                    accept=".zip"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleZipSelect(e.target.files[0]).then(zipInfo => {
                          if (zipInfo) {
                            setZipInfo(zipInfo);
                          }
                        });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
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