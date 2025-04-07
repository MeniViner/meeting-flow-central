
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, File, FileImage, FileSpreadsheet, FilePresentation } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateDisplay } from "@/components/DateDisplay";

export default function DocumentsPage() {
  const { requests } = useApp();
  
  // Extract all documents from all requests
  const allDocuments = requests.flatMap(request => 
    request.documents.map(doc => ({
      ...doc,
      requestTitle: request.title,
      requestId: request.id,
      requestStatus: request.status,
    }))
  );
  
  // Group documents by type
  const documentsByType = allDocuments.reduce((acc, doc) => {
    let type = "other";
    
    if (doc.type.includes("pdf")) type = "pdf";
    else if (doc.type.includes("word") || doc.type.includes("document")) type = "word";
    else if (doc.type.includes("sheet") || doc.type.includes("excel")) type = "excel";
    else if (doc.type.includes("presentation") || doc.type.includes("powerpoint")) type = "powerpoint";
    else if (doc.type.includes("image")) type = "image";
    
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, any[]>);
  
  const getDocumentIcon = (type: string) => {
    if (type === "pdf") return FileText;
    if (type === "word") return File;
    if (type === "excel") return FileSpreadsheet;
    if (type === "powerpoint") return FilePresentation;
    if (type === "image") return FileImage;
    return FileText;
  };
  
  const documentTypes = [
    { id: "all", label: "All Documents" },
    { id: "pdf", label: "PDF Files", count: documentsByType.pdf?.length || 0 },
    { id: "word", label: "Word Documents", count: documentsByType.word?.length || 0 },
    { id: "excel", label: "Excel Spreadsheets", count: documentsByType.excel?.length || 0 },
    { id: "powerpoint", label: "Presentations", count: documentsByType.powerpoint?.length || 0 },
    { id: "image", label: "Images", count: documentsByType.image?.length || 0 },
    { id: "other", label: "Other Files", count: documentsByType.other?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          View and manage all meeting-related documents
        </p>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          {documentTypes.map(type => (
            <TabsTrigger key={type.id} value={type.id}>
              {type.label} {type.id !== "all" && `(${type.count || 0})`}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {documentTypes.map(type => (
          <TabsContent key={type.id} value={type.id}>
            <Card>
              <CardHeader>
                <CardTitle>{type.label}</CardTitle>
                <CardDescription>
                  {type.id === "all" 
                    ? "All documents from meeting requests"
                    : `All ${type.label.toLowerCase()} from meeting requests`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {type.id === "all" && allDocuments.length === 0 && (
                  <p className="text-center py-12 text-muted-foreground">
                    No documents have been uploaded yet.
                  </p>
                )}
                
                {type.id !== "all" && (!documentsByType[type.id] || documentsByType[type.id].length === 0) && (
                  <p className="text-center py-12 text-muted-foreground">
                    No {type.label.toLowerCase()} have been uploaded yet.
                  </p>
                )}
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(type.id === "all" ? allDocuments : documentsByType[type.id] || []).map((doc) => {
                    const docType = type.id === "all" 
                      ? (doc.type.includes("pdf") 
                          ? "pdf" 
                          : doc.type.includes("word") || doc.type.includes("document")
                          ? "word"
                          : doc.type.includes("sheet") || doc.type.includes("excel")
                          ? "excel"
                          : doc.type.includes("presentation") || doc.type.includes("powerpoint")
                          ? "powerpoint"
                          : doc.type.includes("image")
                          ? "image"
                          : "other")
                      : type.id;
                    
                    const IconComponent = getDocumentIcon(docType);
                    
                    return (
                      <Card key={doc.id} className="overflow-hidden">
                        <div className={cn(
                          "h-32 flex items-center justify-center",
                          docType === "pdf" ? "bg-red-50" :
                          docType === "word" ? "bg-blue-50" :
                          docType === "excel" ? "bg-green-50" :
                          docType === "powerpoint" ? "bg-orange-50" :
                          docType === "image" ? "bg-purple-50" :
                          "bg-gray-50"
                        )}>
                          <IconComponent className={cn(
                            "h-16 w-16",
                            docType === "pdf" ? "text-red-500" :
                            docType === "word" ? "text-blue-500" :
                            docType === "excel" ? "text-green-500" :
                            docType === "powerpoint" ? "text-orange-500" :
                            docType === "image" ? "text-purple-500" :
                            "text-gray-500"
                          )} />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium truncate" title={doc.name}>
                            {doc.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            From: {doc.requestTitle}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Uploaded: <DateDisplay date={doc.uploadedAt} />
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
