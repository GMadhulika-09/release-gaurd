import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface UploadSectionProps {
  onFileSelect: (files: File[]) => void;
  onZipSelect: (file: File) => void;
}

const UploadSection = ({ onFileSelect, onZipSelect }: UploadSectionProps) => {
  const [dragOver, setDragOver] = useState(false);

  const isZipFile = (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isZipByExtension = lowerName.endsWith(".zip");
    const isZipByMime = file.type.startsWith("application/zip");
    return isZipByExtension || isZipByMime;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isZipFile(file)) {
        onZipSelect(file);
      } else {
        onFileSelect(Array.from(files));
      }
    }
    setDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const file = files[0];
      if (isZipFile(file)) {
        onZipSelect(file);
      } else {
        onFileSelect(Array.from(files));
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h2 className="text-xl font-semibold text-muted-foreground mb-4">Upload Files</h2>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88 2.91l-.55.34a4 4 0 01-6.02-2.97l.35-.66A4 4 0 017 16zm0 0a4 4 0 01-4-4v7a4 4 0 004 4h8a4 4 0 004-4v-7a4 4 0 00-4-4zM16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports: Python, Java, JavaScript, TypeScript, C, C++, C#, Go, PHP, Ruby, HTML, CSS, SQL
              </p>
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Browse Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;