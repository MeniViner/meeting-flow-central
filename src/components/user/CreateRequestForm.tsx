// src/components/user/CreateRequestForm.tsx
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
import { useWorkspace } from "@/contexts/WorkspaceContext";
import ProfessionalTimePicker from '../ProfessionalTimePicker';

export function CreateRequestForm({ 
  onRequestCreated 
}: { 
  onRequestCreated?: () => void 
}) {
  const { submitRequest, isLoading } = useApp();
  const { currentWorkspace } = useWorkspace();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [preferredStartTime, setPreferredStartTime] = useState("");
  const [preferredEndTime, setPreferredEndTime] = useState("");
  const [timeError, setTimeError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = "נדרשת כותרת";
    }
    
    if (!deadline) {
      newErrors.deadline = "נדרש מועד מבוקש";
    }

    if (documents.length === 0) {
      newErrors.documents = "נדרש להעלות לפחות מסמך אחד";
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
        deadline: deadline!.toISOString(),
        preferredStartTime,
        preferredEndTime,
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setDocuments([]);
      setDeadline(undefined);
      setPreferredStartTime("");
      setPreferredEndTime("");
      
      if (onRequestCreated) {
        onRequestCreated();
      }
    } catch (error) {
      console.error("Failed to submit request:", error);
    }
  };

  // Helper to get current time in HH:mm format, rounded up to next 5 minutes
  function getCurrentTimeHHMM5() {
    const now = new Date();
    let minutes = now.getMinutes();
    let roundedMinutes = Math.ceil(minutes / 5) * 5;
    let hour = now.getHours();
    if (roundedMinutes === 60) {
      hour += 1;
      roundedMinutes = 0;
    }
    return `${hour.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl" data-tutorial="request-form">
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
              data-tutorial="request-form-title"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">מועד מבוקש *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !deadline && "text-muted-foreground",
                    errors.deadline ? "border-red-500" : ""
                  )}
                  data-tutorial="request-form-date"
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
                  disabled={{ before: new Date() }}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.deadline && (
              <p className="text-xs text-red-500">{errors.deadline}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">שעת התחלה רצויה</Label>
              <ProfessionalTimePicker
                id="startTime"
                label=""
                value={preferredStartTime}
                onChange={(newTime) => {
                  setPreferredStartTime(newTime);
                  if (preferredEndTime && newTime >= preferredEndTime) {
                    setPreferredEndTime("");
                  }
                }}
                disablePastTimes={!!deadline && (() => { const d = new Date(); return deadline.getDate() === d.getDate() && deadline.getMonth() === d.getMonth() && deadline.getFullYear() === d.getFullYear(); })()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">שעת סיום רצויה</Label>
              <ProfessionalTimePicker
                id="endTime"
                label=""
                value={preferredEndTime}
                onChange={(newTime) => {
                  setPreferredEndTime(newTime);
                }}
                disablePastTimes={!!deadline && (() => { const d = new Date(); return deadline.getDate() === d.getDate() && deadline.getMonth() === d.getMonth() && deadline.getFullYear() === d.getFullYear(); })()}
                minTime={preferredStartTime}
              />
            </div>
          </div>
          {timeError && (
            <div className="col-span-2 text-red-600 text-sm text-right mt-1">{timeError}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ספק פרטים על הפגישה"
              rows={9}
              data-tutorial="request-form-description"
            />
          </div>
        </div>

        {/* Left Column - Documents */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>מסמכים *</Label>
            <FileUploader 
              onFilesChange={setDocuments} 
              existingFiles={documents}
              data-tutorial="request-form-documents"
              sw={currentWorkspace}
            />
            {errors.documents && (
              <p className="text-xs text-red-500">{errors.documents}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="lg" 
          disabled={isLoading}
          data-tutorial="request-form-submit"
        >
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
