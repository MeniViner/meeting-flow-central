import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Download } from "lucide-react";

interface FormatCardProps {
  name: string;
  uploadDate: string;
  uploadedBy: string;
  downloadUrl: string;
}

export function FormatCard({ name, uploadDate, uploadedBy, downloadUrl }: FormatCardProps) {
  return (
    <Card className="w-full">
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
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => window.open(downloadUrl, '_blank')}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Format
        </Button>
      </CardFooter>
    </Card>
  );
} 