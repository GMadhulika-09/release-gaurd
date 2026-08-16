import { useState, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Input,
} from '@/components/ui';
import { 
  Upload, 
  FileText, 
  Archive, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
} from 'lucide-react';
import { processFiles, ProcessedFileInfo } from '@/utils/fileInspection';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  label: string;
  onFilesProcessed: (files: ProcessedFileInfo[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  onFilesProcessed,
  accept = '*/*',
  multiple = true,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = useCallback(async (fileList: File[]) => {
    setFiles(fileList);
    setError(null);
    setIsProcessing(true);
    
    try {
      const processed = await processFiles(new FileList(fileList));
      setProcessedFiles(processed);
      onFilesProcessed(processed);
    } catch (err) {
      setError('Failed to process files. Please try again.');
      console.error('File processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [onFilesProcessed]);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newProcessed = [...processedFiles];
    newProcessed.splice(index, 1);
    setProcessedFiles(newProcessed);
    
    onFilesProcessed(newProcessed);
  };

  const clearAll = () => {
    setFiles([]);
    setProcessedFiles([]);
    onFilesProcessed([]);
  };

  if (isProcessing && processedFiles.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{label}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full border-4 border-primary/20 border-primary w-12 h-12 mb-4"></div>
          <p className="text-muted-foreground">Processing files...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-between cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-muted-foreground/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging ? (
            <>
              <Archive className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm font-medium">Release to upload files</p>
            </>
          ) : (
            <>
              {files.length > 0 ? (
                <>
                  <FileText className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">Drag & drop files here, or click to select</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported: code files, ZIP projects, TXT, MD, PDF, DOCX
                  </p>
                </>
              )}
              <Input
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
        </div>
        
        {processedFiles.length > 0 && (
          <div className="space-y-3">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <h3>File Details</h3>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {processedFiles.map((file, index) => (
                <div key={file.name} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium truncate max-w-xs">{file.name}</h4>
                    <div className="flex items-center space-x-2 text-xs">
                      {file.isCode && (
                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded">Code</span>
                      )}
                      {file.isTest && (
                        <span className="bg-warning/20 text-warning px-2 py-0.5 rounded">Test</span>
                      )}
                      {file.isConfig && (
                        <span className="bg-muted/20 text-muted-foreground px-2 py-0.5 rounded">Config</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-1 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>
                      <span>{file.language}</span>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={file.status.includes('Error') ? 'text-destructive' : 'text-success'}>
                        {file.status}
                      </span>
                    </div>
                  </div>
                  
                  {file.zipMetadata && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs text-muted-foreground">Project Stats:</div>
                      <div className="grid gap-2 mt-1">
                        <div>
                          <span className="font-medium">Files:</span>
                          <span>{file.zipMetadata.totalFiles}</span>
                        </div>
                        <div>
                          <span className="font-medium">Code:</span>
                          <span>{file.zipMetadata.codeFiles}</span>
                        </div>
                        <div>
                          <span className="font-medium">Tests:</span>
                          <span>{file.zipMetadata.testFiles}</span>
                        </div>
                        <div>
                          <span className="font-medium">Config:</span>
                          <span>{file.zipMetadata.configFiles}</span>
                        </div>
                      </div>
                      
                      {file.zipMetadata.languageBreakdown.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">Languages:</div>
                          <div className="flex flex-wrap gap-1">
                            {file.zipMetadata.languageBreakdown.map(lang => (
                              <span key={lang.language} className="bg-muted/20 text-muted-foreground px-2 py-0.5 rounded">
                                {lang.language} {lang.percentage}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-2 flex justify-end">
                    <button 
                      onClick={() => removeFile(index)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {processedFiles.length > 0 && (
          <button 
            onClick={clearAll}
            variant="outline"
            disabled={isProcessing}
          >
            Clear All
          </button>
        )}
      </CardFooter>
    </Card>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default FileUploader;