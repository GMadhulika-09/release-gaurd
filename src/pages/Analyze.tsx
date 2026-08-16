import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Button, 
  ButtonVariant 
} from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Textarea, 
  Label 
} from "@/components/ui/form";
import { 
  ChevronDown, 
  Code, 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

// Demo scenarios
const demoScenarios = [
  {
    id: "low",
    name: "Low Risk",
    description: "Small UI/text change",
    language: "JavaScript",
    code: "// Button text update\nconst Button = ({ children, onClick }) => {\n  return (\n    <button onClick={onClick} className=\"btn-primary\">\n      {children}\n    </button>\n  );\n};\n\n// Before: Submit\n// After: Save Changes",
    riskScore: 25,
    riskLevel: "LOW",
    riskBreakdown: {
      complexity: 20,
      impact: 30,
      reachability: 25,
      testCoverage: 25
    },
    findings: [
      {
        id: 1,
        severity: "LOW",
        file: "Button.js",
        problem: "Minor text change in button label",
        whyItMatters: "UI consistency - ensures users understand button action",
        potentialImpact: "Users might be confused if button text doesn't match action"
      }
    ],
    recommendedTests: [
      {
        type: "Unit Test",
        description: "Verify button renders with correct text and calls onClick handler"
      },
      {
        type: "Visual Regression Test",
        description: "Ensure button styling remains consistent across browsers"
      }
    ],
    releaseDecision: "SAFE TO RELEASE"
  },
  {
    id: "medium",
    name: "Medium Risk",
    description: "Authentication-related change",
    language: "TypeScript",
    code: "// Password reset token validation\ninterface ResetTokenPayload {\n  token: string;\n  expiresAt: Date;\n}\n\nexport const validateResetToken = async (\n  token: string,\n  payload: ResetTokenPayload\n): Promise<boolean> => {\n  // Check if token exists in database\n  const storedToken = await db.tokens.findUnique({\n    where: { token }\n  });\n  \n  if (!storedToken) {\n    return false;\n  }\n  \n  // Check expiration\n  const isExpired = new Date() > new Date(payload.expiresAt);\n  if (isExpired) {\n    // Delete expired token\n    await db.tokens.delete({ where: { token } });\n    return false;\n  }\n  \n  // Additional security: check token format\n  if (!/^[a-zA-Z0-9\-_]+$/.test(token)) {\n    return false;\n  }\n  \n  return true;\n};",
    riskScore: 55,
    riskLevel: "MEDIUM",
    riskBreakdown: {
      complexity: 50,
      impact: 70,
      reachability: 60,
      testCoverage: 40
    },
    findings: [
      {
        id: 1,
        severity: "MEDIUM",
        file: "auth.ts",
        problem: "Missing rate limiting on token validation endpoint",
        whyItMatters: "Could allow brute force attacks on reset tokens",
        potentialImpact: "Attackers could try many tokens to gain unauthorized access"
      },
      {
        id: 2,
        severity: "LOW",
        file: "auth.ts",
        problem: "No logging for failed token validations",
        whyItMatters: "Difficult to detect and investigate attack attempts",
        potentialImpact: "Security incidents might go unnoticed"
      }
    ],
    recommendedTests: [
      {
        type: "Unit Test",
        description: "Test token validation with valid, expired, and malformed tokens"
      },
      {
        type: "Integration Test",
        description: "Test full password reset flow with email service and database"
      },
      {
        type: "Security Test",
        description: "Attempt brute force attacks to verify rate limiting effectiveness"
      }
    ],
    releaseDecision: "REVIEW RECOMMENDED"
  },
  {
    id: "high",
    name: "High Risk",
    description: "Payment-processing change",
    language: "Java",
    code: "// Payment processing service\n@Service\npublic class PaymentService {\n  \n  @Autowired\n  private PaymentGateway gateway;\n  \n  @Autowired\n  private FraudDetectionService fraudService;\n  \n  public PaymentResponse processPayment(PaymentRequest request) {\n    // Step 1: Validate request\n    if (!validateRequest(request)) {\n      throw new InvalidRequestException(\"Invalid payment request\");\n    }\n    \n    // Step 2: Fraud check (NEW: added machine learning model)\n    FraudScore fraudScore = fraudService.analyzeWithMLModel(request);\n    \n    // Step 3: Check if fraud score exceeds threshold\n    if (fraudScore.getScore() > 0.8) {\n      logWarning(\"High fraud score detected: \" + fraudScore.getScore());\n      return PaymentResponse.declined(FraudDeclinedReason.HIGH_RISK);\n    }\n    \n    // Step 4: Process payment\n    try {\n      PaymentResponse response = gateway.charge(request.getAmount(), request.getCardToken());\n      \n      // Step 5: Record transaction\n      transactionRepository.save(new Transaction(request, response));\n      \n      return response;\n    } catch (GatewayException e) {\n      // Step 6: Handle gateway errors\n      logError(\"Payment gateway failed: \" + e.getMessage());\n      return PaymentResponse.declined(DeclinedReason.GATEWAY_ERROR);\n    }\n  }\n  \n  private boolean validateRequest(PaymentRequest request) {\n    return request != null && \n           request.getAmount() > 0 && \n           request.getCardToken() != null;\n  }\n}",
    riskScore: 85,
    riskLevel: "HIGH",
    riskBreakdown: {
      complexity: 80,
      impact: 95,
      reachability: 90,
      testCoverage: 30
    },
    findings: [
      {
        id: 1,
        severity: "HIGH",
        file: "PaymentService.java",
        problem: "New ML-based fraud detection lacks fallback to rule-based system",
        whyItMatters: "If ML model fails or returns unexpected values, payments could be incorrectly blocked or allowed",
        potentialImpact: "Revenue loss from false declines or fraud losses from false approvals"
      },
      {
        id: 2,
        severity: "MEDIUM",
        file: "PaymentService.java",
        problem: "No circuit breaker pattern for payment gateway calls",
        whyItMatters: "Gateway failures could cascade and exhaust application resources",
        potentialImpact: "System-wide outage during gateway issues"
      },
      {
        id: 3,
        severity: "LOW",
        file: "PaymentService.java",
        problem: "Missing idempotency key for payment requests",
        whyItMatters: "Network retries could cause duplicate charges",
        potentialImpact: "Customers being charged multiple times for same transaction"
      }
    ],
    recommendedTests: [
      {
        type: "Unit Test",
        description: "Test fraud score boundaries and edge cases (0.0, 0.8, 1.0)"
      },
      {
        type: "Integration Test",
        description: "Test end-to-end payment flow with mocked gateway and fraud service"
      },
      {
        type: "Chaos Test",
        description: "Simulate ML service failures and gateway timeouts"
      },
      {
        type: "Security Test",
        description: "Attempt adversarial attacks on ML fraud detection model"
      }
    ],
    releaseDecision: "REVIEW REQUIRED"
  }
];

const Analyze = () => {
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [selectedScenario, setSelectedScenario] = useState(demoScenarios[0]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Initialize with low risk scenario
  React.useEffect(() => {
    setCode(selectedScenario.code);
    setLanguage(selectedScenario.language);
  }, [selectedScenario]);

  const handleAnalyze = () => {
    if (!code.trim()) {
      showError("Please enter some code to analyze");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      // Find matching scenario or create generic analysis
      const matchedScenario = demoScenarios.find(s => s.id === selectedScenario.id);
      
      if (matchedScenario) {
        setAnalysisResult(matchedScenario);
        showSuccess("Analysis complete!");
      } else {
        // Generic analysis based on code length and keywords
        const complexity = Math.min(90, Math.max(10, code.length / 10));
        const impact = Math.min(90, Math.max(20, code.includes("payment") || code.includes("auth") ? 70 : 40));
        const reachability = Math.min(90, Math.max(20, code.includes("public") || code.includes("export") ? 80 : 30));
        const testCoverage = Math.min(90, Math.max(10, 100 - complexity));
        
        const overallScore = Math.round((complexity + impact + reachability + (100 - testCoverage)) / 4);
        
        let riskLevel = "LOW";
        if (overallScore >= 81) riskLevel = "CRITICAL";
        else if (overallScore >= 61) riskLevel = "HIGH";
        else if (overallScore >= 31) riskLevel = "MEDIUM";
        
        const releaseDecisionMap = {
          LOW: "SAFE TO RELEASE",
          MEDIUM: "REVIEW RECOMMENDED",
          HIGH: "REVIEW REQUIRED",
          CRITICAL: "HIGH RISK — RELEASE BLOCKED"
        };
        
        const genericResult = {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 lg:w-1/2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <h3>Analyze Code Change</h3>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="flex items-center space-x-2">
                  Programming Language
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
                </Label>
                <Select 
                  value={language} 
                  onValueChange={setLanguage} 
                  className="w-full"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Java">Java</SelectItem>
                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                    <SelectItem value="TypeScript">TypeScript</SelectItem>
                    <SelectItem value="C++">C++</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="Go">Go</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  Demo Scenarios
                </Label>
                <div className="flex flex-wrap gap-2">
                  {demoScenarios.map(scenario => (
                    <Button
                      key={scenario.id}
                      variant={selectedScenario.id === scenario.id ? "default" : "outline"}
                      onClick={() => {
                        setSelectedScenario(scenario);
                        setCode(scenario.code);
                        setLanguage(scenario.language);
                      }}
                      className="text-sm px-3 py-1.5"
                    >
                      {scenario.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  Code / Diff
                </Label>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code change or diff here..."
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-3">
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedScenario(demoScenarios[0]);
                  setCode(demoScenarios[0].code);
                  setLanguage(demoScenarios[0].language);
                }}
              >
                Reset to Demo
              </Button>
              <Button 
                onClick={handleAnalyze}
                isLoading={isAnalyzing}
                disabled={isAnalyzing || !code.trim()}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Release"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="flex-1 lg:w-1/2 space-y-4">
          {analysisResult && (
            <>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4" />
                    <h3>Analysis Results</h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Risk Score */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-muted-foreground">Release Risk Score</h3>
                        <p className="text-2xl font-bold">
                          {analysisResult.riskScore} / 100
                        </p>
                      </div>
                      <div className={`text-2xl font-bold 
                        ${analysisResult.riskLevel === "LOW" ? "text-success" : ""}
                        ${analysisResult.riskLevel === "MEDIUM" ? "text-warning" : ""}
                        ${analysisResult.riskLevel === "HIGH" ? "text-destructive" : ""}
                        ${analysisResult.riskLevel === "CRITICAL" ? "text-destructive" : ""}
                      `}>
                        {analysisResult.riskLevel}
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk Breakdown */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-muted-foreground">Risk Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Change Complexity</span>
                        <span>{analysisResult.riskBreakdown.complexity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Business Impact</span>
                        <span>{analysisResult.riskBreakdown.impact}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Reachability</span>
                        <span>{analysisResult.riskBreakdown.reachability}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Test Coverage (Inverse)</span>
                        <span>{100 - analysisResult.riskBreakdown.testCoverage}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk Summary */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-muted-foreground">Risk Summary</h3>
                    <p>{analysisResult.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-3">
                  <Button 
                    variant="outline"
                    onClick={saveToHistory}
                  >
                    Save to History
                  </Button>
                  <Button 
                    onClick={() => {
                      // Navigate to history tab
                      // We'll use a simple approach - just show toast for now
                      showSuccess("Analysis saved! Check History tab to view.");
                    }}
                  >
                    View in History
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Findings */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <h3>Key Findings</h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.findings.map(finding => (
                    <div key={finding.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{finding.file}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded 
                          ${finding.severity === "LOW" ? "bg-success/20 text-success" : ""}
                          ${finding.severity === "MEDIUM" ? "bg-warning/20 text-warning" : ""}
                          ${finding.severity === "HIGH" ? "bg-destructive/20 text-destructive" : ""}
                        `}>
                          {finding.severity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{finding.problem}</p>
                      <p className="text-xs text-muted-foreground"><strong>Why it matters:</strong> {finding.whyItMatters}</p>
                      <p className="text-xs text-muted-foreground"><strong>Potential impact:</strong> {finding.potentialImpact}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {/* Recommended Tests */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <h3>Recommended Tests</h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.recommendedTests.map(test => (
                    <div key={test.type} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{test.type}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {/* Release Decision */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {analysisResult.riskLevel === "LOW" ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : analysisResult.riskLevel === "MEDIUM" ? (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <h3>Release Decision</h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className={`text-2xl font-bold mb-4
                    ${analysisResult.riskLevel === "LOW" ? "text-success" : ""}
                    ${analysisResult.riskLevel === "MEDIUM" ? "text-warning" : ""}
                    ${analysisResult.riskLevel === "HIGH" || analysisResult.riskLevel === "CRITICAL" ? "text-destructive" : ""}
                  `}>
                    {analysisResult.releaseDecision}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Based on risk score of {analysisResult.riskScore}/100
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyze;