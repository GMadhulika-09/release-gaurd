import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Finding } from "@/data/demoScenarios";

interface FindingsCardProps {
  findings: Finding[];
}

const FindingsCard = ({ findings }: FindingsCardProps) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "LOW": return "bg-success/20 text-success";
      case "MEDIUM": return "bg-warning/20 text-warning";
      case "HIGH": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4" />
          <h3>Key Findings</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {findings.map((finding) => (
          <div key={finding.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium">{finding.file}</h4>
              <span className={`px-2 py-0.5 text-xs rounded ${getSeverityStyles(finding.severity)}`}>
                {finding.severity}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{finding.problem}</p>
            <p className="text-xs text-muted-foreground">
              <strong>Why it matters:</strong> {finding.whyItMatters}
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Potential impact:</strong> {finding.potentialImpact}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FindingsCard;