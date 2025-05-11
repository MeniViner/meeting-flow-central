import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Document } from "@/types";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        url: file.name,
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

  const getFileColor = (type: string) => {
    if (type.includes('pdf')) return 'bg-red-100 text-red-800';
    if (type.includes('word') || type.includes('document')) return 'bg-blue-100 text-blue-800';
    if (type.includes('sheet') || type.includes('excel')) return 'bg-green-100 text-green-800';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'bg-purple-100 text-purple-800';
    if (type.includes('image')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
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
              <span className="font-semibold">לחץ להעלאה</span> או גרור לכאן קבצים
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
        <div className="space-y-2" >
          <h4 className="text-sm font-medium">קבצים שהועלו</h4>
          <ScrollArea className="h-[200px] p-2 rounded-md border" >
            <ul className="space-y-1 w-[200px]" dir="rtl" >
              {files.map((file) => (
                <li key={file.id} className="flex items-center   bg-background rounded-md border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4 text-red-500 " />
                    <span className="sr-only">הסר קובץ</span>
                  </Button>
                  <div className="flex items-center space-x-2">
                    <span  className={cn("text-sm truncate max-w-[200px] px-1 py-1 rounded", getFileColor(file.type))}>
                      {file.name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
