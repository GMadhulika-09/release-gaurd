import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Finding } from "@/data/demoScenarios";

interface FindingsCardProps {
  findings: Finding[];
}

const FindingsCard = ({ findings }: FindingsCardProps) => {
  const [explanations, setExplanations] = useState<Record<string, boolean>>({});

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "LOW": return "bg-success/20 text-success";
      case "MEDIUM": return "bg-warning/20 text-warning";
      case "HIGH": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const toggleExplanation = (id: string) => {
    setExplanations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
              <button
                onClick={() => toggleExplanation(finding.id)}
                className="text-sm text-muted-foreground"
              >
                Explain
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{finding.problem}</p>
            {explanations[finding.id] && (
              <div className="mt-4 border-t border-muted">
                <h4 className="text-sm font-medium">Explanation</h4>
                <div className="space-y-2">
                  <p><strong>Why was this flagged?</strong> {finding.problem}</p>
                  <p><strong>Potential impact:</strong> {finding.potentialImpact}</p>
                  <p><strong>Why risky?</strong> 
                    {`The ${finding.severity} severity issue in ${finding.file} could impact critical functionality`}
                  </p>
                  <p><strong>Recommended action:</strong> 
                    {`Review the ${finding.severity} severity issue in ${finding.file}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FindingsCard;