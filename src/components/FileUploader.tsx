
import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Document } from "@/types";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFilesChange: (files: Document[]) => void;
  existingFiles?: Document[];
  className?: string;
}

export function FileUploader({ 
  onFilesChange, 
  existingFiles = [], 
  className 
}: FileUploaderProps) {
  const [files, setFiles] = useState<Document[]>(existingFiles);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: Document[] = Array.from(e.target.files).map(file => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date()
      }));
      
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('presentation') || type.includes('powerpoint')) return '📽️';
    if (type.includes('image')) return '🖼️';
    return '📁';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-foreground/80">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, Word, Excel, PowerPoint, Images
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between p-2 bg-background rounded-md border">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getFileIcon(file.type)}</span>
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
