import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RiskComponents } from "@/utils/riskScoring";

interface RiskIntelligenceCardProps {
  components: RiskComponents;
  overallScore: number;
  riskLevel: string;
  explanation: string;
}

const RiskIntelligenceCard = ({
  components,
  overallScore,
  riskLevel,
  explanation,
}: RiskIntelligenceCardProps) => {
  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-success";
    if (score <= 70) return "text-warning";
    if (score <= 85) return "text-destructive";
    return "text-destructive";
  };

  const getProgressColor = (score: number) => {
    if (score <= 30) return "bg-success";
    if (score <= 70) return "bg-warning";
    if (score <= 85) return "bg-destructive/80";
    return "bg-destructive";
  };

  const riskItems = [
    { label: "Business Impact", score: components.businessImpact, weight: "30%" },
    { label: "Reachability", score: components.reachability, weight: "25%" },
    { label: "Change Complexity", score: components.changeComplexity, weight: "20%" },
    { label: "Test Coverage", score: components.testCoverage, weight: "15%" },
    { label: "Component Sensitivity", score: components.componentSensitivity, weight: "10%" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <h3>Risk Intelligence</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Overall Release Risk</p>
          <div className="flex items-baseline justify-center space-x-2">
            <span className={`text-4xl font-bold ${getRiskColor(overallScore)}`}>
              {overallScore}
            </span>
            <span className="text-lg text-muted-foreground">/ 100</span>
          </div>
          <Badge 
            variant={overallScore <= 30 ? "default" : overallScore <= 70 ? "secondary" : "destructive"}
            className="mt-2 text-xs"
          >
            {riskLevel}
          </Badge>
        </div>

        {/* Risk Components */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Risk Breakdown</h4>
          {riskItems.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-muted-foreground">{item.weight}</span>
                  <span className={`font-mono font-bold ${getRiskColor(item.score)}`}>
                    {item.score}
                  </span>
                </div>
              </div>
              <Progress 
                value={item.score} 
                className="h-2"
                indicatorClassName={getProgressColor(item.score)}
              />
            </div>
          ))}
        </div>

        {/* Explanation */}
        <div className="pt-4 border-t border-muted">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskIntelligenceCard;