"use client";

import * as React from "react";
import {
  FileText,
  Bookmark,
  FileEdit,
  ExternalLink,
  Clock,
  Trash2,
  Edit2,
  Check,
  Plus,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Resource } from "@/types/database";
import { PDFViewer } from "@/components/shared/pdf-viewer";
import { SmartNotes } from "@/components/student/smart-notes";
import {
  VideoBookmark,
  getVideoBookmarks,
  deleteVideoBookmark,
} from "@/lib/storage/video-bookmarks";
import {
  TimestampNote,
  getTimestampNotes,
  updateTimestampNote,
  deleteTimestampNote,
} from "@/lib/storage/video-notes";
import { formatTimestamp } from "@/lib/storage/video-progress";

interface LectureResourcesPanelProps {
  contentId: string;
  contentTitle: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  pdfResources: Resource[];
  linkResources: Resource[];
  onSeekToTimestamp: (seconds: number) => void;
}

export function LectureResourcesPanel({
  contentId,
  contentTitle,
  subjectId,
  subjectName,
  subjectCode,
  pdfResources,
  linkResources,
  onSeekToTimestamp,
}: LectureResourcesPanelProps) {
  const [activeTab, setActiveTab] = React.useState<
    "materials" | "bookmarks" | "timestamp_notes" | "general_notes"
  >("materials");

  const [bookmarks, setBookmarks] = React.useState<VideoBookmark[]>([]);
  const [notes, setNotes] = React.useState<TimestampNote[]>([]);
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = React.useState<string>("");

  const refreshData = React.useCallback(() => {
    setBookmarks(getVideoBookmarks(contentId));
    setNotes(getTimestampNotes(contentId));
  }, [contentId]);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle delete bookmark
  const handleDeleteBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteVideoBookmark(contentId, id);
    refreshData();
    toast.info("تم حذف العلامة الزمنية");
  };

  // Handle delete note
  const handleDeleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteTimestampNote(contentId, id);
    refreshData();
    toast.info("تم حذف الملاحظة الزمنية");
  };

  // Handle edit note save
  const handleSaveEditNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editingNoteText.trim()) return;
    updateTimestampNote(contentId, id, editingNoteText);
    setEditingNoteId(null);
    refreshData();
    toast.success("تم تحديث الملاحظة");
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border/60">
      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("materials")}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "materials"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>المرفقات و PDF</span>
          {(pdfResources.length > 0 || linkResources.length > 0) && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "materials"
                  ? "bg-white/20 text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {pdfResources.length + linkResources.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            refreshData();
            setActiveTab("bookmarks");
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "bookmarks"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <Bookmark className="h-3.5 w-3.5 fill-current" />
          <span>العلامات الزمنية</span>
          {bookmarks.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "bookmarks"
                  ? "bg-white/20 text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {bookmarks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            refreshData();
            setActiveTab("timestamp_notes");
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "timestamp_notes"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>ملاحظات الفيديو</span>
          {notes.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "timestamp_notes"
                  ? "bg-white/20 text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {notes.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("general_notes")}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "general_notes"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <FileEdit className="h-3.5 w-3.5" />
          <span>الدفتر الذكي</span>
        </button>
      </div>

      {/* 1. Materials & PDFs Tab */}
      {activeTab === "materials" && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {pdfResources.length === 0 && linkResources.length === 0 ? (
            <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40">
              <FileText className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">لا توجد مذكرات أو ملفات مرفقة بهذه المحاضرة</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pdfResources.map((pdf) => (
                <PDFViewer key={pdf.id} url={pdf.url} title={pdf.title} />
              ))}

              {linkResources.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{link.title}</h4>
                      <p className="text-xs text-muted-foreground">رابط دراسي خارجي معتمد</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <span>فتح الرابط</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Timestamp Bookmarks Tab */}
      {activeTab === "bookmarks" && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>اضغط على أي علامة زمنية للانتقال مباشرة إلى المقطع في الفيديو</span>
            <span className="font-bold text-foreground">{bookmarks.length} علامات</span>
          </div>

          {bookmarks.length === 0 ? (
            <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-2">
              <Bookmark className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-xs font-bold text-foreground">لا توجد علامات زمنية محفوظة بعد</p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                يمكنك الضغط على زر «علامة زمنية» في مشغل الفيديو لحفظ النقاط الهامة في أي توقيت
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  onClick={() => onSeekToTimestamp(bm.timestamp)}
                  className="p-3.5 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/60 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold">
                      <PlayCircle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {bm.title}
                      </div>
                      <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        {formatTimestamp(bm.timestamp)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteBookmark(e, bm.id)}
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-70 group-hover:opacity-100"
                    title="حذف العلامة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Timestamp Notes Tab */}
      {activeTab === "timestamp_notes" && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>ملاحظاتك المسجلة ومرتبطة بدقائق الشرح في الفيديو</span>
            <span className="font-bold text-foreground">{notes.length} ملاحظات</span>
          </div>

          {notes.length === 0 ? (
            <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-2">
              <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-xs font-bold text-foreground">لا توجد ملاحظات زمنية حتى الآن</p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                أثناء مشاهدة المحاضرة، اضغط على «ملاحظة زمنية» لتدوين فكرة أو توضيح مرتبط بلحظة الشرح
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {notes.map((note) => {
                const isEditing = editingNoteId === note.id;

                return (
                  <Card
                    key={note.id}
                    className="rounded-2xl p-4 border-border/70 bg-card/60 backdrop-blur-sm space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onSeekToTimestamp(note.timestamp)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-xs font-bold hover:bg-sky-500/20 transition-colors cursor-pointer"
                        title="انتقل إلى هذا التوقيت في الفيديو"
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        <span>{formatTimestamp(note.timestamp)}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {!isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingNoteText(note.text);
                              }}
                              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                              title="تعديل الملاحظة"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDeleteNote(e, note.id)}
                              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-500"
                              title="حذف الملاحظة"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleSaveEditNote(e, note.id)}
                            className="h-7 px-2.5 rounded-lg text-xs font-bold text-emerald-600 hover:bg-emerald-500/10"
                          >
                            <Check className="h-3.5 w-3.5 ml-1" />
                            <span>حفظ</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <Textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        className="rounded-xl text-xs leading-relaxed"
                        rows={2}
                        autoFocus
                      />
                    ) : (
                      <p
                        onClick={() => onSeekToTimestamp(note.timestamp)}
                        className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap cursor-pointer hover:text-primary transition-colors"
                      >
                        {note.text}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Smart Notes Tab */}
      {activeTab === "general_notes" && (
        <div className="animate-in fade-in duration-200">
          <SmartNotes
            contentId={contentId}
            contentTitle={contentTitle}
            subjectId={subjectId}
            subjectName={subjectName}
            subjectCode={subjectCode}
          />
        </div>
      )}
    </div>
  );
}
