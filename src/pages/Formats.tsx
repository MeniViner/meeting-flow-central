// src/pages/Formats.tsx
import { useEffect, useState } from "react";
import { FormatCard } from "../components/FormatCard";
import { FormatUpload } from "../components/FormatUpload";
import { formatService, Format } from "../services/formatService";
import { useApp } from "@/contexts/AppContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "../components/ui/button";
import { Plus, LayoutGrid, Table as TableIcon, Download, Edit2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "../components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const SORT_OPTIONS = [
  { value: "newest", label: "העלאה אחרונה" },
  { value: "oldest", label: "העלאה ראשונה" },
];

type ViewType = "table" | "grid";

export default function Formats() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [editName, setEditName] = useState("");
  const [view, setView] = useState<ViewType>("table");
  const [sort, setSort] = useState("newest");
  const { user } = useApp();
  const { currentWorkspace } = useWorkspace();

  const isAdminOrEditor = user?.globalRole === "administrator" 
    || user?.globalRole === "editor" 
    || user?.globalRole === "owner";

  useEffect(() => {
    loadFormats();
  }, [currentWorkspace]);

  const loadFormats = async () => {
    try {
      const data = await formatService.getFormats(currentWorkspace);
      setFormats(data);
    } catch (error) {
      console.error("Failed to load formats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File, name: string) => {
    const newFormat = await formatService.uploadFormat(file, name, user, currentWorkspace);
    setFormats((prev) => [...prev, newFormat]);
    setIsUploadDialogOpen(false);
  };

  const handleEdit = async () => {
    if (!selectedFormat) return;
    try {
      const updatedFormat = await formatService.updateFormat(selectedFormat.id, editName, currentWorkspace);
      setFormats(prev => prev.map(format => 
        format.id === selectedFormat.id ? updatedFormat : format
      ));
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update format:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedFormat) return;
    try {
      await formatService.deleteFormat(selectedFormat.id, currentWorkspace);
      setFormats(prev => prev.filter(format => format.id !== selectedFormat.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete format:", error);
    }
  };

  const sortedFormats = [...formats].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    } else {
      return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-row-reverse justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">פורמטים</h1>
        {isAdminOrEditor && (
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                הוסף פורמט חדש
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>העלאת פורמט חדש</DialogTitle>
              </DialogHeader>
              <FormatUpload onUpload={handleUpload} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-card text-card-foreground rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <select
              id="sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-background text-foreground"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label htmlFor="sort" className="text-sm font-medium">מיון לפי:</label>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("table")}
              aria-label="Table view"
            >
              <TableIcon />
            </Button>
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid />
            </Button>
          </div>
        </div>

        
        <div className="min-h-[55vh]">
          <AnimatePresence mode="wait">
            {view === "table" ? (
              <motion.div
                key="table-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <ScrollArea className="h-[55vh] w-full">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-muted/50 text-muted-foreground">
                        <th className="py-2 px-3 font-semibold">שם פורמט</th>
                        <th className="py-2 px-3 font-semibold">הועלה ע"י</th>
                        <th className="py-2 px-3 font-semibold">תאריך העלאה</th>
                        <th className="py-2 px-3 font-semibold text-right">פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {sortedFormats.map(format => (
                          <motion.tr
                            key={format.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="border-b last:border-b-0 hover:bg-muted/70"
                          >
                            <td className="py-2 px-3">{format.name}</td>
                            <td className="py-2 px-3">{format.uploadedBy}</td>
                            <td className="py-2 px-3">{new Date(format.uploadDate).toLocaleDateString()}</td>
                            <td className="py-2 px-3">
                              <div className="flex gap-2 justify-end" >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => window.open(format.downloadUrl, '_blank')}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                {isAdminOrEditor && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedFormat(format);
                                        setEditName(format.name);
                                        setIsEditDialogOpen(true);
                                      }}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedFormat(format);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </ScrollArea>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <AnimatePresence>
                  {sortedFormats.map((format) => (
                    <motion.div
                      key={format.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FormatCard
                        name={format.name}
                        uploadDate={format.uploadDate}
                        uploadedBy={format.uploadedBy}
                        downloadUrl={format.downloadUrl}
                        onEdit={isAdminOrEditor ? () => {
                          setSelectedFormat(format);
                          setEditName(format.name);
                          setIsEditDialogOpen(true);
                        } : undefined}
                        onDelete={isAdminOrEditor ? () => {
                          setSelectedFormat(format);
                          setIsDeleteDialogOpen(true);
                        } : undefined}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {formats.length === 0 && (
            <div className="text-center text-muted-foreground mt-8">
              אין פורמטים זמינים כרגע.
            </div>
          )}
        </div>
        
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת פורמט</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                שם פורמט
              </label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleEdit}>שמור</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הפורמט לצמיתות ולא ניתן יהיה לשחזר אותו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 