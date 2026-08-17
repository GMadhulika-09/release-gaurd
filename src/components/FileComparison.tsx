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

interface FileComparisonProps {
  result: ComparisonResult;
}

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
    </div>
  );
};

export default FileComparison;