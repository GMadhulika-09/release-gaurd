"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComparisonResult } from "@/utils/fileComparison";
import { useToast } from "@/hooks/use-toast";

const FileComparison = ({ result }: { result: ComparisonResult }) => {
  const { changes, summary } = result;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Added": return "text-success";
      case "Modified": return "text-warning";
      case "Deleted": return "text-destructive";
      case "Unchanged": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>File Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Showing {changes.length} changes ({summary.added} added, {summary.modified} modified, {summary.deleted} deleted)
        </p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changes.map((change) => (
              <TableRow key={change.fileName}>
                <TableCell>{change.fileName}</TableCell>
                <TableCell className={getStatusColor(change.status)}>
                  {change.status}
                </TableCell>
                <TableCell>
                  {change.previousSize !== null && change.currentSize !== null ? 
                    `${change.currentSize - change.previousSize} lines` : 
                    "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {summary.hasDifferences ? (
          <div className="mt-4">
            <Button variant="destructive" onClick={() => {/* handle export */}}>
              Export Diff
            </Button>
          </div>
        ) : (
          <p className="text-green-600 text-sm mt-4">No differences found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FileComparison;