import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle, Info } from "lucide-react";

interface BlastRadiusProps {
  blastRadius: {
    level: "LOW" | "MEDIUM" | "HIGH";
    affectedFiles: number;
    estimatedDependencies: number;
    highImpactComponents: number;
    criticalPaths: number;
    potentiallyAffected: string[];
    changedComponent: string;
  };
  dependencyData: {
    changedComponent: string;
    callers: string[];
    highImpactCallers: string[];
    criticalPaths: string[];
  };
  explanation: string;
}

const getBlastRadiusLevel = (level: "LOW" | "MEDIUM" | "HIGH") => {
  switch (level) {
    case "LOW": return "low";
    case "MEDIUM": return "medium";
    case "HIGH": return "high";
  }
};

const getBlastRadiusColor = (level: "LOW" | "MEDIUM" | "HIGH") => {
  switch (level) {
    case "LOW": return "text-success";
    case "MEDIUM": return "text-warning";
    case "HIGH": return "text-destructive";
  }
};

const getBlastRadiusBadgeVariant = (level: "LOW" | "MEDIUM" | "HIGH") => {
  switch (level) {
    case "LOW": return "default";
    case "MEDIUM": return "secondary";
    case "HIGH": return "destructive";
  }
};

const BlastRadius = ({
  blastRadius,
  dependencyData,
  explanation,
}: BlastRadiusProps) => {
  const level = getBlastRadiusLevel(blastRadius.level);
  const color = getBlastRadiusColor(blastRadius.level);
  const variant = getBlastRadiusBadgeVariant(blastRadius.level);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4" />
          <h3>Blast Radius</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Blast Radius Summary */}
        <div className="text-center pt-4">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${color}`}>
            {blastRadius.level}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Blast Radius Summary</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Affected Files</p>
            <p className="text-2xl font-bold">{blastRadius.affectedFiles}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Dependencies</p>
            <p className="text-2xl font-bold">{blastRadius.estimatedDependencies}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">High-Impact Components</p>
            <p className="text-2xl font-bold">{blastRadius.highImpactComponents}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Critical Paths</p>
            <p className="text-2xl font-bold">{blastRadius.criticalPaths}</p>
          </div>
        </div>

        {/* Potentially Affected Components */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Potentially Affected:</p>
          <div className="flex flex-wrap gap-2">
            {blastRadius.potentiallyAffected.map((affected, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-xs font-medium ${color}`}
              >
                {affected}
              </span>
            ))}
          </div>
        </div>

        {/* Dependency Relationship Visualization */}
        <div className="mt-4 p-4 bg-primary/5 rounded-lg">
          <p className="text-xs text-muted-foreground mb-3">Dependency Relationship</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-medium text-primary">
                {dependencyData.changedComponent}
              </span>
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-muted-foreground">→</span>
            </div>
            {dependencyData.callers.map((caller, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="flex-1 truncate">
                  {caller}
                </span>
                <svg
                  className="h-3 w-3 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            ))}
          </div>
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

export default BlastRadius;