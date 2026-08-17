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
} from "lucide-react";
import type { ComparisonResult } from "@/utils/fileComparison";

interface FileComparisonProps {
  result: ComparisonResult;
}

const statusConfig: Record<
  string,
  { color: string; icon: typeof FilePlus }
> = {
  Added: {
    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    icon: FilePlus,
  },
  Modified: {
    color: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    icon: FileEdit,
  },
  Deleted: {
    color: "bg-red-500/15 text-red-700 dark:text-red-400",
    icon: FileMinus,
  },
  Unchanged: {
    color: "bg-muted text-muted-foreground",
    icon: FileCheck,
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
    (c) => !c.contentComparisonAvailable
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GitCompare className="h-5 w-5" />
          <span>File Changes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2 rounded-lg bg-emerald-500/10 p-3">
            <FilePlus className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Added</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {summary.added}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rounded-lg bg-amber-500/10 p-3">
            <FileEdit className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Modified</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                {summary.modified}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 p-3">
            <FileMinus className="h-4 w-4 text-red-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Deleted</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-400">
                {summary.deleted}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rounded-lg bg-muted p-3">
            <FileCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Unchanged</p>
              <p className="text-lg font-bold text-muted-foreground">
                {summary.unchanged}
              </p>
            </div>
          </div>
        </div>

        {/* No changes message */}
        {!hasDifferences && (
          <div className="text-center py-8">
            <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No changes detected between these releases.
            </p>
          </div>
        )}

        {/* Changes table */}
        {hasDifferences && (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
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
                    <TableRow key={change.fileName}>
                      <TableCell className="font-mono text-sm break-all">
                        {change.fileName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${config.color} font-medium`}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {change.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatSize(change.previousSize)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatSize(change.currentSize)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Content comparison unavailable note */}
        {hasUnavailableContent && (
          <p className="text-xs text-muted-foreground italic">
            Note: Content comparison was unavailable for some files. Size-based
            comparison was used instead.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FileComparison;