import type { Finding, TestCoverageData } from "@/data/demoScenarios";

interface TestCoverageRecommendationsProps {
  findings: Finding[];
  testCoverageData: TestCoverageData | null;
}

const getPriority = (severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): "LOW" | "MEDIUM" | "HIGH" => {
  switch (severity) {
    case "CRITICAL":
    case "HIGH": return "HIGH";
    case "MEDIUM": return "MEDIUM";
    case "LOW": return "LOW";
  }
};

const getSeverityClass = (severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") => {
  switch (severity) {
    case "CRITICAL": return "text-destructive";
    case "HIGH": return "text-destructive";
    case "MEDIUM": return "text-warning";
    case "LOW": return "text-success";
  }
};

const TestCoverageRecommendations = ({ findings, testCoverageData }: TestCoverageRecommendationsProps) => {
  // Generate recommendations deterministically from gaps and findings
  const recommendations = [
    ...(testCoverageData?.gaps?.map(gap => ({
      type: gap.suggestedTestType || "Unit Test",
      target: gap.component,
      priority: getPriority(gap.severity),
      why: gap.why
    })) || []),
    ...findings.map(finding => ({
      type: "Integration Test",
      target: finding.file,
      priority: getPriority(finding.severity),
      why: finding.whyItMatters
    }))
  ];

  return (
    <div className="space-y-4">
      {testCoverageData ? (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Status: {testCoverageData.status}
          </p>
          <p className="text-sm text-muted-foreground">
            Changed Components: {testCoverageData.changedComponents}
          </p>
          <p className="text-sm text-muted-foreground">
            Components with Tests: {testCoverageData.componentsWithTests}
          </p>
          <p className="text-sm text-muted-foreground">
            Components Without Tests: {testCoverageData.componentsWithoutTests}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No test coverage data available.</p>
      )}
      
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Test Coverage Gaps</h3>
      
      {recommendations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recommendations available.</p>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="w-2 h-2 rounded-full mt-1" style={{ 
                backgroundColor: rec.priority === "HIGH" ? "red-500" : 
                rec.priority === "MEDIUM" ? "orange-500" : "green-500"
              }} />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${rec.priority === "HIGH" ? "text-destructive" : rec.priority === "MEDIUM" ? "text-warning" : "text-success"}`}>
                  {rec.type}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Target: {rec.target}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rec.why}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestCoverageRecommendations;