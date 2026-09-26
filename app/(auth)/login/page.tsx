"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Lock, User, Eye, EyeOff, Loader2, GraduationCap, AlertCircle, ShieldAlert, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top bar controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 gap-1.5 rounded-xl">
          <Link href="/">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>العودة للرئيسية</span>
          </Link>
        </Button>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 mb-2">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            منصة الچوو التعليمية
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            بإشراف يوسف أسامة — بوابة تسجيل الدخول
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-zinc-200/80 bg-white/80 shadow-xl shadow-zinc-950/5 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/80 rounded-3xl">
          <CardHeader className="space-y-1 pb-4 text-center sm:text-right">
            <CardTitle className="text-lg font-semibold">تسجيل الدخول</CardTitle>
            <CardDescription className="text-xs">
              أدخل اسم المستخدم وكلمة المرور الخاصة بحسابك للمتابعة
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Account disabled alert from URL */}
            {urlError === "account_disabled" && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>تم تعطيل هذا الحساب. يرجى مراجعة إدارة المنصة لتفعيل حسابك.</span>
              </div>
            )}

            {/* Error Message from Server Action */}
            {state?.error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  اسم المستخدم
                </label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="مثال: khaled_ali"
                    className="pr-10 rounded-xl"
                    disabled={isPending}
                    dir="ltr"
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-10 pl-10 rounded-xl"
                    disabled={isPending}
                    dir="ltr"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-md shadow-blue-500/10 cursor-pointer mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security & Access note */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed px-4">
          المنصة خاصة ويتم إنشاء الحسابات من قبل المشرف فقط. لا يتوفر تسجيل عام.
        </p>
      </div>
    </div>
  );
}
