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
      {/* Background Animated Ambient Pastel Lights */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[500px] w-[650px] rounded-full bg-gradient-to-tr from-blue-400/20 via-indigo-300/15 to-purple-300/15 blur-[120px] animate-pulse-glow" />
        <div className="absolute -top-10 right-1/4 h-[350px] w-[450px] rounded-full bg-sky-300/20 blur-[100px]" />
        <div className="absolute bottom-10 left-1/4 h-[300px] w-[400px] rounded-full bg-indigo-300/15 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-500/20 bg-white/80 px-4 py-1.5 text-xs font-bold text-blue-600 shadow-[0_4px_16px_rgba(37,99,235,0.08)] backdrop-blur-xl hover:scale-105 transition-transform duration-300">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>المنصة التعليمية الخاصة الأولى والمنظمة بالكامل</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-900 leading-[1.18] mb-6">
            تعلم بذكاء، بتركيز
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              وبدون أي تشتيت
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-600 font-normal leading-relaxed max-w-2xl mx-auto">
            منصة خاصة تجمع لك كافة محاضرات وشروحات <strong className="text-zinc-900 font-bold">الأستاذ يوسف أسامة</strong>، مع مذكرات الـ PDF وتتبع نسبة الإنجاز في بيئة زجاجية هادئة وفائقة السرعة.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          {sessionUser ? (
            <Button
              asChild
              size="lg"
              className="apple-button-glow w-full sm:w-auto h-13 px-8 rounded-2xl text-white font-bold text-base shadow-xl gap-2"
            >
              <Link href={sessionUser.isAdmin ? "/admin" : "/dashboard"}>
                <span>{sessionUser.isAdmin ? "الدخول للوحة الإدارة" : "متابعة دراستي الآن"}</span>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="apple-button-glow w-full sm:w-auto h-13 px-8 rounded-2xl text-white font-bold text-base shadow-xl gap-2"
            >
              <Link href="/login">
                <span>تسجيل الدخول للمنصة</span>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-13 px-7 rounded-2xl border-white/90 bg-white/85 backdrop-blur-2xl text-base font-bold text-zinc-700 hover:bg-white hover:text-blue-600 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
          >
            <a href="#guide" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>دليل الاستخدام السريع</span>
            </a>
          </Button>
        </div>

        {/* Floating Metrics Highlights with Apple Magnetic Glass Hover */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          <div className="glass-card-interactive p-4 rounded-3xl flex items-center gap-3.5 group cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 font-bold group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-900">سرعة فائقة</div>
              <div className="text-[11px] text-zinc-500">تحميل وتصفح فوري</div>
            </div>
          </div>

          <div className="glass-card-interactive p-4 rounded-3xl flex items-center gap-3.5 group cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 font-bold group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <Flame className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-900">بدون إعلانات</div>
              <div className="text-[11px] text-zinc-500">تركيز كامل ١٠٠٪</div>
            </div>
          </div>

          <div className="glass-card-interactive p-4 rounded-3xl flex items-center gap-3.5 group cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-900">تطبيق PWA</div>
              <div className="text-[11px] text-zinc-500">تثبيت سهل بالجوال</div>
            </div>
          </div>

          <div className="glass-card-interactive p-4 rounded-3xl flex items-center gap-3.5 group cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 font-bold group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-900">حسابات خاصة</div>
              <div className="text-[11px] text-zinc-500">محتوى مخصص ومحمي</div>
            </div>
          </div>
        </div>

        {/* Apple Frosted Glass UI Showcase Mockup */}
        <div className="relative mx-auto max-w-4xl rounded-3xl p-3 sm:p-5 glass-panel shadow-[0_20px_50px_-10px_rgba(0,0,0,0.07)] hover:shadow-[0_25px_60px_-10px_rgba(37,99,235,0.12)] transition-all duration-500 animate-float">
          
          <div className="rounded-2xl border border-white/80 bg-white/90 overflow-hidden shadow-inner">
            
            {/* Window Bar */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 bg-zinc-50/80">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-white px-3 py-1 rounded-xl border border-zinc-200/60 shadow-xs">
                <span>studyhub.internal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-600">منصة الچوو</span>
              </div>
            </div>

            {/* Dashboard Body Mockup */}
            <div className="p-5 sm:p-6 space-y-5 text-right">
              
              {/* Greeting Card inside Mockup */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-blue-500/20">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[11px] font-bold">
                    <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                    <span>مرحباً بك في لوحة التعلم</span>
                  </div>
                  <h3 className="text-lg font-black">استكمل دراستك في المقررات المخصصة لك</h3>
                  <p className="text-xs text-blue-100">تم تسجيل كافة الشروحات والمذكرات بدقة عالية</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 text-center">
                    <div className="text-xs text-blue-100">نسبة الإنجاز</div>
                    <div className="text-lg font-black">٨٥٪</div>
                  </div>
                </div>
              </div>

              {/* Subject Cards inside Mockup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 flex flex-col justify-between hover:border-blue-400 hover:bg-white transition-all shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-mono text-xs font-bold border border-blue-200/60">
                      MATH-101
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      ٨ / ١٠ مكتمل
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 mb-1">
                    شرح الجبر والتفاضل والتكامل
                  </h4>
                  <p className="text-xs text-zinc-500 mb-3">
                    محاضرات فيديو مسجلة ومذكرات تدريبية شاملة
                  </p>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-4/5 rounded-full" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 flex flex-col justify-between hover:border-purple-400 hover:bg-white transition-all shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 font-mono text-xs font-bold border border-purple-200/60">
                      PHYS-201
                    </span>
                    <span className="text-xs font-bold text-indigo-600">
                      ٥ / ٦ مكتمل
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 mb-1">
                    الفيزياء التطبيقية والنظرية
                  </h4>
                  <p className="text-xs text-zinc-500 mb-3">
                    تجارب عملية ومسائل محلولة بالتفصيل
                  </p>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
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
