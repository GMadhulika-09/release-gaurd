import { useState } from "react";
import UploadIntelligence from "@/components/UploadIntelligence";
import UploadSection from "@/components/UploadSection";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith(".zip")) {
        setZipFile(file);
      } else {
        setFile(file);
      }
    }
  };

  const handleZipSelect = (file: File) => {
    if (file.name.toLowerCase().endsWith(".zip")) {
      setZipFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <UploadSection 
        onFileSelect={handleFileSelect}
        onZipSelect={handleZipSelect}
      />
      <UploadIntelligence />
    </div>
  );
};

export default Upload;