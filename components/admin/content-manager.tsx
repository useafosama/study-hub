"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContentWithResourcesAction,
  updateContentWithResourcesAction,
  deleteContentAction,
  toggleContentPublishAction,
  reorderContentAction,
} from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { extractYouTubeVideoId, isValidHttpUrl } from "@/lib/youtube/utils";
import { toast } from "sonner";
import {
  ChevronRight,
  Plus,
  Video,
  FileText,
  Link as LinkIcon,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers,
  BookOpen,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Subject, Content, Resource } from "@/types/database";

interface ContentManagerProps {
  subject: Subject;
  initialContents: Content[];
}

export function ContentManager({ subject, initialContents }: ContentManagerProps) {
  const router = useRouter();
  const [contents, setContents] = React.useState<Content[]>(initialContents);
  const [activeTab, setActiveTab] = React.useState<"all" | "lecture" | "section">("all");

  React.useEffect(() => {
    setContents(initialContents);
  }, [initialContents]);

  // Modal states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<Content | null>(null);
  const [contentTypeToAdd, setContentTypeToAdd] = React.useState<"lecture" | "section">("lecture");
  const [isPending, setIsPending] = React.useState(false);

  // Dynamic Multi-Video state
  const [videos, setVideos] = React.useState<{ id: string; title: string; url: string }[]>([
    { id: "1", title: "مقطع فيديو الشرح", url: "" },
  ]);

  const filteredContents = contents.filter((c) => {
    if (activeTab === "all") return true;
    return c.type === activeTab;
  });

  const lectures = contents.filter((c) => c.type === "lecture");
  const sections = contents.filter((c) => c.type === "section");

  const handleOpenAdd = (type: "lecture" | "section" = "lecture") => {
    setContentTypeToAdd(type);
    setVideos([{ id: "1", title: "مقطع فيديو الشرح (الجزء 1)", url: "" }]);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (content: Content) => {
    setSelectedContent(content);
    const existingVideos = content.resources
      ?.filter((r) => r.type === "video")
      .map((r, i) => ({
        id: r.id || `${Date.now()}_${i}`,
        title: r.title || `فيديو ${i + 1}`,
        url: r.url,
      })) || [];

    setVideos(
      existingVideos.length > 0
        ? existingVideos
        : [{ id: "1", title: "مقطع فيديو الشرح", url: "" }]
    );
    setIsEditOpen(true);
  };

  const handleAddVideoField = () => {
    setVideos((prev) => [
      ...prev,
      {
        id: `${Date.now()}_${prev.length + 1}`,
        title: `الجزء ${prev.length + 1}`,
        url: "",
      },
    ]);
  };

  const handleRemoveVideoField = (id: string) => {
    setVideos((prev) => (prev.length > 1 ? prev.filter((v) => v.id !== id) : prev));
  };

  const handleUpdateVideoField = (id: string, field: "title" | "url", value: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleOpenDelete = (content: Content) => {
    setSelectedContent(content);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.append("subject_id", subject.id);
    formData.append("type", contentTypeToAdd);

    // Filter valid videos with non-empty URL
    const validVideos = videos.filter((v) => v.url.trim().length > 0);
    formData.append("videos_json", JSON.stringify(validVideos));

    try {
      const res = await createContentWithResourcesAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsAddOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("حدث خطأ أثناء إضافة المحتوى");
    } finally {
      setIsPending(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedContent) return;
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.append("id", selectedContent.id);
    formData.append("subject_id", subject.id);

    const validVideos = videos.filter((v) => v.url.trim().length > 0);
    formData.append("videos_json", JSON.stringify(validVideos));

    try {
      const res = await updateContentWithResourcesAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsEditOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("حدث خطأ أثناء تحديث المحتوى");
    } finally {
      setIsPending(false);
    }
  };

  const handleTogglePublish = async (content: Content) => {
    try {
      const res = await toggleContentPublishAction(content.id, content.is_published, subject.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        router.refresh();
      }
    } catch {
      toast.error("فشل تغيير حالة النشر");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContent) return;
    setIsPending(true);
    try {
      const res = await deleteContentAction(selectedContent.id, subject.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsDeleteOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("فشل حذف المحتوى");
    } finally {
      setIsPending(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= contents.length) return;

    const newOrder = [...contents];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    setContents(newOrder);

    try {
      await reorderContentAction(newOrder.map((c) => c.id), subject.id);
      toast.success("تم تحديث ترتيب المحتوى");
    } catch {
      toast.error("فشل حفظ الترتيب");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/subjects" className="hover:text-foreground transition-colors">
          المواد الدراسية
        </Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <span className="font-semibold text-foreground truncate">
          {subject.name}
        </span>
      </div>

      {/* Subject Header Card */}
      <Card className="apple-card p-6 bg-gradient-to-l from-primary/5 to-card/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs uppercase">
                {subject.code}
              </Badge>
              {subject.is_published ? (
                <Badge variant="success">منشور للطلاب</Badge>
              ) : (
                <Badge variant="secondary">مسودة (مخفي)</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {subject.name}
            </h1>
            {subject.description && (
              <p className="text-xs text-muted-foreground max-w-2xl">
                {subject.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => handleOpenAdd("lecture")} size="sm" className="rounded-xl shadow-sm gap-1.5">
              <Plus className="h-4 w-4" />
              <span>إضافة محاضرة</span>
            </Button>
            <Button onClick={() => handleOpenAdd("section")} variant="outline" size="sm" className="rounded-xl gap-1.5">
              <Plus className="h-4 w-4" />
              <span>إضافة سكشن</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        <Button
          variant={activeTab === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("all")}
          className="rounded-xl text-xs"
        >
          كل المحتوى ({contents.length})
        </Button>
        <Button
          variant={activeTab === "lecture" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("lecture")}
          className="rounded-xl text-xs gap-1.5"
        >
          <Video className="h-3.5 w-3.5" />
          <span>المحاضرات ({lectures.length})</span>
        </Button>
        <Button
          variant={activeTab === "section" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("section")}
          className="rounded-xl text-xs gap-1.5"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>الأقسام والسكاشن ({sections.length})</span>
        </Button>
      </div>

      {/* Contents List */}
      {filteredContents.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="لا يوجد محتوى مضاف حتى الآن"
          description="ابدأ بإضافة محاضرات أو سكاشن مع روابط الفيديو الخارجية وملفات PDF"
          action={
            <div className="flex items-center gap-2">
              <Button onClick={() => handleOpenAdd("lecture")} size="sm" className="rounded-xl">
                إضافة أول محاضرة
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredContents.map((content, index) => {
            const videoResources = content.resources?.filter((r) => r.type === "video") || [];
            const pdfResources = content.resources?.filter((r) => r.type === "pdf") || [];
            const linkResources = content.resources?.filter((r) => r.type === "link") || [];

            return (
              <Card
                key={content.id}
                className="apple-card p-4 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Info and resources preview */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md p-0 hover:bg-secondary/60 text-muted-foreground"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      title="تحريك لأعلى"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md p-0 hover:bg-secondary/60 text-muted-foreground"
                      disabled={index === filteredContents.length - 1}
                      onClick={() => handleMove(index, "down")}
                      title="تحريك لأسفل"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={content.type === "lecture" ? "default" : "purple"}
                        className="text-[10px]"
                      >
                        {content.type === "lecture" ? "محاضرة" : "سكشن / قسم"}
                      </Badge>
                      <span className="font-bold text-sm text-foreground truncate">
                        {content.title}
                      </span>
                      {content.is_published ? (
                        <Badge variant="success" className="text-[10px]">منشور</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">مخفي</Badge>
                      )}
                    </div>

                    {content.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {content.description}
                      </p>
                    )}

                    {/* Resources attached badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {videoResources.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-medium border border-red-500/20">
                          <Video className="h-3 w-3" />
                          <span>
                            {videoResources.length === 1
                              ? "فيديو YouTube"
                              : `${videoResources.length} فيديوهات`}
                          </span>
                        </span>
                      )}
                      {pdfResources.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
                          <FileText className="h-3 w-3" />
                          <span>
                            {pdfResources.length === 1
                              ? "ملف PDF"
                              : `${pdfResources.length} ملفات PDF`}
                          </span>
                        </span>
                      )}
                      {linkResources.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20">
                          <LinkIcon className="h-3 w-3" />
                          <span>رابط خارجي</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(content)}
                    className="h-8 rounded-xl text-xs gap-1.5"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>تعديل</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => handleTogglePublish(content)} className="gap-2">
                        {content.is_published ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                            <span>إخفاء المحتوى</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 text-emerald-500" />
                            <span>نشر المحتوى</span>
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => handleOpenDelete(content)} destructive className="gap-2">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>حذف المحتوى</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Add Content */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              إضافة {contentTypeToAdd === "lecture" ? "محاضرة جديدة" : "سكشن جديد"}
            </DialogTitle>
            <DialogDescription>
              أدخل العنوان ومقاطع الفيديو (يمكنك إضافة أكثر من فيديو) والملفات المرفقة.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">العنوان</label>
              <Input
                name="title"
                placeholder={contentTypeToAdd === "lecture" ? "مثال: المحاضرة 01 — مقدمة عامة" : "مثال: سكشن 01 — التطبيقات العملية"}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">الوصف / ملاحظات</label>
              <Textarea
                name="description"
                placeholder="نبذة موجزة أو تعليمات خاصة بالمحاضرة..."
                rows={2}
                className="rounded-xl text-xs"
              />
            </div>

            {/* Multiple Videos Section */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-red-500" />
                  <span>مقاطع فيديو YouTube ({videos.length})</span>
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVideoField}
                  className="h-7 rounded-lg text-xs gap-1 border-dashed"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>إضافة فيديو آخر</span>
                </Button>
              </div>

              <div className="space-y-3">
                {videos.map((vid, idx) => {
                  const detectedId = extractYouTubeVideoId(vid.url);
                  return (
                    <div
                      key={vid.id}
                      className="p-3 rounded-2xl border border-border/70 bg-secondary/20 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-primary">
                          فيديو #{idx + 1}
                        </span>
                        {videos.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveVideoField(vid.id)}
                            className="h-6 w-6 rounded-md text-destructive hover:bg-destructive/10"
                            title="حذف هذا الفيديو"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-1 space-y-1">
                          <label className="text-[10px] text-muted-foreground">عنوان الجزء / الفيديو</label>
                          <Input
                            placeholder={`مثال: الجزء ${idx + 1}`}
                            value={vid.title}
                            onChange={(e) => handleUpdateVideoField(vid.id, "title", e.target.value)}
                            className="rounded-xl text-xs h-9"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-muted-foreground">رابط YouTube</label>
                          <Input
                            placeholder="https://www.youtube.com/watch?v=..."
                            dir="ltr"
                            value={vid.url}
                            onChange={(e) => handleUpdateVideoField(vid.id, "url", e.target.value)}
                            className="rounded-xl text-xs font-mono h-9"
                          />
                        </div>
                      </div>

                      {vid.url && (
                        <p className="text-[11px] flex items-center gap-1">
                          {detectedId ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ تم التعرف على معرف الفيديو ({detectedId})
                            </span>
                          ) : (
                            <span className="text-destructive">
                              ✕ يرجى إدخال رابط YouTube صالح
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PDF Section */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-amber-500" />
                <span>رابط ملف PDF الخارجي (Google Drive / OneDrive) (اختياري)</span>
              </h4>
              <Input
                name="pdf_url"
                placeholder="https://drive.google.com/file/d/..."
                dir="ltr"
                className="rounded-xl text-xs font-mono"
              />
            </div>

            {/* Reference Link Section */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-primary" />
                <span>رابط إضافي / مراجع (اختياري)</span>
              </h4>
              <Input
                name="link_url"
                placeholder="https://example.com/reference"
                dir="ltr"
                className="rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <label className="text-xs font-medium text-foreground">حالة النشر</label>
              <select
                name="is_published"
                className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                defaultValue="true"
              >
                <option value="true">منشور ومتاح للطلاب</option>
                <option value="false">مسودة (مخفي مؤقتاً)</option>
              </select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                حفظ وإضافة المحتوى
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Content */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المحتوى والمرفقات</DialogTitle>
            <DialogDescription>
              تعديل تفاصيل المحتوى والروابط المرفقة معه مع إمكانية إضافة وتعديل مقاطع الفيديو المتعددة.
            </DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">نوع المحتوى</label>
                  <select
                    name="type"
                    defaultValue={selectedContent.type}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="lecture">محاضرة</option>
                    <option value="section">سكشن / قسم</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">حالة النشر</label>
                  <select
                    name="is_published"
                    defaultValue={selectedContent.is_published ? "true" : "false"}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="true">منشور للطلاب</option>
                    <option value="false">مسودة (مخفي)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">العنوان</label>
                <Input
                  name="title"
                  defaultValue={selectedContent.title}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">الوصف</label>
                <Textarea
                  name="description"
                  defaultValue={selectedContent.description || ""}
                  rows={2}
                  className="rounded-xl text-xs"
                />
              </div>

              {/* Edit Multiple Videos */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-red-500" />
                    <span>مقاطع فيديو YouTube ({videos.length})</span>
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddVideoField}
                    className="h-7 rounded-lg text-xs gap-1 border-dashed"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>إضافة فيديو آخر</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {videos.map((vid, idx) => {
                    const detectedId = extractYouTubeVideoId(vid.url);
                    return (
                      <div
                        key={vid.id}
                        className="p-3 rounded-2xl border border-border/70 bg-secondary/20 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-primary">
                            فيديو #{idx + 1}
                          </span>
                          {videos.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveVideoField(vid.id)}
                              className="h-6 w-6 rounded-md text-destructive hover:bg-destructive/10"
                              title="حذف هذا الفيديو"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-1 space-y-1">
                            <label className="text-[10px] text-muted-foreground">عنوان الجزء / الفيديو</label>
                            <Input
                              placeholder={`مثال: الجزء ${idx + 1}`}
                              value={vid.title}
                              onChange={(e) => handleUpdateVideoField(vid.id, "title", e.target.value)}
                              className="rounded-xl text-xs h-9"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] text-muted-foreground">رابط YouTube</label>
                            <Input
                              placeholder="https://www.youtube.com/watch?v=..."
                              dir="ltr"
                              value={vid.url}
                              onChange={(e) => handleUpdateVideoField(vid.id, "url", e.target.value)}
                              className="rounded-xl text-xs font-mono h-9"
                            />
                          </div>
                        </div>

                        {vid.url && (
                          <p className="text-[11px] flex items-center gap-1">
                            {detectedId ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                ✓ تم التعرف على معرف الفيديو ({detectedId})
                              </span>
                            ) : (
                              <span className="text-destructive">
                                ✕ يرجى إدخال رابط YouTube صالح
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Edit PDF */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-500" />
                  <span>رابط ملف PDF الخارجي</span>
                </h4>
                <Input
                  name="pdf_url"
                  defaultValue={selectedContent.resources?.find((r) => r.type === "pdf")?.url || ""}
                  placeholder="https://drive.google.com/file/d/..."
                  dir="ltr"
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              {/* Edit Link */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-primary" />
                  <span>رابط خارجي إضافي</span>
                </h4>
                <Input
                  name="link_url"
                  defaultValue={selectedContent.resources?.find((r) => r.type === "link")?.url || ""}
                  placeholder="https://example.com"
                  dir="ltr"
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Content */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">تأكيد حذف المحتوى</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف <strong>{selectedContent?.title}</strong>؟ سيتم حذف جميع المرفقات وسجلات التقدم المرتبطة بها.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDeleteConfirm}
              className="gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
