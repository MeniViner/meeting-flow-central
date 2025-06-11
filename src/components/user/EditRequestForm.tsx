import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MeetingRequest, Document } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useApp } from "@/contexts/AppContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { CalendarIcon, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { FileUploader } from "@/components/FileUploader";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const formSchema = z.object({
  title: z.string().min(1, "כותרת הבקשה היא שדה חובה"),
  description: z.string().optional(),
  deadline: z.date({
    required_error: "מועד מבוקש הוא שדה חובה",
  }),
});

interface EditRequestFormProps {
  request: MeetingRequest;
  onRequestUpdated: () => void;
}

export function EditRequestForm({ request, onRequestUpdated }: EditRequestFormProps) {
  const { toast } = useToast();
  const { updateRequest } = useApp();
  const { currentWorkspace } = useWorkspace();
  const [title, setTitle] = useState(request.title);
  const [description, setDescription] = useState(request.description);
  const [documents, setDocuments] = useState<Document[]>(request.documents);
  const [deadline, setDeadline] = useState<Date | undefined>(request.deadline ? new Date(request.deadline) : undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: request.title,
      description: request.description || "",
      deadline: new Date(request.deadline),
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateRequest(request.id, {
        ...request,
        title,
        description,
        deadline: deadline?.toISOString(),
        documents,
      });
      onRequestUpdated();
    } catch (error) {
      console.error("Failed to update request:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את הבקשה",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">מועד מבוקש *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !deadline && "text-muted-foreground"
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
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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
              <FileUploader onFilesChange={setDocuments} existingFiles={documents} sw={currentWorkspace} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onRequestUpdated}
          >
            ביטול
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner className="ml-2 h-4 w-4" />
                שומר...
              </>
            ) : (
              "שמור שינויים"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 