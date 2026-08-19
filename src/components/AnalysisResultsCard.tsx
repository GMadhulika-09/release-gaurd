"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface AnalysisResultsCardProps {
  riskScore: number;
  riskLevel: string;
  releaseDecision: string;
  explanation: string;
}

const AnalysisResultsCard = ({ riskScore, riskLevel, releaseDecision, explanation }: AnalysisResultsCardProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return "text-success";
      case "MEDIUM": return "text-warning";
      case "HIGH":
      case "CRITICAL": return "text-destructive";
      default: return "text-foreground";
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4" />
          <h3 className="text-sm font-medium">Analysis Results</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Risk Score:</p>
            <p className="text-2xl font-bold text-foreground">{riskScore}/100</p>
          </div>
          <div>
            <Badge variant={riskLevel === "LOW" ? "default" : riskLevel === "MEDIUM" ? "secondary" : "destructive"}>
              {riskLevel}
            </Badge>
          </div>
        </div>
        <div className="pt-4 border-t border-primary/10">
          <p className="text-sm text-muted-foreground">Release Decision:</p>
          <p className={`text-sm font-medium ${getRiskColor(releaseDecision)}`}>
            {releaseDecision}
          </p>
        </div>
        <div className="pt-2 border-t border-primary/10">
          <p className="text-sm text-muted-foreground">Explanation:</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResultsCard;