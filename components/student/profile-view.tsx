"use client";

import * as React from "react";
import { changePasswordAction, logoutAction } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  User,
  KeyRound,
  Shield,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Profile, Subject } from "@/types/database";

interface ProfileViewProps {
  profile: Profile;
  assignedSubjects: Subject[];
}

export function ProfileView({ profile, assignedSubjects }: ProfileViewProps) {
  const { theme, setTheme } = useTheme();
  const [isChangingPass, setIsChangingPass] = React.useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPass(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await changePasswordAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || "تم تغيير كلمة المرور بنجاح");
        (e.target as HTMLFormElement).reset();
      }
    } catch {
      toast.error("فشل تغيير كلمة المرور");
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          الملف الشخصي والحساب
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          بيانات الحساب، المواد المسجلة، وتغيير كلمة المرور والمظهر
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="apple-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 text-xl font-bold">
                {profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {profile.full_name}
                </h2>
                <Badge variant={profile.role === "admin" ? "purple" : "secondary"}>
                  {profile.role === "admin" ? "مشرف" : "طالب"}
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 font-mono dir-ltr text-right">
                @{profile.username}
              </p>
              <p className="text-[11px] text-zinc-500">
                تاريخ الانضمام: {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="rounded-xl text-xs gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>تسجيل الخروج</span>
            </Button>
          </form>
        </div>
      </Card>

      {/* Assigned Subjects Summary */}
      {profile.role === "student" && (
        <Card className="apple-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              المواد المصرح لك بالوصول إليها ({assignedSubjects.length})
            </h3>
          </div>

          {assignedSubjects.length === 0 ? (
            <p className="text-xs text-zinc-400">لم يتم تخصيص مواد لحسابك بعد</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {assignedSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {sub.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase">
                    {sub.code}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Appearance Selector */}
      <Card className="apple-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          تخصيص المظهر
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs gap-2 transition-all cursor-pointer ${
              theme === "light"
                ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 font-semibold"
                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <Sun className="h-5 w-5 text-amber-500" />
            <span>فاتح (Light)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs gap-2 transition-all cursor-pointer ${
              theme === "dark"
                ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 font-semibold"
                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <Moon className="h-5 w-5 text-blue-400" />
            <span>داكن (Dark)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs gap-2 transition-all cursor-pointer ${
              theme === "system"
                ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 font-semibold"
                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <Monitor className="h-5 w-5 text-zinc-500" />
            <span>تلقائي (System)</span>
          </button>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-zinc-600" />
            <span>تغيير كلمة المرور</span>
          </CardTitle>
          <CardDescription className="text-xs">
            قم بتعيين كلمة مرور جديدة وقوية لحماية حسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">كلمة المرور الجديدة</label>
                <Input
                  name="new_password"
                  type="password"
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">تأكيد كلمة المرور</label>
                <Input
                  name="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isChangingPass}
              className="rounded-xl text-xs gap-2"
            >
              {isChangingPass && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>تحديث كلمة المرور</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
