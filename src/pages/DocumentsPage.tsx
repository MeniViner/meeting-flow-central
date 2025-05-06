import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, File, FileImage, FileSpreadsheet, PresentationIcon, FileX } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateDisplay } from "@/components/DateDisplay";
import { motion } from "framer-motion"


export default function DocumentsPage() {
  const { requests } = useApp();
  
  const allDocuments = requests.flatMap(request => 
    request.documents.map(doc => ({
      ...doc,
      requestTitle: request.title,
      requestId: request.id,
      requestStatus: request.status,
    }))
  );
  
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
    if (type === "powerpoint") return PresentationIcon;
    if (type === "image") return FileImage;
    return FileText;
  };
  
  const documentTypes = [
    { id: "all", label: "כל המסמכים" },
    { id: "pdf", label: "קבצי PDF", count: documentsByType.pdf?.length || 0 },
    { id: "word", label: "מסמכי Word", count: documentsByType.word?.length || 0 },
    { id: "excel", label: "גליונות Excel", count: documentsByType.excel?.length || 0 },
    { id: "powerpoint", label: "מצגות", count: documentsByType.powerpoint?.length || 0 },
    { id: "image", label: "תמונות", count: documentsByType.image?.length || 0 },
    { id: "other", label: "קבצים אחרים", count: documentsByType.other?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">מסמכים</h1>
        <p className="text-muted-foreground">
          צפה ונהל את כל המסמכים הקשורים לפגישות
        </p>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
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
                    ? "כל המסמכים מבקשות פגישה"
                    : `כל ${type.label} מבקשות פגישה`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {type.id === "all" && allDocuments.length === 0 && (
                <div className="rounded-md border flex items-center justify-center min-h-[200px] px-4" >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center"
                  >
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
                      <FileX className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="text-lg font-medium">לא הועלו מסמכים עדיין</p>
                      <p className="text-sm mt-1">תוכל להעלות מסמך דרך בקשות הפגישה</p>
                    </div>
                  </motion.div>
                </div>
                
                )}
                
                {type.id !== "all" && (!documentsByType[type.id] || documentsByType[type.id].length === 0) && (
                  <p className="text-center py-12 text-muted-foreground">
                    לא הועלו {type.label} עדיין.
                  </p>
                )}
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                          <div className="space-y-2">
                            <h3 className="font-medium truncate" title={doc.name}>
                              {doc.name}
                            </h3>
                            <div className="text-sm text-muted-foreground">
                              <p className="truncate">מקור: {doc.requestTitle}</p>
                              <p className="text-xs mt-1">הועלה: <DateDisplay date={doc.uploadedAt} /></p>
                            </div>
                          </div>
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
