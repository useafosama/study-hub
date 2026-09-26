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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              دفتر ملاحظاتي الشامل
            </h1>
            <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400">
              {notes.length} ملاحظة
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            جميع الملاحظات والملخصات التي قمت بتدوينها أثناء دراسة المحاضرات
          </p>
        </div>

        {notes.length > 0 && (
          <Button
            onClick={handleExportAll}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-2 shadow-sm shrink-0"
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
              className="pr-10 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>

          {/* Subject Filter Pills */}
          {subjects.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedSubject("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubject === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                الكل ({notes.length})
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSubject === sub
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
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
        <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            لا توجد أي ملاحظات مسجلة بعد
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            عند مشاهدتك لأي محاضرة، افتح "دفتر ملاحظاتي الذكي" واكتب تلخيصك ليتم حفظه هنا تلقائياً.
          </p>
          <Button asChild className="rounded-xl mt-2 text-xs">
            <Link href="/subjects">تصفح المقررات للبدء</Link>
          </Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-500">
          لا توجد ملاحظات مطابقة لبحثك "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all text-right"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                    {note.subjectCode}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(note.updatedAt).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {note.contentTitle}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{note.subjectName}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {note.text}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(note.text)}
                    className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    title="نسخ الملاحظة"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(note.contentId)}
                    className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                    title="حذف الملاحظة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1.5 h-8 border-zinc-200 dark:border-zinc-800"
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
