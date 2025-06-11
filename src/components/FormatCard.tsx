// src/components/FormatCard.tsx
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Download, Edit2, Trash2 } from "lucide-react";

interface FormatCardProps {
  name: string;
  uploadDate: string;
  uploadedBy: string;
  downloadUrl: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function FormatCard({ name, uploadDate, uploadedBy, downloadUrl, onEdit, onDelete }: FormatCardProps) {
  return (
    <Card className="w-full bg-card text-card-foreground border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Uploaded by: {uploadedBy}
          </p>
          <p className="text-sm text-muted-foreground">
            Upload date: {new Date(uploadDate).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 flex-row-reverse">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => window.open(downloadUrl, '_blank')}
        >
          <Download className="mr-2 h-2 w-2" />
        </Button>
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 