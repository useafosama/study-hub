"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Lock, User, Eye, EyeOff, Loader2, GraduationCap, AlertCircle, ShieldAlert, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 selection:bg-primary selection:text-white bg-background">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Top bar controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-xs">
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
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 mb-2 animate-float">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            منصة الچوو التعليمية
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            بإشراف يوسف أسامة — بوابة تسجيل الدخول
          </p>
        </div>

        {/* Login Card (Apple Frosted Glass) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-border">
          <div className="space-y-1 pb-5 text-center sm:text-right border-b border-border/60 mb-5">
            <h2 className="text-lg font-bold text-foreground">تسجيل الدخول</h2>
            <p className="text-xs text-muted-foreground">
              أدخل اسم المستخدم وكلمة المرور الخاصة بحسابك للمتابعة
            </p>
          </div>

          <div>
            {/* Account disabled alert from URL */}
            {urlError === "account_disabled" && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>تم تعطيل هذا الحساب. يرجى مراجعة إدارة المنصة لتفعيل حسابك.</span>
              </div>
            )}

            {/* Error Message from Server Action */}
            {state?.error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="block text-xs font-bold text-foreground"
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
                    className="pr-10 rounded-2xl bg-background/80 border-input text-xs h-11 focus:border-primary"
                    disabled={isPending}
                    dir="ltr"
                  />
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-foreground"
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
                    className="pr-10 pl-10 rounded-2xl bg-background/80 border-input text-xs h-11 focus:border-primary"
                    disabled={isPending}
                    dir="ltr"
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
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
                className="apple-button-glow w-full h-11 rounded-2xl text-white font-bold text-sm cursor-pointer mt-2"
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
          </div>
        </div>

        {/* Security & Access note */}
        <p className="text-center text-xs text-muted-foreground leading-relaxed px-4 font-medium">
          المنصة خاصة ويتم إنشاء الحسابات من قبل المشرف فقط. لا يتوفر تسجيل عام.
        </p>
      </div>
    </div>
  );
}

