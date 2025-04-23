import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Document } from "@/types";
import { FileUploader } from "@/components/FileUploader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { he } from "date-fns/locale";

export function CreateRequestForm({ 
  onRequestCreated 
}: { 
  onRequestCreated?: () => void 
}) {
  const { submitRequest, isLoading } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<FileList | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = "נדרשת כותרת";
    }
    
    if (!deadline) {
      newErrors.deadline = "נדרש תאריך יעד";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await submitRequest({
        title,
        description,
        documents,
        deadline: deadline!,
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setDocuments([]);
      setDeadline(undefined);
      
      if (onRequestCreated) {
        onRequestCreated();
      }
    } catch (error) {
      console.error("Failed to submit request:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Right Column - Basic Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">כותרת פגישה *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="הזן כותרת פגישה"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">תאריך יעד *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !deadline && "text-muted-foreground",
                    errors.deadline ? "border-red-500" : ""
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP", { locale: he }) : "בחר תאריך"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  locale={he}
                  disabled={(date) => date < new Date()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.deadline && (
              <p className="text-xs text-red-500">{errors.deadline}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ספק פרטים על הפגישה"
              rows={4}
            />
          </div>
        </div>

        {/* Left Column - Documents */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>מסמכים</Label>
            <Card className="border-2 border-dashed p-6">
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                    לחץ להעלאה
                  </label>
                  {" או גרור לכאן קבצים"}
                </div>
                <div className="text-xs text-muted-foreground">
                  PDF, Word, Excel, PowerPoint, Images
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                />
              </div>
              {files && files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {Array.from(files).map((file, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות נוספות</Label>
            <Textarea
              id="notes"
              placeholder="הערות או דגשים נוספים"
              className="min-h-[120px]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner className="ml-2 h-4 w-4" />
              שולח...
            </>
          ) : (
            "שלח בקשה"
          )}
        </Button>
      </div>
    </form>
  );
}
