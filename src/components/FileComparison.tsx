import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import {
    FilePlus,
    FileEdit,
    FileMinus,
    FileCheck,
    GitCompare,
    FileText,
    AlertCircle,
    Info,
    TrendingUp,
    TrendingDown,
    Minus,
  } from "lucide-react";
  import type { ComparisonResult } from "@/utils/fileComparison";
  import RiskIntelligenceCard from "@/components/RiskIntelligenceCard";
  import { calculateRiskScore } from "@/utils/riskScoring";
  import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
  } from "@/components/ui/table";

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

  const FileComparison = ({ result }: { result: ComparisonResult }) => {
    const { changes, summary, hasDifferences } = result;
    const hasUnavailableContent = changes.some(
      (c) => !c.contentComparisonAvailable
    );

    // Calculate risk evolution metrics
    const addedFiles = changes.filter((c) => c.status === "Added");
    const deletedFiles = changes.filter((c) => c.status === "Deleted");
    const modifiedFiles = changes.filter((c) => c.status === "Modified");
    const allChangedFiles = [
      ...addedFiles,
      ...deletedFiles,
      ...modifiedFiles,
    ].map((f) => f.fileName);
    const highRiskKeywords = [
      "auth",
      "payment",
      "security",
      "admin",
      "config",
    ];

    const getFileRisk = (fileName: string) => {
      const base = 2;
      const isHighRisk = highRiskKeywords.some((keyword) =>
        fileName.toLowerCase().includes(keyword)
      );
      const typeAdj = isHighRisk ? 5 : 0;
      return base + typeAdj;
    };

    const riskFromAdded = addedFiles.reduce(
      (sum, file) => sum + getFileRisk(file.fileName),
      0
    );
    const riskFromDeleted = deletedFiles.reduce(
      (sum, file) => sum + getFileRisk(file.fileName),
      0
    );
    let riskChange = riskFromAdded - riskFromDeleted;

    // Clamp riskChange to [-50, 50] to avoid extreme values
    riskChange = Math.max(-50, Math.min(50, riskChange));

    // Calculate previous and current risk scores
    const previousRisk = 50 - riskChange / 2;
    const currentRisk = 50 + riskChange / 2;

    // Clamp risk scores to [0, 100]
    const clampedPreviousRisk = Math.max(
      0,
      Math.min(100, previousRisk)
    );
    const clampedCurrentRisk = Math.max(
      0,
      Math.min(100, currentRisk)
    );

    // Calculate noise-aware risk score
    const testFiles = changes.filter(
      (c) => /test|spec/i.test(c.fileName)
    );
    const codeFiles = changes.filter(
      (c) => !/test|spec/i.test(c.fileName)
    );

    const riskScoreResult = calculateRiskScore({
      changedFiles: allChangedFiles,
      addedFiles: addedFiles.map((f) => f.fileName),
      deletedFiles: deletedFiles.map((f) => f.fileName),
      modifiedFiles: modifiedFiles.map((f) => f.fileName),
      testFileCount: testFiles.length,
      codeFileCount: codeFiles.length,
      hasTestFiles: testFiles.length > 0,
      previousRiskScore: clampedPreviousRisk,
    });

    // Helper functions for risk levels and colors
    const getRiskLevel = (score: number) => {
      if (score <= 30) return "low";
      if (score <= 70) return "medium";
      if (score <= 85) return "high";
      return "critical";
    };

    const getRiskColor = (score: number) => {
      const level = getRiskLevel(score);
      switch (level) {
        case "low":
          return "text-success";
        case "medium":
          return "text-warning";
        case "high":
        case "critical":
          return "text-destructive";
        default:
          return "text-foreground";
      }
    };

    const getReleaseDecision = (score: number) => {
      if (score <= 30) return "SAFE TO RELEASE";
      if (score <= 70) return "REVIEW RECOMMENDED";
      if (score <= 85) return "REVIEW REQUIRED";
      return "HIGH RISK — RELEASE BLOCKED";
    };

    // Determine previous and current release names
    const previousReleaseName = "Previous Release";
    const currentReleaseName = "Current Release";

    return (
      <div className="space-y-6 w-full max-w-6xl mx-auto">
        {/* Release Comparison Summary Card */}
        <Card className="border-b bg-muted/30">
          <CardContent className="p-4 flex flex-col space-y-3">
            {/* Previous Release Indicator */}
            <div className="flex items-start space-y-2">
              {/* Previous Release Indicator */}
              <div className="flex items-center space-x-3">
                <FileMinus className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Previous Release</p>
                  <p className="font-mono text-sm font-medium">
                    {previousReleaseName}
                  </p>
                </div>
              </div>

              {/* What Changed Indicator */}
              <div className="flex flex-col items-center space-x-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">What Changed</p>
                  <p className="text-sm font-medium">
                    {summary.added > 0 && summary.modified > 0 && summary.deleted > 0
                      ? "Multiple Changes"
                      : summary.added > 0
                      ? "Files Added"
                      : summary.modified > 0
                      ? "Files Modified"
                      : summary.deleted > 0
                      ? "Files Deleted"
                      : "No Changes"}
                  </p>
                </div>
              </div>

              {/* Current Release Indicator */}
              <div className="flex items-start space-x-3">
                <FilePlus className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Current Release</p>
                  <p className="font-mono text-sm font-medium">
                    {currentReleaseName}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Added</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {summary.added}
                </p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Modified</p>
                <p className="text-2xl font-bold text-amber-600">
                  {summary.modified}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Deleted</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.deleted}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Unchanged</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {summary.unchanged}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  export default FileComparison;