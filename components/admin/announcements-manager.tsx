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
  FileCheck,
  AlertTriangle,
  Cpu,
  Loader2,
  Clock,
  Search,
  Filter,
  Users,
  Calendar,
  X,
  Check,
} from "lucide-react";
import {
  DetailedAnnouncement,
  Subject,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementAudience,
} from "@/types/database";

interface AnnouncementsManagerProps {
  initialAnnouncements: DetailedAnnouncement[];
  subjects: Subject[];
  students?: { id: string; full_name: string; username: string }[];
}

export function AnnouncementsManager({
  initialAnnouncements,
  subjects,
  students = [],
}: AnnouncementsManagerProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] =
    React.useState<DetailedAnnouncement[]>(initialAnnouncements);

  React.useEffect(() => {
    setAnnouncements(initialAnnouncements);
  }, [initialAnnouncements]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "published" | "drafts" | "expired">("all");
  const [priorityFilter, setPriorityFilter] = React.useState<"all" | "urgent" | "important" | "normal">("all");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    React.useState<DetailedAnnouncement | null>(null);

  // Form states for Create/Edit
  const [targetAudience, setTargetAudience] = React.useState<AnnouncementAudience>("all");
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [announcementType, setAnnouncementType] = React.useState<AnnouncementType>("general");
  const [priority, setPriority] = React.useState<AnnouncementPriority>("normal");
  const [isPending, setIsPending] = React.useState(false);

  // Student search within dialog
  const [studentSearch, setStudentSearch] = React.useState("");

  const handleOpenCreate = () => {
    setTargetAudience("all");
    setSelectedStudentIds([]);
    setAnnouncementType("general");
    setPriority("normal");
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (announcement: DetailedAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setTargetAudience(announcement.target_audience || "all");
    setSelectedStudentIds(announcement.target_student_ids || []);
    setAnnouncementType(announcement.type || "general");
    setPriority(announcement.priority || "normal");
    setIsEditOpen(true);
  };

  const handleOpenDelete = (announcement: DetailedAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteOpen(true);
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("target_audience", targetAudience);
    formData.set("type", announcementType);
    formData.set("priority", priority);
    formData.set("target_student_ids", JSON.stringify(selectedStudentIds));

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
    formData.set("target_audience", targetAudience);
    formData.set("type", announcementType);
    formData.set("priority", priority);
    formData.set("target_student_ids", JSON.stringify(selectedStudentIds));

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

  const handleTogglePublish = async (announcement: DetailedAnnouncement) => {
    try {
      const res = await toggleAnnouncementPublishAction(
        announcement.id,
        announcement.is_published
      );
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

  // Filtered announcements
  const filteredAnnouncements = announcements.filter((a) => {
    // 1. Status Filter
    if (statusFilter === "published" && (!a.is_published || a.is_expired)) return false;
    if (statusFilter === "drafts" && a.is_published) return false;
    if (statusFilter === "expired" && !a.is_expired) return false;

    // 2. Priority Filter
    if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = a.title.toLowerCase().includes(q);
      const inContent = a.clean_content.toLowerCase().includes(q);
      const inAuthor = a.author_name?.toLowerCase().includes(q) || false;
      const inSubject = a.subject_name?.toLowerCase().includes(q) || false;
      if (!inTitle && !inContent && !inAuthor && !inSubject) return false;
    }

    return true;
  });

  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case "exam":
        return (
          <Badge variant="outline" className="gap-1 text-xs bg-amber-500/10 text-amber-500 border-amber-500/30">
            <FileCheck className="h-3 w-3" />
            امتحان
          </Badge>
        );
      case "course":
        return (
          <Badge variant="outline" className="gap-1 text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
            <BookOpen className="h-3 w-3" />
            مادة دراسية
          </Badge>
        );
      case "important":
        return (
          <Badge variant="outline" className="gap-1 text-xs bg-red-500/10 text-red-400 border-red-500/30">
            <AlertTriangle className="h-3 w-3" />
            تنبيه هام
          </Badge>
        );
      case "system":
        return (
          <Badge variant="outline" className="gap-1 text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
            <Cpu className="h-3 w-3" />
            تحديث نظام
          </Badge>
        );
      case "general":
      default:
        return (
          <Badge variant="outline" className="gap-1 text-xs bg-secondary text-muted-foreground border-border/80">
            <Globe className="h-3 w-3" />
            عام
          </Badge>
        );
    }
  };

  const getPriorityBadge = (p: AnnouncementPriority) => {
    switch (p) {
      case "urgent":
        return (
          <Badge className="bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30 text-xs gap-1 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            عاجل
          </Badge>
        );
      case "important":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs gap-1 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            هام
          </Badge>
        );
      case "normal":
      default:
        return (
          <Badge variant="secondary" className="text-xs text-muted-foreground font-normal">
            عادي
          </Badge>
        );
    }
  };

  const filteredStudentsForPicker = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase().trim();
    return s.full_name.toLowerCase().includes(q) || s.username.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header & New Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            إدارة مركز الإعلانات والتنبيهات
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            إنشاء ونشر الإعلانات التعليمية الموجهة للطلاب مع تحديد الأولويات وتواريخ الانتهاء
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="rounded-2xl shadow-sm gap-2 font-semibold cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>إضافة إعلان جديد</span>
        </Button>
      </div>

      {/* Stats Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="apple-card p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">إجمالي الإعلانات</p>
            <p className="text-lg font-bold text-foreground mt-0.5">{announcements.length}</p>
          </div>
          <Bell className="h-5 w-5 text-muted-foreground/60" />
        </div>

        <div className="apple-card p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">النشطة والمنشورة</p>
            <p className="text-lg font-bold text-emerald-500 mt-0.5">
              {announcements.filter((a) => a.is_published && !a.is_expired).length}
            </p>
          </div>
          <Eye className="h-5 w-5 text-emerald-500/60" />
        </div>

        <div className="apple-card p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">المسودات (مخفية)</p>
            <p className="text-lg font-bold text-amber-500 mt-0.5">
              {announcements.filter((a) => !a.is_published).length}
            </p>
          </div>
          <EyeOff className="h-5 w-5 text-amber-500/60" />
        </div>

        <div className="apple-card p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">منتهية الصلاحية</p>
            <p className="text-lg font-bold text-muted-foreground mt-0.5">
              {announcements.filter((a) => a.is_expired).length}
            </p>
          </div>
          <Clock className="h-5 w-5 text-muted-foreground/60" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="البحث في عنوان أو محتوى الإعلانات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 pl-9 h-10 rounded-2xl bg-secondary/30 text-xs sm:text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 text-xs rounded-xl bg-secondary/50 border border-border/70 text-foreground cursor-pointer focus:outline-none"
          >
            <option value="all">كل الحالات</option>
            <option value="published">منشور فقط</option>
            <option value="drafts">مسودات فقط</option>
            <option value="expired">منتهي الصلاحية</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="h-10 px-3 text-xs rounded-xl bg-secondary/50 border border-border/70 text-foreground cursor-pointer focus:outline-none"
          >
            <option value="all">كل الأولويات</option>
            <option value="urgent">عاجل فقط</option>
            <option value="important">هام فقط</option>
            <option value="normal">عادي فقط</option>
          </select>
        </div>
      </div>

      {/* Announcements Cards */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="لا توجد إعلانات تطابق البحث"
          description="جرّب تعديل الفلاتر أو أضف إعلاناً جديداً للطلاب"
          action={
            <Button onClick={handleOpenCreate} variant="outline" size="sm" className="rounded-xl">
              إضافة إعلان
            </Button>
          }
        />
      ) : (
        <div className="space-y-3.5">
          {filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className="apple-card p-5 hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Priority Badge */}
                  {getPriorityBadge(announcement.priority)}

                  {/* Type Badge */}
                  {getTypeBadge(announcement.type)}

                  {/* Target Audience Badge */}
                  {announcement.target_audience === "subject" ? (
                    <Badge variant="purple" className="gap-1 text-xs">
                      <BookOpen className="h-3 w-3" />
                      مادة: {announcement.subject_name || "محددة"}
                    </Badge>
                  ) : announcement.target_audience === "students" ? (
                    <Badge variant="outline" className="gap-1 text-xs border-blue-500/30 text-blue-400 bg-blue-500/10">
                      <Users className="h-3 w-3" />
                      طلاب محددون ({announcement.target_student_ids?.length || 0})
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Globe className="h-3 w-3" />
                      عام (لكل الطلاب)
                    </Badge>
                  )}

                  {/* Publication & Expiry State */}
                  {announcement.is_expired ? (
                    <Badge variant="outline" className="text-xs text-muted-foreground border-border/80 bg-secondary/50">
                      منتهي الصلاحية
                    </Badge>
                  ) : announcement.is_published ? (
                    <Badge variant="success">منشور</Badge>
                  ) : (
                    <Badge variant="secondary">مسودة (مخفي)</Badge>
                  )}

                  <span className="text-[11px] text-muted-foreground mr-auto">
                    {formatDate(announcement.created_at)} ({formatRelativeTime(announcement.created_at)})
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {announcement.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed line-clamp-3">
                    {announcement.clean_content}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground/80 pt-1">
                  <span>الكاتب: {announcement.author_name || "إدارة المنصة"}</span>
                  {announcement.expires_at && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        ينتهي: {formatDate(announcement.expires_at)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(announcement)}
                  className="h-8 rounded-xl text-xs gap-1.5 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>تعديل</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => handleTogglePublish(announcement)} className="gap-2 cursor-pointer">
                      {announcement.is_published ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                          <span>تحويل لمسودة</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 text-emerald-500" />
                          <span>نشر الإعلان</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOpenDelete(announcement)} destructive className="gap-2 cursor-pointer">
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة إعلان جديد</DialogTitle>
            <DialogDescription>
              حدد نوع الإعلان، درجة الأهمية، والجمهور المستهدف لنشره فوراً أو جدولته.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">عنوان الإعلان *</label>
              <Input
                name="title"
                placeholder="مثال: تنبيه بخصوص موعد اختبار الفيزياء القادم"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Announcement Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">نوع الإعلان</label>
                <select
                  name="type"
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value as any)}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="general">عام (إعلان عام)</option>
                  <option value="course">إعلان مادة دراسية</option>
                  <option value="exam">امتحان / تقييم</option>
                  <option value="important">تنبيه هام</option>
                  <option value="system">تحديث تقني للنظام</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">درجة الأهمية (الأولوية)</label>
                <select
                  name="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="normal">عادي (Normal)</option>
                  <option value="important">هام (Important)</option>
                  <option value="urgent">عاجل (Urgent)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">الجمهور المستهدف</label>
                <select
                  name="target_audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">عام (جميع الطلاب)</option>
                  <option value="subject">طلاب مادة محددة</option>
                  <option value="students">طلاب محددون بالاسم</option>
                </select>
              </div>

              {/* Publication Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">حالة النشر</label>
                <select
                  name="is_published"
                  defaultValue="true"
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="true">منشور فوراً</option>
                  <option value="false">مسودة (مخفي)</option>
                </select>
              </div>
            </div>

            {/* Subject selector if target is subject */}
            {targetAudience === "subject" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">المادة المستهدفة *</label>
                <select
                  name="subject_id"
                  required={targetAudience === "subject"}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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

            {/* Student Picker if target is specific students */}
            {targetAudience === "students" && (
              <div className="space-y-2 border border-border/70 rounded-xl p-3 bg-secondary/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    اختر الطلاب ({selectedStudentIds.length} محدد)
                  </label>
                  {selectedStudentIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedStudentIds([])}
                      className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  )}
                </div>

                <Input
                  type="text"
                  placeholder="ابحث عن طالب بالاسم أو المعرف..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="h-8 text-xs rounded-lg"
                />

                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {filteredStudentsForPicker.map((student) => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => toggleStudentSelection(student.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer text-right ${
                          isSelected ? "bg-primary/15 text-primary font-bold" : "hover:bg-secondary/60 text-foreground"
                        }`}
                      >
                        <span>{student.full_name} (@{student.username})</span>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Expiration Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">تاريخ الانتهاء (اختياري)</label>
                <Input
                  type="datetime-local"
                  name="expires_at"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">اسم الناشر / المعلم</label>
                <Input
                  type="text"
                  name="author_name"
                  placeholder="مثال: إدارة المنصة / د. مصطفى"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Content Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">نص ومحتوى الإعلان *</label>
              <Textarea
                name="content"
                placeholder="اكتب تفاصيل الإعلان هنا بوضوح..."
                rows={4}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2 font-semibold">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                نشر الإعلان
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Announcement */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الإعلان</DialogTitle>
          </DialogHeader>

          {selectedAnnouncement && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">عنوان الإعلان *</label>
                <Input
                  name="title"
                  defaultValue={selectedAnnouncement.title}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">نوع الإعلان</label>
                  <select
                    name="type"
                    value={announcementType}
                    onChange={(e) => setAnnouncementType(e.target.value as any)}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="general">عام (إعلان عام)</option>
                    <option value="course">إعلان مادة دراسية</option>
                    <option value="exam">امتحان / تقييم</option>
                    <option value="important">تنبيه هام</option>
                    <option value="system">تحديث تقني للنظام</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">درجة الأهمية (الأولوية)</label>
                  <select
                    name="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="normal">عادي (Normal)</option>
                    <option value="important">هام (Important)</option>
                    <option value="urgent">عاجل (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">الجمهور المستهدف</label>
                  <select
                    name="target_audience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">عام (جميع الطلاب)</option>
                    <option value="subject">طلاب مادة محددة</option>
                    <option value="students">طلاب محددون بالاسم</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">حالة النشر</label>
                  <select
                    name="is_published"
                    defaultValue={selectedAnnouncement.is_published ? "true" : "false"}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="true">منشور</option>
                    <option value="false">مسودة (مخفي)</option>
                  </select>
                </div>
              </div>

              {targetAudience === "subject" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">المادة المستهدفة *</label>
                  <select
                    name="subject_id"
                    defaultValue={selectedAnnouncement.subject_id || ""}
                    required={targetAudience === "subject"}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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

              {targetAudience === "students" && (
                <div className="space-y-2 border border-border/70 rounded-xl p-3 bg-secondary/20">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">
                      اختر الطلاب ({selectedStudentIds.length} محدد)
                    </label>
                    {selectedStudentIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedStudentIds([])}
                        className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        إلغاء التحديد
                      </button>
                    )}
                  </div>

                  <Input
                    type="text"
                    placeholder="ابحث عن طالب بالاسم أو المعرف..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {filteredStudentsForPicker.map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      return (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer text-right ${
                            isSelected ? "bg-primary/15 text-primary font-bold" : "hover:bg-secondary/60 text-foreground"
                          }`}
                        >
                          <span>{student.full_name} (@{student.username})</span>
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">تاريخ الانتهاء</label>
                  <Input
                    type="datetime-local"
                    name="expires_at"
                    defaultValue={
                      selectedAnnouncement.expires_at
                        ? new Date(selectedAnnouncement.expires_at).toISOString().slice(0, 16)
                        : ""
                    }
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">اسم الناشر / المعلم</label>
                  <Input
                    type="text"
                    name="author_name"
                    defaultValue={selectedAnnouncement.author_name}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">نص ومحتوى الإعلان *</label>
                <Textarea
                  name="content"
                  defaultValue={selectedAnnouncement.clean_content}
                  rows={4}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2 font-semibold">
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
              هل أنت متأكد من حذف هذا الإعلان نهائياً؟ لن يتمكن الطلاب من مشاهدته بعد الآن.
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
              className="gap-2 cursor-pointer"
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
