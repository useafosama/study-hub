"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Sparkles, 
  PlayCircle, 
  FileText, 
  Smartphone, 
  ShieldCheck,
  CheckCircle2,
  BookOpen
} from "lucide-react";

interface HeroSectionProps {
  sessionUser: {
    isAdmin: boolean;
    name: string;
  } | null;
}

export function HeroSection({ sessionUser }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[450px] w-[600px] rounded-full bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-[300px] w-[400px] rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/40 px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-6 shadow-xs backdrop-blur-xs">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span>منصة تعليمية خاصة فائقة السرعة والتنظيم</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.2] mb-6">
          منصة الچوو التعليمية
          <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            بإشراف يوسف أسامة
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed mb-8 sm:mb-10">
          بيئة دراسية هادئة وخاصة تجمع لك كافة المحاضرات، الشروحات المرئية، والمذكرات بصيغة PDF في مكان واحد منظّم ومحمي بدون أي إعلانات أو تشتيت.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          {sessionUser ? (
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 text-sm font-bold gap-2"
            >
              <Link href={sessionUser.isAdmin ? "/admin" : "/dashboard"}>
                <span>{sessionUser.isAdmin ? "الدخول للوحة الإدارة" : "متابعة دراستي الآن"}</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 text-sm font-bold gap-2"
            >
              <Link href="/login">
                <span>تسجيل الدخول للمنصة</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-7 rounded-2xl border-zinc-200 dark:border-zinc-800 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          >
            <a href="#guide">
              <BookOpen className="h-4 w-4 text-zinc-500" />
              <span>دليل الاستخدام السريع</span>
            </a>
          </Button>
        </div>

        {/* Live UI Mockup Preview */}
        <div className="relative mx-auto max-w-4xl rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-3 sm:p-5 shadow-2xl shadow-blue-500/5">
          <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 text-right">
            
            {/* Top Bar of Mockup */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                لوحة الطالب — المقررات الدراسية
              </div>
            </div>

            {/* Content Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Card 1 */}
              <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-right shadow-xs hover:border-blue-500/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    مقرر نشط
                  </span>
                  <PlayCircle className="h-4 w-4 text-blue-500" />
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                  شرح المحاضرات التأسيسية
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  فيديوهات مركزة بدون إعلانات
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-right shadow-xs hover:border-blue-500/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    ملفات جاهزة
                  </span>
                  <FileText className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                  المذكرات والملخصات (PDF)
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  تحميل مباشر وعرض مدمج
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-right shadow-xs hover:border-blue-500/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    تطبيق ويب PWA
                  </span>
                  <Smartphone className="h-4 w-4 text-purple-500" />
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                  تثبيت فوري على الجوال
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  يعمل كتطبيق أصلي على iOS و Android
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span>حسابات خاصة ومحمية</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span>متابعة إنجاز المحاضرات</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span>وضع ليلي / نهاري مريح</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
