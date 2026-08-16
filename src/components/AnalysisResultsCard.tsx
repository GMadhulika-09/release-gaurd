import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { DemoScenario, Finding } from "@/data/demoScenarios";
import { showSuccess } from "@/utils/toast";

interface AnalysisResultsCardProps {
  result: DemoScenario;
  onSaveToHistory: () => void;
}

const AnalysisResultsCard = ({ result, onSaveToHistory }: AnalysisResultsCardProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return "text-success";
      case "MEDIUM": return "text-warning";
      case "HIGH":
      case "CRITICAL": return "text-destructive";
      default: return "text-foreground";
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "LOW": return "bg-success/20 text-success";
      case "MEDIUM": return "bg-warning/20 text-warning";
      case "HIGH": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "LOW": return <CheckCircle className="h-4 w-4 text-success" />;
      case "MEDIUM": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "HIGH":
      case "CRITICAL": return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4" />
          <h3>Analysis Results</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-muted-foreground">Release Risk Score</h3>
              <p className="text-2xl font-bold">
                {result.riskScore} / 100
              </p>
            </div>
            <div className={`text-2xl font-bold ${getRiskColor(result.riskLevel)}`}>
              {result.riskLevel}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-muted-foreground">Risk Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Change Complexity</span>
              <span>{result.riskBreakdown.complexity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Business Impact</span>
              <span>{result.riskBreakdown.impact}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Reachability</span>
              <span>{result.riskBreakdown.reachability}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Test Coverage (Inverse)</span>
              <span>{100 - result.riskBreakdown.testCoverage}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium text-muted-foreground">Risk Summary</h3>
          <p>{result.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onSaveToHistory}>
          Save to History
        </Button>
        <Button
          onClick={() => {
            showSuccess("Analysis saved! Check History tab to view.");
          }}
        >
          View in History
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnalysisResultsCard;