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

const formSchema = z.object({
  title: z.string().min(1, "כותרת הבקשה היא שדה חובה"),
  description: z.string().optional(),
  deadline: z.date({
    required_error: "תאריך יעד הוא שדה חובה",
  }),
});

interface EditRequestFormProps {
  request: MeetingRequest;
  onRequestUpdated: () => void;
}

export function EditRequestForm({ request, onRequestUpdated }: EditRequestFormProps) {
  const { toast } = useToast();
  const { updateRequest } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(request.documents || []);
  const [files, setFiles] = useState<FileList | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: request.title,
      description: request.description || "",
      deadline: new Date(request.deadline),
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    if (files) {
      const dt = new DataTransfer();
      Array.from(files).forEach((file, i) => {
        if (i !== index) dt.items.add(file);
      });
      setFiles(dt.files);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // Convert new files to documents
      const newDocuments: Document[] = files ? Array.from(files).map(file => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: file.name, // Store only the file name
        type: file.type,
        uploadedAt: new Date()
      })) : [];

      // Combine existing and new documents
      const updatedDocuments = [...documents, ...newDocuments];

      await updateRequest(request.id, {
        ...request,
        ...values,
        documents: updatedDocuments,
        deadline: values.deadline.toISOString(),
      });
      
      toast({
        title: "הבקשה עודכנה בהצלחה",
        description: "השינויים נשמרו במערכת",
      });
      
      onRequestUpdated();
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון הבקשה",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Right Column - Basic Details */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת פגישה *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="הזן כותרת פגישה" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>תאריך יעד *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: he })
                          ) : (
                            <span>בחר תאריך</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={he}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="ספק פרטים על הפגישה" rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <div className="text-sm font-medium">קבצים חדשים:</div>
                    {Array.from(files).map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNewFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium">מסמכים קיימים:</div>
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="truncate">{doc.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
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