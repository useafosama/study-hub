"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  toggleAnnouncementPublishAction,
} from "@/actions/announcements";
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
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  Bell,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  BookOpen,
  Loader2,
  Clock,
} from "lucide-react";
import { Announcement, Subject } from "@/types/database";

interface AnnouncementsManagerProps {
  initialAnnouncements: Announcement[];
  subjects: Subject[];
}

export function AnnouncementsManager({
  initialAnnouncements,
  subjects,
}: AnnouncementsManagerProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = React.useState<Announcement[]>(initialAnnouncements);

  React.useEffect(() => {
    setAnnouncements(initialAnnouncements);
  }, [initialAnnouncements]);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);
  const [targetType, setTargetType] = React.useState<"all" | "subject">("all");
  const [isPending, setIsPending] = React.useState(false);

  const handleOpenEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setTargetType(announcement.target_type);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await createAnnouncementAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsCreateOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("حدث خطأ أثناء إضافة الإعلان");
    } finally {
      setIsPending(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.append("id", selectedAnnouncement.id);

    try {
      const res = await updateAnnouncementAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsEditOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("حدث خطأ أثناء تحديث الإعلان");
    } finally {
      setIsPending(false);
    }
  };

  const handleTogglePublish = async (announcement: Announcement) => {
    try {
      const res = await toggleAnnouncementPublishAction(announcement.id, announcement.is_published);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        router.refresh();
      }
    } catch {
      toast.error("فشل تغيير حالة الإعلان");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnnouncement) return;
    setIsPending(true);
    try {
      const res = await deleteAnnouncementAction(selectedAnnouncement.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsDeleteOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("فشل حذف الإعلان");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            إدارة الإعلانات والتنبيهات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            نشر التنبيهات العامة أو الخاصة بمادة معينة للطلاب
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl shadow-sm gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة إعلان جديد</span>
        </Button>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="لا توجد إعلانات منشورة"
          description="أنشئ إعلاناً للتواصل مع الطلاب بخصوص المحاضرات والمواعيد الهامة"
          action={
            <Button onClick={() => setIsCreateOpen(true)} variant="outline" size="sm" className="rounded-xl">
              إضافة إعلان
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="apple-card p-5 hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {announcement.target_type === "all" ? (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Globe className="h-3 w-3" />
                      عام (لكل الطلاب)
                    </Badge>
                  ) : (
                    <Badge variant="purple" className="gap-1 text-xs">
                      <BookOpen className="h-3 w-3" />
                      خاص بمادة: {announcement.subject_name || "مادة محددة"}
                    </Badge>
                  )}

                  {announcement.is_published ? (
                    <Badge variant="success">منشور</Badge>
                  ) : (
                    <Badge variant="secondary">مخفي</Badge>
                  )}

                  <span className="text-[11px] text-muted-foreground mr-auto">
                    {formatDate(announcement.created_at)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {announcement.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(announcement)}
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
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem onClick={() => handleTogglePublish(announcement)} className="gap-2">
                      {announcement.is_published ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                          <span>إخفاء الإعلان</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 text-emerald-500" />
                          <span>نشر الإعلان</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOpenDelete(announcement)} destructive className="gap-2">
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>حذف الإعلان</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Announcement */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة إعلان جديد</DialogTitle>
            <DialogDescription>
              حدد الجمهور المستهدف ونَص الإعلان ليظهر في لوحة تحكم الطلاب.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">عنوان الإعلان</label>
              <Input
                name="title"
                placeholder="مثال: تنبيه بخصوص موعد المحاضرة القادمة"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">الجمهور المستهدف</label>
                <select
                  name="target_type"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                >
                  <option value="all">عام (جميع الطلاب)</option>
                  <option value="subject">خاص بمادة محددة</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">حالة النشر</label>
                <select
                  name="is_published"
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  defaultValue="true"
                >
                  <option value="true">منشور فوراً</option>
                  <option value="false">مسودة (مخفي)</option>
                </select>
              </div>
            </div>

            {targetType === "subject" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">المادة المستهدفة</label>
                <select
                  name="subject_id"
                  required={targetType === "subject"}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                >
                  <option value="">اختر المادة...</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">نص الإعلان</label>
              <Textarea
                name="content"
                placeholder="اكتب نص الإعلان والتفاصيل هنا..."
                rows={4}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                نشر الإعلان
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Announcement */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الإعلان</DialogTitle>
          </DialogHeader>

          {selectedAnnouncement && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">عنوان الإعلان</label>
                <Input
                  name="title"
                  defaultValue={selectedAnnouncement.title}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">الجمهور المستهدف</label>
                  <select
                    name="target_type"
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">عام (جميع الطلاب)</option>
                    <option value="subject">خاص بمادة محددة</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">حالة النشر</label>
                  <select
                    name="is_published"
                    defaultValue={selectedAnnouncement.is_published ? "true" : "false"}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="true">منشور</option>
                    <option value="false">مخفي</option>
                  </select>
                </div>
              </div>

              {targetType === "subject" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">المادة المستهدفة</label>
                  <select
                    name="subject_id"
                    defaultValue={selectedAnnouncement.subject_id || ""}
                    required={targetType === "subject"}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="">اختر المادة...</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">نص الإعلان</label>
                <Textarea
                  name="content"
                  defaultValue={selectedAnnouncement.content}
                  rows={4}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
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

      {/* Modal: Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">تأكيد حذف الإعلان</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا الإعلان نهائياً؟
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
