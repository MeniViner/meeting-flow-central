import { useEffect, useState } from "react";
import { FormatCard } from "../components/FormatCard";
import { FormatUpload } from "../components/FormatUpload";
import { formatService, Format } from "../services/formatService";
import { useApp } from "@/contexts/AppContext";
import { Button } from "../components/ui/button";
import { Plus, LayoutGrid, Table as TableIcon, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

const SORT_OPTIONS = [
  { value: "newest", label: "העלאה אחרונה" },
  { value: "oldest", label: "העלאה ראשונה" },
];

type ViewType = "table" | "grid";

export default function Formats() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [view, setView] = useState<ViewType>("table");
  const [sort, setSort] = useState("newest");
  const { user } = useApp();

  const isAdminOrEditor = user?.globalRole === "administrator" 
    || user?.globalRole === "editor" 
    || user?.globalRole === "owner";

  useEffect(() => {
    loadFormats();
  }, []);

  const loadFormats = async () => {
    try {
      const data = await formatService.getFormats();
      setFormats(data);
    } catch (error) {
      console.error("Failed to load formats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File, name: string) => {
    const newFormat = await formatService.uploadFormat(file, name);
    setFormats((prev) => [...prev, newFormat]);
    setIsUploadDialogOpen(false);
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
      <div className="flex justify-between items-center mb-8">
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

      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
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
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium">מיון לפי:</label>
            <select
              id="sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        
        <div className="min-h-[55vh]">
          <AnimatePresence mode="wait">
            {view === "table" ? (
              <motion.table
                key="table"
                className="w-full text-right"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 font-semibold">שם פורמט</th>
                    <th className="py-2 px-3 font-semibold">הועלה ע"י</th>
                    <th className="py-2 px-3 font-semibold">תאריך העלאה</th>
                    <th className="py-2 px-3 font-semibold">הורדה</th>
                  </tr>
                </thead>
                <tbody>
                  <ScrollArea>
                  <AnimatePresence>
                    {sortedFormats.map(format => (
                      <motion.tr
                        key={format.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="py-2 px-3">{format.name}</td>
                        <td className="py-2 px-3">{format.uploadedBy}</td>
                        <td className="py-2 px-3">{new Date(format.uploadDate).toLocaleDateString()}</td>
                        <td className="py-2 px-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(format.downloadUrl, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  </ScrollArea>
                </tbody>
              </motion.table>
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
    </div>
  );
} 