import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle, Code, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Finding } from "@/data/demoScenarios";
import { showSuccess } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TestCoverageRecommendations from "@/components/TestCoverageRecommendations";

interface FixSuggestion {
  proposedFix: string;
  whyExplanation: string;
  beforeCode: string;
}

const fixSuggestions: Record<string, FixSuggestion> = {
  // ... (existing suggestions remain unchanged)
};

const getFixSuggestion = (finding: Finding): FixSuggestion => {
  return fixSuggestions[finding.problem] || {
    proposedFix: `// Review and fix the issue in ${finding.file}`,
    whyExplanation: `This fix addresses the ${finding.severity} severity issue.`,
    beforeCode: `// Current code in ${finding.file}`
  };
};

interface FindingItemProps {
  finding: Finding;
}

const FindingItem = ({ finding }: FindingItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fixState, setFixState] = useState({
    showFixControls: false,
    showProposedFix: false,
    showBeforeAfterComparison: false,
    fixApproved: false,
    keepCurrentCode: false
  });

  // ... (existing state and methods remain unchanged)

  const getRecommendedTests = () => {
    const testSuggestions: { type: string; description: string }[] = [];

    switch (finding.problem) {
      case "Minor text change in button label":
        testSuggestions.push({
          type: "Unit Test",
          description: "Verify button renders with correct text and calls onClick handler"
        });
        testSuggestions.push({
          type: "Visual Regression Test",
          description: "Ensure button styling remains consistent across browsers"
        });
        break;

      case "Missing rate limiting on token validation endpoint":
        testSuggestions.push({
          type: "Unit Test",
          description: "Test rate limiter middleware with multiple requests"
        });
        testSuggestions.push({
          type: "Integration Test",
          description: "Test full token validation flow with database"
        });
        break;

      case "New ML-based fraud detection lacks fallback to rule-based system":
        testSuggestions.push({
          type: "Unit Test",
          description: "Test ML model edge cases (0.0, 0.8, 1.0 scores)"
        });
        testSuggestions.push({
          type: "Integration Test",
          description: "Test end-to-end payment flow with mocked services"
        });
        testSuggestions.push({
          type: "Chaos Test",
          description: "Simulate ML service failures"
        });
        break;

      default:
        testSuggestions.push({
          type: "General Test",
          description: "Review and add tests for the affected component"
        });
    }

    return testSuggestions;
  };

  const getTestCoverageSuggestions = () => {
    const coverageSuggestions: { type: string; description: string }[] = [];

    // Basic coverage suggestions based on finding severity
    if (finding.severity === "HIGH" || finding.severity === "CRITICAL") {
      coverageSuggestions.push({
        type: "Unit Test",
        description: "Add tests for the critical functionality in ${finding.file}"
      });
      coverageSuggestions.push({
        type: "Integration Test",
        description: "Test the affected component in production-like environment"
      });
    } else {
      coverageSuggestions.push({
        type: "Unit Test",
        description: "Add basic tests for the affected functionality"
      });
    }

    // Specific suggestions based on file type
    if (finding.file.includes("auth")) {
      coverageSuggestions.push({
        type: "Security Test",
        description: "Test authentication flow with edge cases"
      });
    } else if (finding.file.includes("payment")) {
      coverageSuggestions.push({
        type: "Security Test",
        description: "Test payment processing with various scenarios"
      });
    }

    return coverageSuggestions;
  };

  return (
    <div key={finding.id} className="border rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium">{finding.file}</h4>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 text-xs rounded ${getSeverityStyles(finding.severity)}`}>
            {finding.severity}
          </span>
          <button
            onClick={toggleExplanation}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? "Hide" : "Explain"}
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{finding.problem}</p>

      {isExpanded && (
        <div className="mt-4 border-t border-muted pt-3 space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-1">Why was this flagged?</h4>
            <p className="text-sm text-muted-foreground">{finding.problem}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Potential impact:</h4>
            <p className="text-sm text-muted-foreground">{finding.potentialImpact}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Why risky?</h4>
            <p className="text-sm text-muted-foreground">
              The {finding.severity} severity issue in {finding.file} could impact critical functionality
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Recommended action:</h4>
            <p className="text-sm text-muted-foreground">
              Review the {finding.severity} severity issue in {finding.file}
            </p>
          </div>

          {/* Recommended Tests Section */}
          <div className="pt-3 border-t border-muted">
            <h4 className="text-sm font-medium mb-2">Recommended Tests</h4>
            <div className="space-y-2">
              {getRecommendedTests().map((test, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge variant="default" className="text-xs">
                    {test.type}
                  </Badge>
                  <span className="text-sm">{test.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Coverage Recommendations Section */}
          <div className="pt-3 border-t border-muted">
            <h4 className="text-sm font-medium mb-2">Test Coverage Recommendations</h4>
            <TestCoverageRecommendations
              findings={[{ id: 1, severity: finding.severity, file: finding.file }]}
              testCoverage={{
                status: "PARTIAL",
                changedComponents: 1,
                relevantTests: 0,
                componentsWithTests: 0,
                componentsWithoutTests: 1,
                gaps: [{
                  component: finding.file,
                  severity: "HIGH",
                  missing: "Critical functionality",
                  why: "No tests cover the security-sensitive operation",
                  suggestedTestType: "Security Test"
                }]
              }}
            />
          </div>

          {/* Fix-on-Confirm Section */}
          {/* (existing fix-on-confirm implementation remains unchanged) */}
        </div>
      )}
    </div>
  );
};

// ... (existing FindingsCard component remains unchanged)