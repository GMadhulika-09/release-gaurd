"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { Finding } from "@/data/demoScenarios";

interface FindingsCardProps {
  findings: Finding[];
}

const iconForSeverity = (severity: string) => {
  switch (severity) {
    case "LOW": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "MEDIUM": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "HIGH": return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "CRITICAL": return <XCircle className="h-4 w-4 text-red-700" />;
    default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const FindingsCard = ({ findings }: FindingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>Findings</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {findings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No findings detected.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Problem</TableHead>
                <TableHead>Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="flex items-center space-x-2">
                    {iconForSeverity(f.severity)}
                    <span>{f.severity}</span>
                  </TableCell>
                  <TableCell>{f.file}</TableCell>
                  <TableCell>{f.problem}</TableCell>
                  <TableCell>{f.potentialImpact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default FindingsCard;