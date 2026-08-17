import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, FileText, TestTube, AlertCircle } from "lucide-react";

interface PreviousAnalysisContextProps {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  findingsCount: number;
  recommendedTestsCount: number;
  releaseDecision: string;
}

const PreviousAnalysisContext = ({
  riskScore,
  riskLevel,
  findingsCount,
  recommendedTestsCount,
  releaseDecision,
}: PreviousAnalysisContextProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return "text-success";
      case "MEDIUM": return "text-warning";
      case "HIGH":
      case "CRITICAL": return "text-destructive";
      default: return "text-foreground";
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "LOW": return "default";
      case "MEDIUM": return "secondary";
      case "HIGH":
      case "CRITICAL": return "destructive";
      default: return "default";
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Previous Analysis Context</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Previous Risk:</span>
            <span className="font-mono font-medium">
              {riskScore} / 100
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Level:</span>
            <Badge variant={getRiskBadgeVariant(riskLevel)} className="text-xs">
              {riskLevel}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Findings:</span>
            <span className="font-mono font-medium">{findingsCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TestTube className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tests:</span>
            <span className="font-mono font-medium">{recommendedTestsCount}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Release Decision:</span>
            <span className={`text-sm font-medium ${getRiskColor(riskLevel)}`}>
              {releaseDecision}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviousAnalysisContext;