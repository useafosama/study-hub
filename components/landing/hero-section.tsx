"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Sparkles, 
  Play, 
  FileText, 
  Smartphone, 
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Zap,
  Flame,
  Star,
  GraduationCap
} from "lucide-react";

interface HeroSectionProps {
  sessionUser: {
    isAdmin: boolean;
    name: string;
  } | null;
}

export function HeroSection({ sessionUser }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 md:pt-16 md:pb-28">
      {/* Background Animated Gradient Mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[550px] w-[700px] rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/15 blur-[120px] dark:from-blue-500/25 dark:via-purple-500/20 dark:to-cyan-500/15" />
        <div className="absolute -top-12 right-1/4 h-[350px] w-[450px] rounded-full bg-sky-400/20 blur-[90px] dark:bg-sky-500/15" />
        <div className="absolute bottom-10 left-1/4 h-[300px] w-[400px] rounded-full bg-indigo-500/15 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-300 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>المنصة التعليمية الخاصة الأولى والمنظمة بالكامل</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15] mb-6">
            تعلم بذكاء، بتركيز
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
              وبدون أي تشتيت
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl mx-auto">
            منصة خاصة تجمع لك كافة محاضرات وشروحات <strong className="text-zinc-900 dark:text-white font-bold">الأستاذ يوسف أسامة</strong>، مع مذكرات الـ PDF وتتبع نسبة الإنجاز في مكان واحد فائق السرعة.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          {sessionUser ? (
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-blue-500/25 border-t border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href={sessionUser.isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
                <span>{sessionUser.isAdmin ? "الدخول للوحة الإدارة" : "متابعة دراستي الآن"}</span>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-blue-500/25 border-t border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/login" className="flex items-center gap-2">
                <span>تسجيل الدخول للمنصة</span>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-13 px-7 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-base font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <a href="#guide" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>دليل الاستخدام السريع</span>
            </a>
          </Button>
        </div>

        {/* Floating Metrics Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-14">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">سرعة فائقة</div>
              <div className="text-[11px] text-zinc-500">تحميل وتصفح فوري</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
              <Flame className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">بدون إعلانات</div>
              <div className="text-[11px] text-zinc-500">تركيز كامل ١٠٠٪</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">تطبيق PWA</div>
              <div className="text-[11px] text-zinc-500">تثبيت سهل بالجوال</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">حسابات خاصة</div>
              <div className="text-[11px] text-zinc-500">محتوى مخصص ومحمي</div>
            </div>
          </div>
        </div>

        {/* High-End Interactive UI Showcase Mockup */}
        <div className="relative mx-auto max-w-4xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-900/5 dark:bg-zinc-900/40 p-3 sm:p-4 backdrop-blur-2xl shadow-2xl shadow-blue-500/10">
          
          {/* Main Mockup Container */}
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-inner">
            
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 px-4 py-3 bg-zinc-50/80 dark:bg-zinc-900/80">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/50 px-3 py-1 rounded-lg">
                <span>studyhub.internal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">منصة الچوو</span>
              </div>
            </div>

            {/* Mock Dashboard Body */}
            <div className="p-4 sm:p-6 space-y-5 text-right">
              
              {/* Student Greeting Widget inside Mockup */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-blue-500/20">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                    <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                    <span>مرحباً بك في لوحة التعلم</span>
                  </div>
                  <h3 className="text-lg font-bold">استكمل دراستك في المقررات المخصصة لك</h3>
                  <p className="text-xs text-blue-100">تم تسجيل كافة الشروحات والمذكرات بدقة عالية</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                    <div className="text-xs text-blue-100">نسبة الإنجاز</div>
                    <div className="text-base font-black">٨٥٪</div>
                  </div>
                </div>
              </div>

              {/* Mock Subject Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Mock Card 1 */}
                <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">
                      MATH-101
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ٨ / ١٠ مكتمل
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                    شرح الجبر والتفاضل والتكامل
                  </h4>
                  <p className="text-xs text-zinc-500 mb-3">
                    محاضرات فيديو مسجلة ومذكرات تدريبية شاملة
                  </p>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-4/5 rounded-full" />
                  </div>
                </div>

                {/* Mock Card 2 */}
                <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-xs font-bold">
                      PHYS-201
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      ٥ / ٦ مكتمل
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                    الفيزياء التطبيقية والنظرية
                  </h4>
                  <p className="text-xs text-zinc-500 mb-3">
                    تجارب عملية ومسائل محلولة بالتفصيل
                  </p>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-full w-[85%] rounded-full" />
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
