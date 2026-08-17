import { Finding, TestCoverageData } from "@/data/demoScenarios";

interface TestCoverageRecommendationsProps {
  findings: Finding[];
  testCoverage: TestCoverageData;
}

const TestCoverageRecommendations = ({ findings, testCoverage }: TestCoverageRecommendationsProps) => {
  return (
    <div className="space-y-6">
      {/* Test Coverage Status */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg">
            {testCoverage.status === "GOOD" ? (
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.308-.257-2.571-.676-3.726z" />
              </svg>
            ) : testCoverage.status === "PARTIAL" ? (
              <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.956c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.956c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <div>
              <h3 className="font-medium text-foreground">Test Coverage Status</h3>
              <p className="text-sm text-muted-foreground">
                {testCoverage.status === "GOOD" ? "Good test coverage" : testCoverage.status === "PARTIAL" ? "Partial test coverage" : "Test coverage gaps detected"}
              </p>
            </div>
          </div>
          
          <div className="ml-auto text-right space-x-2">
            <div className="text-sm font-medium">
              {testCoverage.changedComponents} changed
            </div>
            <div className="text-sm font-medium">
              {testCoverage.componentsWithTests} with tests
            </div>
            <div className="text-sm font-medium">
              {testCoverage.componentsWithoutTests} without tests
            </div>
          </div>
        </div>
        
        {/* Test Coverage Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Relevant Tests</p>
            <p className="font-mono text-foreground">{testCoverage.relevantTests}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Coverage Ratio</p>
            <p className="font-mono text-foreground">
              {testCoverage.changedComponents > 0 
                ? ((testCoverage.componentsWithTests / testCoverage.changedComponents) * 100).toFixed(0) + "%"
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Test Coverage Gaps */}
      {testCoverage.gaps.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-warning/20">
              <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.956c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Test Coverage Gaps</h3>
              <p className="text-sm text-muted-foreground">
                {testCoverage.gaps.length} component{testCoverage.gaps.length === 1 ? "" : "s"} need test coverage
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {testCoverage.gaps.map((gap, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{gap.component}</h4>
                  <span className={`px-2 py-0.5 text-xs rounded ${gap.severity === "HIGH" ? "bg-destructive/20 text-destructive" : gap.severity === "MEDIUM" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}`}>
                    {gap.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{gap.missing}</p>
                {gap.why && (
                  <div className="text-xs text-muted-foreground italic mb-2">
                    Why: {gap.why}
                  </div>
                )}
                {gap.suggestedTestType && (
                  <div className="text-xs text-muted-foreground">
                    Suggested: {gap.suggestedTestType}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Findings Summary */}
      {findings.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-destructive/20">
              <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.956c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Key Findings</h3>
              <p className="text-sm text-muted-foreground">
                {findings.length} finding{findings.length === 1 ? "" : "s"} identified
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {findings.map((finding) => (
              <div key={finding.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{finding.file}</h4>
                  <span className={`px-2 py-0.5 text-xs rounded ${finding.severity === "LOW" ? "bg-success/20 text-success" : finding.severity === "MEDIUM" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"}`}>
                    {finding.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{finding.problem}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCoverageRecommendations;