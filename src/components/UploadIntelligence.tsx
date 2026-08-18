import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { FileText, FileCode, FileDigit, AlertCircle } from "lucide-react";
import ProjectIntelligenceCard from "./ProjectIntelligenceCard";
import { extractZipInfo } from "@/utils/fileComparison";

const isZipFile = (file: File) => {
  const lowerName = file.name.toLowerCase();
  const isZipByExtension = lowerName.endsWith(".zip");
  const isZipByMime = file.type.startsWith("application/zip");
  return isZipByExtension || isZipByMime;
};

const CODE_EXTENSIONS = [
  ".py", ".java", ".js", ".ts", ".c", ".cpp", ".cc", ".cxx",
  ".cs", ".go", ".php", ".rb", ".html", ".css", ".sql",
  ".json", ".yaml", ".yml", ".xml", ".env", ".toml", ".ini", ".conf",
];

const DOCUMENT_EXTENSIONS = [".txt", ".md", ".log", ".csv", ".rst", ".tex"];

const isCodeFile = (file: File): boolean => {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return CODE_EXTENSIONS.includes(ext);
};

const isReadableDocument = (file: File): boolean => {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return DOCUMENT_EXTENSIONS.includes(ext);
};

const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    py: "Python",
    java: "Java",
    js: "JavaScript",
    ts: "TypeScript",
    c: "C",
    cpp: "C++",
    cc: "C++",
    cxx: "C++",
    cs: "C#",
    go: "Go",
    php: "PHP",
    rb: "Ruby",
    html: "HTML",
    css: "CSS",
    sql: "SQL",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    xml: "XML",
    env: "Environment",
    toml: "TOML",
    ini: "INI",
    conf: "Config",
    md: "Markdown",
    txt: "Text",
    log: "Log",
    csv: "CSV",
    rst: "reStructuredText",
    tex: "LaTeX",
  };
  return langMap[ext || ""] || "Unknown";
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface FileWithInfo {
  file: File;
  type: "Code" | "Document" | "Unsupported";
  language: string;
  status: "ready" | "unsupported";
}

const UploadIntelligence = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingFile, setProcessingFile] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithInfo[]>([]);
  const [selectedZip, setSelectedZip] = useState<File | null>(null);
  const [zipResult, setZipResult] = useState<any>(null);
  const [processingZip, setProcessingZip] = useState(false);

  const classifyFile = (file: File): FileWithInfo => {
    if (isCodeFile(file)) {
      return {
        file,
        type: "Code",
        language: getLanguageFromFilename(file.name),
        status: "ready",
      };
    } else if (isReadableDocument(file)) {
      return {
        file,
        type: "Document",
        language: getLanguageFromFilename(file.name),
        status: "ready",
      };
    } else {
      return {
        file,
        type: "Unsupported",
        language: "N/A",
        status: "unsupported",
      };
    }
  };

  const handleFileSelect = (files: File[] | null) => {
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      const file = files[0];
      setSelectedFile(file);
      setProcessingFile(true);
      setTimeout(() => {
        setProcessingFile(false);
      }, 1500);
      setSelectedFiles([]);
    } else {
      const fileInfos = files.map(classifyFile);
      setSelectedFiles(fileInfos);
      setSelectedFile(null);
      setProcessingFile(false);
    }
  };

  const handleZipSelect = async (file: File) => {
    if (!isZipFile(file)) return;
    setProcessingZip(true);
    try {
      const result = await extractZipInfo(file);
      setZipResult(result);
    } catch (error) {
      console.error("Failed to extract ZIP:", error);
    } finally {
      setProcessingZip(false);
    }
  };

  useEffect(() => {
    return () => {
      setSelectedFile(null);
      setSelectedFiles([]);
      setSelectedZip(null);
      setZipResult(null);
      setProcessingFile(false);
      setProcessingZip(false);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Single file intelligence */}
      {selectedFile && !zipResult && (
        <ProjectIntelligenceCard
          file={selectedFile}
          isProcessing={processingFile}
        />
      )}

      {/* Multi-file intelligence */}
      {selectedFiles.length > 0 && !zipResult && (
        <MultiFileIntelligence files={selectedFiles} />
      )}

      {/* ZIP project intelligence */}
      {zipResult && (
        <ProjectIntelligenceCard
          zipResult={zipResult}
          isProcessing={processingZip}
        />
      )}

      {/* Fallback */}
      {!selectedFile && selectedFiles.length === 0 && !zipResult && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Select a file or ZIP to begin analysis
          </p>
        </div>
      )}
    </div>
  );
};

const MultiFileIntelligence = ({ files }: { files: FileWithInfo[] }) => {
  const codeFiles = files.filter((f) => f.type === "Code");
  const docFiles = files.filter((f) => f.type === "Document");
  const unsupportedFiles = files.filter((f) => f.status === "unsupported");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Code":
        return <FileCode className="h-4 w-4 text-emerald-500" />;
      case "Document":
        return <FileDigit className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-primary" />
          <span>File Intelligence</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Code Files
            </p>
            <p className="text-2xl font-bold text-emerald-600">{codeFiles.length}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Documents
            </p>
            <p className="text-2xl font-bold text-blue-600">{docFiles.length}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Unsupported
            </p>
            <p className="text-2xl font-bold text-muted-foreground">
              {unsupportedFiles.length}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((fileInfo, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm max-w-[200px] truncate">
                    {fileInfo.file.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(fileInfo.type)}
                      <Badge variant="secondary" className="text-xs">
                        {fileInfo.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fileInfo.language}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono text-muted-foreground">
                    {formatSize(fileInfo.file.size)}
                  </TableCell>
                  <TableCell>
                    {fileInfo.status === "unsupported" ? (
                      <Badge variant="destructive" className="text-xs">
                        Unsupported
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs">
                        Ready
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {unsupportedFiles.length > 0 && (
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Unsupported for code analysis:</span>{" "}
              {unsupportedFiles.map((f) => f.file.name).join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadIntelligence;