import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FolderOpen, Code, TestTube, Settings, Globe, Database, Shield, FileCode } from "lucide-react";
import { ZipExtractionResult } from "@/utils/fileComparison";

interface ProjectIntelligenceCardProps {
  file?: File;
  zipResult?: ZipExtractionResult;
  isProcessing?: boolean;
}

const getLanguageIcon = (language: string) => {
  switch (language.toLowerCase()) {
    case "python": return <Code className="h-4 w-4 text-yellow-500" />;
    case "java": return <Code className="h-4 w-4 text-red-500" />;
    case "javascript": return <Code className="h-4 w-4 text-yellow-600" />;
    case "typescript": return <Code className="h-4 w-4 text-blue-500" />;
    case "c": return <Code className="h-4 w-4 text-blue-600" />;
    case "c++": return <Code className="h-4 w-4 text-purple-500" />;
    case "c#": return <Code className="h-4 w-4 text-purple-600" />;
    case "go": return <Code className="h-4 w-4 text-cyan-500" />;
    case "php": return <Code className="h-4 w-4 text-violet-500" />;
    case "ruby": return <Code className="h-4 w-4 text-red-600" />;
    case "html": return <Globe className="h-4 w-4 text-orange-500" />;
    case "css": return <Globe className="h-4 w-4 text-blue-400" />;
    case "sql": return <Database className="h-4 w-4 text-orange-600" />;
    default: return <FileCode className="h-4 w-4 text-muted-foreground" />;
  }
};

const getFileType = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
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
  };
  return typeMap[ext || ""] || "Unknown";
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
  };
  return langMap[ext || ""] || "Unknown";
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileCategory = (filename: string): { label: string; icon: typeof FileText; color: string } => {
  const lower = filename.toLowerCase();
  if (/\.test\.|\.spec\.|__tests__|__spec__/.test(lower)) {
    return { label: "Test", icon: TestTube, color: "text-blue-500 bg-blue-500/10" };
  }
  if (/\.config\.|config\.|settings\.|\.env|\.ya?ml|\.json|\.xml|\.toml|\.ini|\.conf/.test(lower)) {
    return { label: "Config", icon: Settings, color: "text-amber-500 bg-amber-500/10" };
  }
  const codeExts = [".py", ".java", ".js", ".ts", ".c", ".cpp", ".cc", ".cxx", ".cs", ".go", ".php", ".rb", ".html", ".css", ".sql"];
  const ext = "." + (filename.split(".").pop() || "").toLowerCase();
  if (codeExts.includes(ext)) {
    return { label: "Code", icon: FileCode, color: "text-emerald-500 bg-emerald-500/10" };
  }
  return { label: "File", icon: FileText, color: "text-muted-foreground bg-muted" };
};

const ProjectIntelligenceCard = ({ file, zipResult, isProcessing }: ProjectIntelligenceCardProps) => {
  if (!file && !zipResult) return null;

  // Single file mode
  if (file && !zipResult) {
    const language = getLanguageFromFilename(file.name);
    const fileType = getFileType(file.name);
    const category = getFileCategory(file.name);

    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            <span>File Information</span>
            {isProcessing && (
              <span className="ml-2 inline-flex items-center space-x-1 text-xs text-primary">
                <span className="animate-spin rounded-full border-2 border-primary/30 border-t-primary h-3 w-3"></span>
                <span>Processing...</span>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">File Name</p>
                <p className="font-mono text-sm truncate max-w-[200px]">{file.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              {getLanguageIcon(language)}
              <div>
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="font-mono text-sm capitalize">{language.toLowerCase()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Size</p>
                <p className="font-mono text-sm">{formatSize(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              {category.icon className={category.color.replace("bg-", "").replace("/10", "")} />
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-mono text-sm">{category.label}</p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-primary/10">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 text-xs rounded ${category.color} border`}>
                {category.icon}
                <span className="ml-1">{category.label}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {isProcessing ? "Analyzing..." : "Ready for analysis"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ZIP project mode
  if (zipResult) {
    const { files, totalFiles, codeFiles, testFiles, configFiles, languages } = zipResult;

    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <FolderOpen className="h-4 w-4 text-primary" />
            <span>Project Intelligence</span>
            {isProcessing && (
              <span className="ml-2 inline-flex items-center space-x-1 text-xs text-primary">
                <span className="animate-spin rounded-full border-2 border-primary/30 border-t-primary h-3 w-3"></span>
                <span>Extracting...</span>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">ZIP Name</p>
              <p className="text-2xl font-bold text-foreground">{file?.name || "Unknown Project"}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">ZIP Size</p>
              <p className="text-2xl font-bold text-emerald-600">{formatSize(file?.size || 0)}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Files</p>
              <p className="text-2xl font-bold text-emerald-600">{totalFiles}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Code Files</p>
              <p className="text-2xl font-bold text-emerald-600">{codeFiles}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg text-center border border-blue-500/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Test Files</p>
              <p className="text-2xl font-bold text-blue-600">{testFiles}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg text-center border border-amber-500/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Config Files</p>
              <p className="text-2xl font-bold text-amber-600">{configFiles}</p>
            </div>
          </div>

          {/* Detected languages */}
          {languages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Detected Languages</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="gap-1 px-2 py-1">
                    {getLanguageIcon(lang)}
                    <span className="text-xs">{lang}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* File breakdown */}
          <div className="pt-3 border-t border-primary/10">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">File Breakdown</p>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {Array.from(files.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([name, fileData]) => {
                  const category = getFileCategory(name);
                  const language = getLanguageFromFilename(name);
                  return (
                    <div
                      key={name}
                      className="flex items-center space-x-2 text-xs p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {getLanguageIcon(language)}
                      <span className="font-mono truncate flex-1 min-w-0">{name}</span>
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
                        {formatSize(fileData.size)}
                      </span>
                      {language !== "Unknown" && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-auto">
                          {language}
                        </Badge>
                      )}
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0.5 h-auto ${category.color.replace("bg-", "bg-").replace("/10", "/20")} border`}>
                        {category.label}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ProjectIntelligenceCard;