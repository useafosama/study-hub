"use client";

import * as React from "react";
import { 
  FileEdit, 
  Save, 
  Check, 
  Trash2, 
  Copy, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getNoteByContentId, saveLectureNote, deleteLectureNote } from "@/lib/storage/notes";

interface SmartNotesProps {
  contentId: string;
  contentTitle: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
}

export function SmartNotes({
  contentId,
  contentTitle,
  subjectId,
  subjectName,
  subjectCode,
}: SmartNotesProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [noteText, setNoteText] = React.useState("");
  const [isSaved, setIsSaved] = React.useState(false);
  const [lastSavedTime, setLastSavedTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    const existing = getNoteByContentId(contentId);
    if (existing && existing.text) {
      setNoteText(existing.text);
      setIsOpen(true);
      setLastSavedTime(new Date(existing.updatedAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }));
    }
  }, [contentId]);

  const handleSave = () => {
    if (!noteText.trim()) {
      deleteLectureNote(contentId);
      setIsSaved(false);
      setLastSavedTime(null);
      toast.info("تم مسح الملاحظة الفارغة");
      return;
    }

    const saved = saveLectureNote({
      contentId,
      contentTitle,
      subjectId,
      subjectName,
      subjectCode,
      text: noteText,
    });

    setIsSaved(true);
    setLastSavedTime(new Date(saved.updatedAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }));
    toast.success("تم حفظ ملاحظاتك بنجاح 📝");

    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopy = () => {
    if (!noteText) return;
    navigator.clipboard.writeText(noteText);
    toast.success("تم نسخ الملاحظات إلى الحافظة 📋");
  };

  const handleDownload = () => {
    if (!noteText) return;
    const element = document.createElement("a");
    const file = new Blob([`ملاحظات: ${contentTitle}\nالمادة: ${subjectName}\nالتاريخ: ${new Date().toLocaleDateString("ar-EG")}\n\n${noteText}`], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `ملاحظات_${contentTitle.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("تم تنزيل الملاحظات كملف نصي 💾");
  };

  const handleDelete = () => {
    if (confirm("هل أنت متأكد من رغبتك في حذف ملاحظات هذه المحاضرة؟")) {
      deleteLectureNote(contentId);
      setNoteText("");
      setLastSavedTime(null);
      toast.info("تم حذف الملاحظة");
    }
  };

  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card backdrop-blur-xl overflow-hidden shadow-xs">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <FileEdit className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                دفتر ملاحظاتي الذكي
              </h3>
              {noteText && (
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {lastSavedTime ? `آخر حفظ: ${lastSavedTime}` : "دوّن نقاطك وتلخيصاتك الهامة أثناء المشاهدة"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expandable Note Area */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 space-y-3.5 border-t border-border">
          <div className="relative mt-3">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب ملاحظاتك، القوانين، النقاط الهامة، أو أسئلتك هنا..."
              className="min-h-[140px] rounded-2xl bg-background/80 border-input focus:border-primary text-xs sm:text-sm leading-relaxed p-4 resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-1.5">
              {noteText && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="rounded-xl text-xs gap-1.5 h-8 border-border"
                    title="نسخ الملاحظات"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">نسخ</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="rounded-xl text-xs gap-1.5 h-8 border-border"
                    title="تنزيل كملف نصي"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">تنزيل TXT</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="rounded-xl text-xs text-rose-600 hover:bg-rose-500/10 h-8"
                    title="حذف الملاحظة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-1.5 h-8.5 px-4 shadow-xs"
            >
              {isSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              <span>{isSaved ? "تم الحفظ ✓" : "حفظ الملاحظة"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

