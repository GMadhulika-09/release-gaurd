import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2, Clock, GitCompare } from "lucide-react";
import { useState } from "react";
import { ComparisonHistoryEntry } from "@/utils/comparisonHistory";

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
                {entry.previousRiskScore} → {entry.currentRiskScore}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Change:</span>
              <span className={`font-mono text-sm font-bold ${entry.riskChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {entry.riskChange >= 0 ? '+' : ''}{entry.riskChange}
              </span>
            </div>
          </div>
          <Badge variant={getRiskBadgeVariant(entry.currentRiskScore)} className="text-xs">
            {getRiskLevel(entry.currentRiskScore)}
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
                <span className={`ml-2 font-medium ${getRiskColor(entry.currentRiskScore)}`}>
                  {entry.releaseStatus}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparisonHistoryEntry;