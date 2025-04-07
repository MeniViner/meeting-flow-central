
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!deadline) {
      newErrors.deadline = "Deadline is required";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Meeting Title *
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter meeting title"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide details about the meeting"
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Documents
        </label>
        <FileUploader
          onFilesChange={setDocuments}
          existingFiles={documents}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Deadline *
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !deadline && "text-muted-foreground",
                errors.deadline ? "border-red-500" : ""
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={deadline}
              onSelect={setDeadline}
              initialFocus
              disabled={(date) => date < new Date()}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {errors.deadline && (
          <p className="text-xs text-red-500">{errors.deadline}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            Submitting...
          </>
        ) : (
          "Submit Request"
        )}
      </Button>
    </form>
  );
}
