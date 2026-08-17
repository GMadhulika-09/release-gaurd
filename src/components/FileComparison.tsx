import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FilePlus,
  FileEdit,
  FileMinus,
  FileCheck,
  GitCompare,
  FileText,
  AlertCircle,
  Info
} from "lucide-react";
import type { ComparisonResult } from "@/utils/fileComparison";
import RiskIntelligenceCard from "@/components/RiskIntelligenceCard";
import { calculateRiskScore } from "@/utils/riskScoring";

const statusConfig: Record<
  string,
  { color: string; icon: typeof FilePlus; bg: string }
> = {
  Added: {
    color: "text-emerald-600 dark:text-emerald-400",
    icon: FilePlus,
    bg: "bg-emerald-500/10",
  },
  Modified: {
    color: "text-amber-600 dark:text-amber-400",
    icon: FileEdit,
    bg: "bg-amber-500/10",
  },
  Deleted: {
    color: "text-red-600 dark:text-red-400",
    icon: FileMinus,
    bg: "bg-red-500/10",
  },
  Unchanged: {
    color: "text-muted-foreground",
    icon: FileCheck,
    bg: "bg-muted",
  },
};

function formatSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FileComparison = ({ result }: FileComparisonProps) => {
  const { changes, summary, hasDifferences } = result;
  const hasUnavailableContent = changes.some(
    (c) =>!c.contentComparisonAvailable
  );

  // Risk Evolution calculation
  const addedFiles = changes.filter(c => c.status === 'Added');
  const deletedFiles = changes.filter(c => c.status === 'Deleted');
  const modifiedFiles = changes.filter(c => c.status === 'Modified');
  const allChangedFiles = [...addedFiles, ...deletedFiles, ...modifiedFiles].map(f => f.fileName);
  const highRiskKeywords = ['auth', 'payment', 'security', 'admin', 'config'];

  const getFileRisk = (fileName: string) => {
    const base = 2;
    const isHighRisk = highRiskKeywords.some(keyword => 
      fileName.toLowerCase().includes(keyword));
    const typeAdj = isHighRisk ? 5 : 0;
    return base + typeAdj;
  };

  const riskFromAdded = addedFiles.reduce((sum, file) => sum + getFileRisk(file.fileName), 0);
  const riskFromDeleted = deletedFiles.reduce((sum, file) => sum + getFileRisk(file.fileName), 0);
  let riskChange = riskFromAdded - riskFromDeleted;

  // Clamp riskChange to [-50, 50] to avoid extreme values
  riskChange = Math.max(-50, Math.min(50, riskChange));

  const previousRisk = 50 - riskChange / 2;
  const currentRisk  = 50 + riskChange / 2;

  // Clamp risk scores to [0, 100]
  const clampedPreviousRisk = Math.max(0, Math.min(100, previousRisk));
  const clampedCurrentRisk  = Math.max(0, Math.min(100, currentRisk));

  // Calculate noise-aware risk score
  const testFiles = changes.filter(c => /test|spec/i.test(c.fileName));
  const codeFiles = changes.filter(c => !/test|spec/i.test(c.fileName));
  
  const riskScoreResult = calculateRiskScore({
    changedFiles: allChangedFiles,
    addedFiles: addedFiles.map(f => f.fileName),
    deletedFiles: deletedFiles.map(f => f.fileName),
    modifiedFiles: modifiedFiles.map(f => f.fileName),
    testFileCount: testFiles.length,
    codeFileCount: codeFiles.length,
    hasTestFiles: testFiles.length > 0,
    previousRiskScore: clampedPreviousRisk,
  });

  // Helper functions for risk levels and colors
  const getRiskLevel = (score: number) => {
    if (score <= 30) return 'low';
    if (score <= 70) return 'medium';
    if (score <= 85) return 'high';
    return 'critical';
  };

  const getRiskColor = (score: number) => {
    const level = getRiskLevel(score);
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': 
      case 'critical': return 'text-destructive';
      default: return 'text-foreground';
    }
  };

  const getReleaseDecision = (score: number) => {
    if (score <= 30) return 'SAFE TO RELEASE';
    if (score <= 70) return 'REVIEW RECOMMENDED';
    if (score <= 85) return 'REVIEW REQUIRED';
    return 'HIGH RISK — RELEASE BLOCKED';
  };

  const getRiskChangeExplanation = () => {
    if (riskChange > 0) {
      const addedCount = addedFiles.length;
      const deletedCount = deletedFiles.length;
      let explanation = `Risk increased because ${addedCount} file${addedCount === 1 ? '' : 's'} were added and ${deletedCount} file${deletedCount === 1 ? '' : 's'} were deleted.`;
      const highRiskAdded = addedFiles.filter(f => 
        highRiskKeywords.some(k => f.fileName.toLowerCase().includes(k))
      );
      if (highRiskAdded.length > 0) {
        explanation += ` High-risk files added: ${highRiskAdded.map(f => f.fileName).slice(0, 2).join(', ')}${highRiskAdded.length > 2 ? ' and more' : ''}.`;
      }
      return explanation;
    } else if (riskChange < 0) {
      const addedCount = addedFiles.length;
      const deletedCount = deletedFiles.length;
      let explanation = `Risk decreased because ${deletedCount} file${deletedCount === 1 ? '' : 's'} were deleted and ${addedCount} file${addedCount === 1 ? '' : 's'} were added.`;
      const highRiskDeleted = deletedFiles.filter(f => 
        highRiskKeywords.some(k => f.fileName.toLowerCase().includes(k))
      );
      if (highRiskDeleted.length > 0) {
        explanation += ` High-risk files deleted: ${highRiskDeleted.map(f => f.fileName).slice(0, 2).join(', ')}${highRiskDeleted.length > 2 ? ' and more' : ''}.`;
      }
      return explanation;
    } else {
      return "Risk remained approximately the same because the detected changes have limited impact.";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-none bg-emerald-500/5 dark:bg-emerald-500/5">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <FilePlus className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Added</p>
              <p className="text-2xl font-bold text-emerald-600">{summary.added}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-amber-500/5 dark:bg-amber-500/5">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <FileEdit className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Modified</p>
              <p className="text-2xl font-bold text-amber-600">{summary.modified}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-red-500/5 dark:bg-red-500/5">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <FileMinus className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deleted</p>
              <p className="text-2xl font-bold text-red-600">{summary.deleted}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-muted/50">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-2 bg-muted rounded-lg">
              <FileCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unchanged</p>
              <p className="text-2xl font-bold text-muted-foreground">{summary.unchanged}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Comparison Table Card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <GitCompare className="h-5 w-5 text-primary" />
              <span>File Changes</span>
            </CardTitle>
            {hasUnavailableContent && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                <Info className="h-3 w-3" />
                <span>Content comparison unavailable for some files</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!hasDifferences? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No differences detected</h3>
              <p className="text-muted-foreground">The selected releases are identical.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[40%]">File Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Previous Size</TableHead>
                    <TableHead className="text-right">Current Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changes.map((change) => {
                    const config = statusConfig[change.status];
                    const Icon = config.icon;
                    return (
                      <TableRow key={change.fileName} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-sm max-w-[300px] md:max-w-none truncate">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span title={change.fileName}>{change.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${config.color} ${config.bg} border-none px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {change.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm font-mono text-muted-foreground">
                          {formatSize(change.previousSize)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-mono text-muted-foreground">
                          {formatSize(change.currentSize)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Evolution Section */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-muted-foreground">Risk Evolution</h3>
        <div className="mt-4 flex flex-col space-x-6 sm:flex-row sm:space-x-0 sm:space-x-6">
          {/* Previous Risk */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground">Previous Risk</p>
            <p className={`text-2xl font-bold ${getRiskColor(clampedPreviousRisk)}`}>
              {Math.round(clampedPreviousRisk)} / 100
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {getRiskLevel(clampedPreviousRisk)}
            </p>
          </div>
          {/* Risk Change */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground">Risk Change</p>
            <p className={`text-2xl font-bold ${riskChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {riskChange >= 0 ? '+' : ''}{Math.round(riskChange)}
            </p>
          </div>
          {/* Current Risk */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground">Current Risk</p>
            <p className={`text-2xl font-bold ${getRiskColor(clampedCurrentRisk)}`}>
              {Math.round(clampedCurrentRisk)} / 100
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {getRiskLevel(clampedCurrentRisk)}
            </p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">{getRiskChangeExplanation()}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-medium text-muted-foreground">Release Status</h3>
          <p className={`text-sm font-medium ${getRiskColor(clampedCurrentRisk)}`}>
            {getReleaseDecision(clampedCurrentRisk)}
          </p>
        </div>
      </div>

      {/* Risk Intelligence Card */}
      <div className="mt-6">
        <RiskIntelligenceCard
          components={riskScoreResult.components}
          overallScore={riskScoreResult.overall}
          riskLevel={riskScoreResult.riskLevel}
          explanation={riskScoreResult.explanation}
        />
      </div>
    </div>
  );
};

export default FileComparison;