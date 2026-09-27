"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  toggleUserStatusAction,
} from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  GraduationCap,
  KeyRound,
  UserCheck,
  UserX,
  Trash2,
  Edit2,
  BookOpen,
  Loader2,
  Check,
} from "lucide-react";
import { Profile, Subject } from "@/types/database";

interface UsersManagerProps {
  initialUsers: (Profile & { assigned_subjects: Subject[] })[];
  allSubjects: Subject[];
}

export function UsersManager({ initialUsers, allSubjects }: UsersManagerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"all" | "admin" | "student">("all");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [isPending, setIsPending] = React.useState(false);

  // Form states for create/edit
  const [selectedSubjectIds, setSelectedSubjectIds] = React.useState<string[]>([]);

  // Filtered users
  const filteredUsers = initialUsers.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenCreate = () => {
    setSelectedSubjectIds([]);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setSelectedSubjectIds(user.assigned_subjects?.map((s: any) => s.id) || []);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (user: any) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const toggleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    selectedSubjectIds.forEach((id) => formData.append("subject_ids", id));

    try {
      const res = await createUserAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsCreateOpen(false);
        router.refresh();
      }
    } catch (err: any) {
      toast.error("حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsPending(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.append("id", selectedUser.id);
    selectedSubjectIds.forEach((id) => formData.append("subject_ids", id));

    try {
      const res = await updateUserAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsEditOpen(false);
        router.refresh();
      }
    } catch (err: any) {
      toast.error("حدث خطأ أثناء تعديل المستخدم");
    } finally {
      setIsPending(false);
    }
  };

  const handleToggleStatus = async (user: Profile) => {
    try {
      const res = await toggleUserStatusAction(user.id, user.is_active);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        router.refresh();
      }
    } catch {
      toast.error("فشل تغيير حالة المستخدم");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setIsPending(true);
    try {
      const res = await deleteUserAction(selectedUser.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsDeleteOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("فشل حذف المستخدم");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            إدارة المستخدمين والطلاب
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إنشاء حسابات الطلاب، تخصيص المواد لكل طالب، وتعيين الصلاحيات
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="rounded-xl shadow-sm gap-2">
          <UserPlus className="h-4 w-4" />
          <span>إضافة مستخدم جديد</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="بحث بالاسم أو اسم المستخدم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={roleFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setRoleFilter("all")}
            className="rounded-xl text-xs"
          >
            الكل ({initialUsers.length})
          </Button>
          <Button
            variant={roleFilter === "student" ? "default" : "outline"}
            size="sm"
            onClick={() => setRoleFilter("student")}
            className="rounded-xl text-xs"
          >
            الطلاب ({initialUsers.filter((u) => u.role === "student").length})
          </Button>
          <Button
            variant={roleFilter === "admin" ? "default" : "outline"}
            size="sm"
            onClick={() => setRoleFilter("admin")}
            className="rounded-xl text-xs"
          >
            المشرفين ({initialUsers.filter((u) => u.role === "admin").length})
          </Button>
        </div>
      </div>

      {/* Users Table / Card Grid */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="لم يتم العثور على أي مستخدمين"
          description="جرب البحث بكلمات أخرى أو قم بإضافة طالب جديد"
          action={
            <Button onClick={handleOpenCreate} variant="outline" size="sm" className="rounded-xl">
              إضافة مستخدم
            </Button>
          }
        />
      ) : (
        <Card className="rounded-2xl border-border/80 overflow-hidden bg-card/60 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-secondary/40 border-b border-border/70 text-muted-foreground font-medium">
                <tr>
                  <th className="p-4">المستخدم</th>
                  <th className="p-4">اسم المستخدم</th>
                  <th className="p-4">الدور</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">المواد المصرح بها</th>
                  <th className="p-4">آخر تسجيل دخول</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {user.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {user.full_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            انضم {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-muted-foreground dir-ltr text-right">
                      @{user.username}
                    </td>

                    <td className="p-4">
                      {user.role === "admin" ? (
                        <Badge variant="purple" className="gap-1">
                          <Shield className="h-3 w-3" />
                          مشرف
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <GraduationCap className="h-3 w-3" />
                          طالب
                        </Badge>
                      )}
                    </td>

                    <td className="p-4">
                      {user.is_active ? (
                        <Badge variant="success">نشط</Badge>
                      ) : (
                        <Badge variant="destructive">معطل</Badge>
                      )}
                    </td>

                    <td className="p-4 max-w-xs">
                      {user.role === "admin" ? (
                        <span className="text-muted-foreground italic">كل المواد (مشرف)</span>
                      ) : user.assigned_subjects?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.assigned_subjects.slice(0, 3).map((sub) => (
                            <Badge key={sub.id} variant="outline" className="text-[10px]">
                              {sub.name}
                            </Badge>
                          ))}
                          {user.assigned_subjects.length > 3 && (
                            <Badge variant="secondary" className="text-[10px]">
                              +{user.assigned_subjects.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-amber-500 font-medium text-[11px]">
                          لم تُحدد مواد
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {user.last_login_at ? formatRelativeTime(user.last_login_at) : "لم يسجل بعد"}
                    </td>

                    <td className="p-4 text-left">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(user)}
                            className="gap-2"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>تعديل الصلاحيات</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(user)}
                            className="gap-2"
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="h-3.5 w-3.5 text-amber-500" />
                                <span>تعطيل الحساب</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>تفعيل الحساب</span>
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleOpenDelete(user)}
                            destructive
                            className="gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف المستخدم</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Create User */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم أو طالب جديد</DialogTitle>
            <DialogDescription>
              أنشئ حساباً للطالب مع تعيين المواد المصرح له بمشاهدتها.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">الاسم الكامل</label>
              <Input
                name="full_name"
                placeholder="مثال: خالد علي محمد"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">اسم المستخدم</label>
                <Input
                  name="username"
                  placeholder="khaled_ali"
                  required
                  dir="ltr"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">كلمة المرور</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">نوع الحساب</label>
                <select
                  name="role"
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  defaultValue="student"
                >
                  <option value="student">طالب (Student)</option>
                  <option value="admin">مشرف (Admin)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">الحالة</label>
                <select
                  name="is_active"
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  defaultValue="true"
                >
                  <option value="true">نشط ومفعل</option>
                  <option value="false">معطل مؤقتاً</option>
                </select>
              </div>
            </div>

            {/* Subject Assignments */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <label className="text-xs font-medium flex items-center justify-between text-foreground">
                <span>المواد المصرح بها للطالب</span>
                <span className="text-[11px] text-muted-foreground">
                  {selectedSubjectIds.length} مواد محددة
                </span>
              </label>

              {allSubjects.length === 0 ? (
                <p className="text-xs text-muted-foreground">لا توجد مواد مضافة في النظام حالياً</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-secondary/30 border border-border/70">
                  {allSubjects.map((subject) => {
                    const isSelected = selectedSubjectIds.includes(subject.id);
                    return (
                      <div
                        key={subject.id}
                        onClick={() => toggleSubjectSelect(subject.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-secondary/60 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{subject.name}</span>
                          <span className="text-[10px] text-muted-foreground">({subject.code})</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                إنشاء المستخدم
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit User */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription>
              تعديل الاسم، الدور، كلمة المرور، والمواد المصرح بها للمستخدم:{" "}
              <strong className="text-foreground">
                {selectedUser?.full_name}
              </strong>
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">الاسم الكامل</label>
                <Input
                  name="full_name"
                  defaultValue={selectedUser.full_name}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">نوع الحساب</label>
                  <select
                    name="role"
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                    defaultValue={selectedUser.role}
                  >
                    <option value="student">طالب (Student)</option>
                    <option value="admin">مشرف (Admin)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">الحالة</label>
                  <select
                    name="is_active"
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                    defaultValue={selectedUser.is_active ? "true" : "false"}
                  >
                    <option value="true">نشط ومفعل</option>
                    <option value="false">معطل</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center justify-between text-foreground">
                  <span>تعيين كلمة مرور جديدة</span>
                  <span className="text-[11px] text-muted-foreground">اترك الحقل فارغاً إذا لم ترغب في التغيير</span>
                </label>
                <Input
                  name="password"
                  type="password"
                  placeholder="كلمة مرور جديدة (اختياري)"
                  dir="ltr"
                  className="rounded-xl"
                />
              </div>

              {/* Subject Permissions Assignment */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <label className="text-xs font-medium flex items-center justify-between text-foreground">
                  <span>المواد المصرح بها للطالب</span>
                  <span className="text-[11px] text-muted-foreground">
                    {selectedSubjectIds.length} مواد محددة
                  </span>
                </label>

                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-secondary/30 border border-border/70">
                  {allSubjects.map((subject) => {
                    const isSelected = selectedSubjectIds.includes(subject.id);
                    return (
                      <div
                        key={subject.id}
                        onClick={() => toggleSubjectSelect(subject.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-secondary/60 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{subject.name}</span>
                          <span className="text-[10px] text-muted-foreground">({subject.code})</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                    );
                  })}
                </div>
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
            <DialogTitle className="text-destructive">تأكيد حذف المستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف حساب{" "}
              <strong className="text-foreground">{selectedUser?.full_name}</strong> نهائياً؟ سيتم حذف جميع تقدمه وعلاماته المرجعية.
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
