"use client";

import * as React from "react";
import Link from "next/link";
import { 
  FileText, 
  Search, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Download, 
  BookOpen, 
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getStoredNotes, deleteLectureNote, LectureNote } from "@/lib/storage/notes";

export default function StudentNotesPage() {
  const [notes, setNotes] = React.useState<LectureNote[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState<string>("all");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setNotes(getStoredNotes());
  }, []);

  const handleDelete = (contentId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الملاحظة؟")) {
      deleteLectureNote(contentId);
      setNotes(getStoredNotes());
      toast.info("تم حذف الملاحظة");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الملاحظات إلى الحافظة 📋");
  };

  const handleExportAll = () => {
    if (notes.length === 0) return;
    const content = notes
      .map(
        (n) =>
          `====================================\nالمحاضرة: ${n.contentTitle}\nالمادة: ${n.subjectName} (${n.subjectCode})\nالتاريخ: ${new Date(n.updatedAt).toLocaleDateString("ar-EG")}\n====================================\n\n${n.text}\n\n`
      )
      .join("\n");

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `كافة_ملاحظاتي_منصة_الچوو_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("تم تصدير كافة الملاحظات بنجاح 💾");
  };

  if (!mounted) {
    return null;
  }

  // Get unique subjects
  const subjects = Array.from(new Set(notes.map((n) => n.subjectName)));

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.contentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subjectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === "all" || n.subjectName === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              دفتر ملاحظاتي الشامل
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {notes.length} ملاحظة
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            جميع الملاحظات والملخصات التي قمت بتدوينها أثناء دراسة المحاضرات
          </p>
        </div>

        {notes.length > 0 && (
          <Button
            onClick={handleExportAll}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-2 shadow-xs shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>تصدير كل الملاحظات (TXT)</span>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      {notes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في نصوص الملاحظات أو اسم المحاضرة..."
              className="pr-10 rounded-2xl bg-card border-input text-xs"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Subject Filter Pills */}
          {subjects.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedSubject("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                الكل ({notes.length})
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubject === sub
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Grid or Empty State */}
      {notes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card/50 space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            لا توجد أي ملاحظات مسجلة بعد
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            عند مشاهدتك لأي محاضرة، افتح "دفتر ملاحظاتي الذكي" واكتب تلخيصك ليتم حفظه هنا تلقائياً.
          </p>
          <Button asChild className="rounded-xl mt-2 text-xs">
            <Link href="/subjects">تصفح المقررات للبدء</Link>
          </Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-border bg-card text-xs text-muted-foreground">
          لا توجد ملاحظات مطابقة لبحثك "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-3xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:border-primary/40 hover:shadow-md transition-all text-right"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                    {note.subjectCode}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                    {note.contentTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{note.subjectName}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {note.text}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/60">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(note.text)}
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                    title="نسخ الملاحظة"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(note.contentId)}
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-rose-600"
                    title="حذف الملاحظة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1.5 h-8 border-border"
                >
                  <Link href={`/content/${note.contentId}`}>
                    <span>فتح المحاضرة</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

