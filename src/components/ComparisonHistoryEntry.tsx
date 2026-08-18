import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2, Clock, GitCompare } from "lucide-react";
import { useState } from "react";
import { ComparisonHistoryEntry } from "@/utils/comparisonHistory";
import { getRiskLevel, getRiskColor, getReleaseDecision } from "@/utils/riskScoring";

interface ComparisonHistoryEntryProps {
  entry: ComparisonHistoryEntry;
  onDelete: (id: string) => void;
}

const ComparisonHistoryEntry = ({ entry, onDelete }: ComparisonHistoryEntryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-success";
    if (score <= 70) return "text-warning";
    if (score <= 85) return "text-destructive";
    return "text-destructive";
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score <= 30) return "default";
    if (score <= 70) return "secondary";
    return "destructive";
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return "LOW";
    if (score <= 70) return "MEDIUM";
    if (score <= 85) return "HIGH";
    return "CRITICAL";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate risk change and scores from the entry data
  const calculateRiskMetrics = () => {
    // Use stored risk scores if available, otherwise calculate defaults
    const prevRisk = entry.previousRiskScore !== undefined ? entry.previousRiskScore : 50;
    const currRisk = entry.currentRiskScore !== undefined ? entry.currentRiskScore : 50;
    
    const riskChange = currRisk - prevRisk;
    const clampedPreviousRisk = Math.max(0, Math.min(100, prevRisk));
    const clampedCurrentRisk = Math.max(0, Math.min(100, currRisk));
    
    return {
      previousRisk: clampedPreviousRisk,
      currentRisk: clampedCurrentRisk,
      riskChange,
      riskLevelPrevious: getRiskLevel(clampedPreviousRisk),
      riskLevelCurrent: getRiskLevel(clampedCurrentRisk),
      riskColorPrevious: getRiskColor(clampedPreviousRisk),
      riskColorCurrent: getRiskColor(clampedCurrentRisk),
      releaseDecisionCurrent: getReleaseDecision(clampedCurrentRisk)
    };
  };

  const riskMetrics = calculateRiskMetrics();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitCompare className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Release Comparison</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDate(entry.date)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Previous:</span>
            <span className="ml-2 font-medium">{entry.previousReleaseName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Current:</span>
            <span className="ml-2 font-medium">{entry.currentReleaseName}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Risk:</span>
              <span className="font-mono text-sm">
                {riskMetrics.previousRisk} → {riskMetrics.currentRisk}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Change:</span>
              <span className={`font-mono text-sm font-bold ${riskMetrics.riskChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {riskMetrics.riskChange >= 0 ? '+' : ''}{riskMetrics.riskChange}
              </span>
            </div>
          </div>
          <Badge variant={getRiskBadgeVariant(riskMetrics.currentRisk)} className="text-xs">
            {riskMetrics.riskLevelCurrent}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>+{entry.filesAdded} added</span>
            <span>~{entry.filesModified} modified</span>
            <span>-{entry.filesDeleted} deleted</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Details
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
              className="h-8 px-2 text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="pt-3 border-t border-muted space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2 font-medium">{formatDate(entry.date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={`ml-2 font-medium ${riskMetrics.riskColorCurrent}`}>
                  {riskMetrics.riskLevelCurrent}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <p className="text-xs text-muted-foreground">Added</p>
                <p className="text-lg font-bold text-emerald-600">{entry.filesAdded}</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <p className="text-xs text-muted-foreground">Modified</p>
                <p className="text-lg font-bold text-amber-600">{entry.filesModified}</p>
              </div>
              <div className="p-2 bg-red-500/10 rounded-lg">
                <p className="text-xs text-muted-foreground">Deleted</p>
                <p className="text-lg font-bold text-red-600">{entry.filesDeleted}</p>
              </div>
            </div>
            
            {/* Risk Evolution Details */}
            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Risk Evolution</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Previous</p>
                  <p className={`font-mono font-bold ${riskMetrics.riskColorPrevious}`}>
                    {riskMetrics.previousRisk}
                  </p>
                  <p className="text-xs text-muted-foreground">{riskMetrics.riskLevelPrevious}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className={`font-mono font-bold ${riskMetrics.riskColorCurrent}`}>
                    {riskMetrics.currentRisk}
                  </p>
                  <p className="text-xs text-muted-foreground">{riskMetrics.riskLevelCurrent}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-muted">
                <p className="text-sm font-medium">Decision:</p>
                <p className={`font-medium ${riskMetrics.riskColorCurrent}`}>
                  {riskMetrics.releaseDecisionCurrent}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparisonHistoryEntry;