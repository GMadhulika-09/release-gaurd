import JSZip from "jszip";

export interface FileChange {
  fileName: string;
  status: "Added" | "Modified" | "Deleted" | "Unchanged";
  previousSize: number | null;
  currentSize: number | null;
  contentComparisonAvailable: boolean;
}

export interface ComparisonResult {
  changes: FileChange[];
  summary: {
    added: number;
    modified: number;
    deleted: number;
    unchanged: number;
  };
  hasDifferences: boolean;
}

export interface ReleaseFile {
  name: string;
  content: string;
  size: number;
}

export interface ReleaseData {
  name: string;
  files: Map<string, ReleaseFile>;
}

export interface ZipExtractionResult {
  files: Map<string, ReleaseFile>;
  totalFiles: number;
  codeFiles: number;
  testFiles: number;
  configFiles: number;
  languages: string[];
}

function getFileType(filename: string): string {
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
  };
  return typeMap[ext || ""] || "Unknown";
}

export async function extractZipInfo(file: File): Promise<ZipExtractionResult> {
  const zip = await JSZip.loadAsync(file);
  const files = new Map<string, ReleaseFile>();

  const entries = Object.values(zip.files).filter((e) => !e.dir);
  const codeExtensions = [
    ".py", ".java", ".js", ".ts", ".c", ".cpp", ".cc", ".cxx",
    ".cs", ".go", ".php", ".rb", ".html", ".css", ".sql",
  ];
  const testPattern = /test|spec/i;

  let codeFiles = 0;
  let testFiles = 0;
  let configFiles = 0;
  const languages = new Set<string>();

  for (const entry of entries) {
    const ext = "." + (entry.name.split(".").pop() || "").toLowerCase();
    if (testPattern.test(entry.name)) {
      testFiles++;
    } else if (codeExtensions.includes(ext)) {
      codeFiles++;
      languages.add(getFileType(entry.name));
    } else if (
      [".json", ".yaml", ".yml", ".xml", ".env", ".toml", ".ini", ".conf"].includes(ext)
    ) {
      configFiles++;
    }

    try {
      const content = await entry.async("text");
      files.set(entry.name, {
        name: entry.name,
        content,
        size: content.length,
      });
    } catch {
      files.set(entry.name, {
        name: entry.name,
        content: "",
        size: 0,
      });
    }
  }

  return {
    files,
    totalFiles: entries.length,
    codeFiles,
    testFiles,
    configFiles,
    languages: Array.from(languages),
  };
}

export async function readFileContent(file: File): Promise<ReleaseFile> {
  try {
    const content = await file.text();
    return {
      name: file.name,
      content,
      size: file.size,
    };
  } catch {
    return {
      name: file.name,
      content: "",
      size: file.size,
    };
  }
}

export function compareReleases(
  previous: ReleaseData,
  current: ReleaseData
): ComparisonResult {
  const changes: FileChange[] = [];
  const allFileNames = new Set([...previous.files.keys(), ...current.files.keys()]);

  let added = 0;
  let modified = 0;
  let deleted = 0;
  let unchanged = 0;

  for (const fileName of allFileNames) {
    const prevFile = previous.files.get(fileName);
    const currFile = current.files.get(fileName);

    if (!prevFile && currFile) {
      const hasContent = currFile.content !== "";
      changes.push({
        fileName,
        status: "Added",
        previousSize: null,
        currentSize: currFile.size,
        contentComparisonAvailable: hasContent,
      });
      added++;
    } else if (prevFile && !currFile) {
      const hasContent = prevFile.content !== "";
      changes.push({
        fileName,
        status: "Deleted",
        previousSize: prevFile.size,
        currentSize: null,
        contentComparisonAvailable: hasContent,
      });
      deleted++;
    } else if (prevFile && currFile) {
      const hasContent = prevFile.content !== "" || currFile.content !== "";
      const contentChanged = hasContent && prevFile.content !== currFile.content;
      const sizeChanged = prevFile.size !== currFile.size;

      if (contentChanged || sizeChanged) {
        changes.push({
          fileName,
          status: "Modified",
          previousSize: prevFile.size,
          currentSize: currFile.size,
          contentComparisonAvailable: hasContent,
        });
        modified++;
      } else {
        changes.push({
          fileName,
          status: "Unchanged",
          previousSize: prevFile.size,
          currentSize: currFile.size,
          contentComparisonAvailable: hasContent,
        });
        unchanged++;
      }
    }
  }

  const statusOrder: Record<string, number> = {
    Added: 0,
    Modified: 1,
    Deleted: 2,
    Unchanged: 3,
  };
  changes.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return {
    changes,
    summary: { added, modified, deleted, unchanged },
    hasDifferences: added + modified + deleted > 0,
  };
}