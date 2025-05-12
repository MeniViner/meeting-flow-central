import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface FormatUploadProps {
  onUpload: (file: File, name: string) => Promise<void>;
}

export function FormatUpload({ onUpload }: FormatUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) {
      toast({
        title: "Error",
        description: "Please provide both a file and a name for the format.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(file, name);
      setFile(null);
      setName("");
      toast({
        title: "Success",
        description: "Format uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload format. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Format Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter format name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">Format File</Label>
        <Input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>
      <Button type="submit" disabled={isUploading} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : "Add New Format"}
      </Button>
    </form>
  );
} 