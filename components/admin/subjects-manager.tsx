"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createSubjectAction,
  updateSubjectAction,
  deleteSubjectAction,
  toggleSubjectPublishAction,
  reorderSubjectsAction,
} from "@/actions/subjects";
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
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Layers,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Subject } from "@/types/database";

interface SubjectsManagerProps {
  initialSubjects: Subject[];
}

export function SubjectsManager({ initialSubjects }: SubjectsManagerProps) {
  const router = useRouter();
  const [subjects, setSubjects] = React.useState<Subject[]>(initialSubjects);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setSubjects(initialSubjects);
  }, [initialSubjects]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState<Subject | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await createSubjectAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsCreateOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("حدث خطأ أثناء إنشاء المادة");
    } finally {
      setIsPending(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.append("id", selectedSubject.id);

    try {
      const res = await updateSubjectAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsEditOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("حدث خطأ أثناء تحديث المادة");
    } finally {
      setIsPending(false);
    }
  };

  const handleTogglePublish = async (subject: Subject) => {
    try {
      const res = await toggleSubjectPublishAction(subject.id, subject.is_published);
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
    if (!selectedSubject) return;
    setIsPending(true);
    try {
      const res = await deleteSubjectAction(selectedSubject.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsDeleteOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("فشل حذف المادة");
    } finally {
      setIsPending(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= subjects.length) return;

    const newOrder = [...subjects];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    setSubjects(newOrder);

    try {
      await reorderSubjectsAction(newOrder.map((s) => s.id));
      toast.success("تم تحديث ترتيب المواد");
    } catch {
      toast.error("فشل حفظ الترتيب الجديد");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            إدارة المواد والمناهج
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إضافة المواد، إدارة المحاضرات والأقسام، وتنظيم ترتيب العرض للطلاب
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl shadow-sm gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة مادة جديدة</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="بحث بالاسم أو رمز المادة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-9 rounded-xl"
        />
      </div>

      {/* Subject Cards Grid */}
      {filteredSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="لم يتم العثور على أي مواد"
          description="قم بإنشاء مادتك الأولى للبدء بإضافة المحاضرات والسكاشن"
          action={
            <Button onClick={() => setIsCreateOpen(true)} variant="outline" size="sm" className="rounded-xl">
              إضافة مادة
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject, index) => (
            <Card
              key={subject.id}
              className="apple-card p-5 flex flex-col justify-between hover:border-primary/40 transition-all relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Header with status badge & dropdown */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[11px] uppercase">
                      {subject.code}
                    </Badge>
                    {subject.is_published ? (
                      <Badge variant="success">منشور للطلاب</Badge>
                    ) : (
                      <Badge variant="secondary">مسودة (مخفي)</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Reorder Buttons */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      title="تحريك لأعلى"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                      disabled={index === filteredSubjects.length - 1}
                      onClick={() => handleMove(index, "down")}
                      title="تحريك لأسفل"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleOpenEdit(subject)} className="gap-2">
                          <Edit className="h-3.5 w-3.5" />
                          <span>تعديل المادة</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleTogglePublish(subject)} className="gap-2">
                          {subject.is_published ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                              <span>إخفاء عن الطلاب</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5 text-emerald-500" />
                              <span>نشر للطلاب</span>
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => handleOpenDelete(subject)} destructive className="gap-2">
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>حذف المادة</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Subject Title and Description */}
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {subject.description || "لا يوجد وصف لهذه المادة حتى الآن"}
                  </p>
                </div>
              </div>

              {/* Footer with content counter and action button */}
              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>{subject.total_contents || 0} محاضرة وقسم</span>
                </div>

                <Button asChild size="sm" variant="outline" className="rounded-xl text-xs gap-1.5 font-medium">
                  <Link href={`/admin/subjects/${subject.id}/content`}>
                    <span>إدارة المحتوى</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Subject */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مادة دراسية جديدة</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل المادة لإتاحتها وتنظيم المحاضرات التابعة لها.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">اسم المادة</label>
              <Input
                name="name"
                placeholder="مثال: تكنولوجيا النانو (Nano Technology)"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">رمز المادة (Code)</label>
                <Input
                  name="code"
                  placeholder="NANO101"
                  required
                  dir="ltr"
                  className="rounded-xl font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
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
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">وصف مختصر</label>
              <Textarea
                name="description"
                placeholder="مقدمة موجزة عن المادة ومحتوياتها..."
                rows={3}
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                إنشاء المادة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Subject */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المادة</DialogTitle>
            <DialogDescription>
              تعديل اسم المادة، الرمز، أو حالة النشر.
            </DialogDescription>
          </DialogHeader>

          {selectedSubject && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">اسم المادة</label>
                <Input
                  name="name"
                  defaultValue={selectedSubject.name}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">رمز المادة (Code)</label>
                  <Input
                    name="code"
                    defaultValue={selectedSubject.code}
                    required
                    dir="ltr"
                    className="rounded-xl font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">حالة النشر</label>
                  <select
                    name="is_published"
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                    defaultValue={selectedSubject.is_published ? "true" : "false"}
                  >
                    <option value="true">منشور ومتاح للطلاب</option>
                    <option value="false">مسودة (مخفي)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">الوصف</label>
                <Textarea
                  name="description"
                  defaultValue={selectedSubject.description || ""}
                  rows={3}
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

      {/* Modal: Delete Subject Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">تأكيد حذف المادة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف مادة{" "}
              <strong className="text-foreground">{selectedSubject?.name}</strong>؟ سيؤدي ذلك إلى حذف جميع المحاضرات والسكاشن والمرفقات التابعة لها نهائياً.
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
              نعم، تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
