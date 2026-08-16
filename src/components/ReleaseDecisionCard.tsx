import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { DemoScenario } from "@/data/demoScenarios";

interface ReleaseDecisionCardProps {
  result: DemoScenario;
}

const ReleaseDecisionCard = ({ result }: ReleaseDecisionCardProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return "text-success";
      case "MEDIUM": return "text-warning";
      case "HIGH":
      case "CRITICAL": return "text-destructive";
      default: return "text-foreground";
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
          {getRiskIcon(result.riskLevel)}
          <h3>Release Decision</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className={`text-2xl font-bold mb-4 ${getRiskColor(result.riskLevel)}`}>
          {result.releaseDecision}
        </p>
        <p className="text-sm text-muted-foreground">
          Based on risk score of {result.riskScore}/100
        </p>
      </CardContent>
    </Card>
  );
};

export default ReleaseDecisionCard;