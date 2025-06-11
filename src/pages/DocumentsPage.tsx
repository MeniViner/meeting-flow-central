import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, File, FileImage, FileSpreadsheet, PresentationIcon, FileX, Table2, Grid, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateDisplay } from "@/components/DateDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";


export default function DocumentsPage() {
  const { requests, user } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const allDocuments = requests.flatMap(request => 
    request.documents.map(doc => ({
      ...doc,
      requestTitle: request.title,
      requestId: request.id,
      requestStatus: request.status,
      uploadedBy: doc.uploadedBy || request.requesterId,
    }))
  ).filter(doc => {
    if (user?.globalRole === 'owner' || user?.globalRole === 'administrator') {
      return true;
    }
    return doc.uploadedBy === user?.id;
  });
  
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

  const handleDownload = (doc: any) => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = doc.url; // Assuming doc.url contains the download URL
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">מסמכים</h1>
        <p className="text-muted-foreground">
          צפה ונהל את כל המסמכים הקשורים לפגישות
        </p>
      </div> */}
      
      <Tabs defaultValue="all" className="space-y-4" dir="rtl">
        <div className="flex items-center justify-between">
        <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <motion.div
                animate={{ scale: viewMode === 'grid' ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Grid className="h-4 w-4" />
              </motion.div>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <motion.div
                animate={{ scale: viewMode === 'table' ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Table2 className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>

          <TabsList>
            {documentTypes.map(type => (
              <TabsTrigger key={type.id} value={type.id}>
                <span className="flex items-center gap-1">
                  <span>{type.label}</span>
                  {type.id !== "all" && (
                    <motion.span 
                      className="text-muted-foreground"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      ({type.count || 0})
                    </motion.span>
                  )}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {documentTypes.map(type => (
          <TabsContent key={type.id} value={type.id}>
            <Card dir="rtl" className="min-h-[520px]">
              <CardHeader>
                <CardTitle>{type.label}</CardTitle>
                <CardDescription>
                  {type.id === "all" 
                    ? "כל המסמכים מבקשות הפגישה"
                    : ` כל ה${type.label} מבקשות הפגישה`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {((type.id === "all" && allDocuments.length === 0) || (type.id !== "all" && (!documentsByType[type.id] || documentsByType[type.id].length === 0))) ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-md border flex items-center justify-center min-h-[200px] px-4"
                  >
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        <FileX className="w-10 h-10 mb-3 text-gray-400" />
                      </motion.div>
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="text-lg font-medium"
                      >
                        לא נמצאו {type.label}
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="text-sm mt-1"
                      >
                        אין מסמכים מסוג {type.label} להצגה.
                        נסה לשנות את הסינון
                      </motion.p>
                    </div>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                      <motion.div 
                        key="grid"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      >
                        {(type.id === "all" ? allDocuments : documentsByType[type.id] || []).map((doc, index) => {
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
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.3 }}
                            >
                              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200" dir="rtl">
                                <motion.div 
                                  className={cn(
                                    "h-32 flex items-center justify-center",
                                    docType === "pdf" ? "bg-red-50" :
                                    docType === "word" ? "bg-blue-50" :
                                    docType === "excel" ? "bg-green-50" :
                                    docType === "powerpoint" ? "bg-orange-50" :
                                    docType === "image" ? "bg-purple-50" :
                                    "bg-gray-50"
                                  )}
                                  whileHover={{ scale: 1.02 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <IconComponent className={cn(
                                    "h-16 w-16",
                                    docType === "pdf" ? "text-red-500" :
                                    docType === "word" ? "text-blue-500" :
                                    docType === "excel" ? "text-green-500" :
                                    docType === "powerpoint" ? "text-orange-500" :
                                    docType === "image" ? "text-purple-500" :
                                    "text-gray-500"
                                  )} />
                                </motion.div>
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-medium truncate" title={doc.name}>
                                        {doc.name}
                                      </h3>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDownload(doc)}
                                        className="h-8 w-8"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      <p className="truncate">מקור: {doc.requestTitle}</p>
                                      <p className="flex items-center gap-1 text-xs mt-1">הועלה: <DateDisplay date={doc.uploadedAt} /></p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="table"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ScrollArea className="h-[410px] rounded-md border" dir="rtl">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="p-4 text-right font-medium">שם המסמך</th>
                                <th className="p-4 text-right font-medium">סוג</th>
                                <th className="p-4 text-right font-medium">מקור</th>
                                <th className="p-4 text-right font-medium">תאריך העלאה</th>
                                <th className="p-4 text-right font-medium">הורדה</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(type.id === "all" ? allDocuments : documentsByType[type.id] || []).map((doc, index) => {
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
                                  <motion.tr 
                                    key={doc.id} 
                                    className="border-b hover:bg-muted/50 transition-colors duration-200"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                  >
                                    <td className="p-4">
                                      <div className="flex items-center gap-2">
                                        <IconComponent className={cn(
                                          "h-5 w-5",
                                          docType === "pdf" ? "text-red-500" :
                                          docType === "word" ? "text-blue-500" :
                                          docType === "excel" ? "text-green-500" :
                                          docType === "powerpoint" ? "text-orange-500" :
                                          docType === "image" ? "text-purple-500" :
                                          "text-gray-500"
                                        )} />
                                        <span className="truncate max-w-[250px]" title={doc.name}>
                                          {doc.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <motion.span 
                                        className={cn(
                                          "px-2 py-1 rounded-full text-xs",
                                          docType === "pdf" ? "bg-red-100 text-red-700" :
                                          docType === "word" ? "bg-blue-100 text-blue-700" :
                                          docType === "excel" ? "bg-green-100 text-green-700" :
                                          docType === "powerpoint" ? "bg-orange-100 text-orange-700" :
                                          docType === "image" ? "bg-purple-100 text-purple-700" :
                                          "bg-gray-100 text-gray-700"
                                        )}
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        {docType}
                                      </motion.span>
                                    </td>
                                    <td className="p-4">
                                      <span className="truncate max-w-[250px]" title={doc.requestTitle}>
                                        {doc.requestTitle}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <DateDisplay date={doc.uploadedAt} />
                                    </td>
                                    <td className="p-4">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDownload(doc)}
                                        className="h-8 w-8"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </motion.tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </ScrollArea>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
