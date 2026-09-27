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
      {/* Background Animated Ambient Lights */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[500px] w-[650px] rounded-full bg-primary/10 blur-[130px] animate-pulse-glow" />
        <div className="absolute -top-10 right-1/4 h-[350px] w-[450px] rounded-full bg-purple-500/10 blur-[110px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary shadow-xs backdrop-blur-xl hover:scale-105 transition-transform duration-200">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>المنصة التعليمية الخاصة الأولى والمنظمة بالكامل</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.18] mb-6">
            تعلم بذكاء، بتركيز
            <span className="block mt-2 bg-gradient-to-r from-primary via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              وبدون أي تشتيت
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-normal leading-relaxed max-w-2xl mx-auto">
            منصة خاصة تجمع لك كافة محاضرات وشروحات <strong className="text-foreground font-bold">الأستاذ يوسف أسامة</strong>، مع مذكرات الـ PDF وتتبع نسبة الإنجاز في بيئة زجاجية هادئة وفائقة السرعة.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          {sessionUser ? (
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-2xl font-bold text-base shadow-lg gap-2"
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
              className="w-full sm:w-auto h-12 px-8 rounded-2xl font-bold text-base shadow-lg gap-2"
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
            className="w-full sm:w-auto h-12 px-7 rounded-2xl text-base font-bold text-foreground hover:bg-muted transition-all duration-200"
          >
            <a href="#guide" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>دليل الاستخدام السريع</span>
            </a>
          </Button>
        </div>

        {/* Floating Metrics Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          <div className="glass-card-interactive p-4 rounded-3xl flex items-center gap-3.5 group cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold group-hover:scale-105 transition-all duration-200">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-foreground">سرعة فائقة</div>
              <div className="text-[11px] text-muted-foreground">تحميل وتصفح فوري</div>
            </div>
          </div>

          <div className="glass-card-interactive p-4 rounded-3xl flex items-center gap-3.5 group cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold group-hover:scale-105 transition-all duration-200">
              <Flame className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-foreground">بدون إعلانات</div>
              <div className="text-[11px] text-muted-foreground">تركيز كامل ١٠٠٪</div>
            </div>
          </div>

          <div className="glass-card-interactive p-4 rounded-3xl flex items-center gap-3.5 group cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold group-hover:scale-105 transition-all duration-200">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-foreground">تطبيق PWA</div>
              <div className="text-[11px] text-muted-foreground">تثبيت سهل بالجوال</div>
            </div>
          </div>

          <div className="glass-card-interactive p-4 rounded-3xl flex items-center gap-3.5 group cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold group-hover:scale-105 transition-all duration-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-foreground">حسابات خاصة</div>
              <div className="text-[11px] text-muted-foreground">محتوى مخصص ومحمي</div>
            </div>
          </div>
        </div>

        {/* UI Showcase Mockup */}
        <div className="relative mx-auto max-w-4xl rounded-3xl p-3 sm:p-5 glass-panel shadow-2xl transition-all duration-300">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-inner">
            
            {/* Window Bar */}
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 bg-muted/40">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/70" />
                <div className="h-3 w-3 rounded-full bg-amber-400/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background px-3 py-1 rounded-xl border border-border shadow-xs">
                <span>studyhub.internal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-primary">منصة الچوو</span>
              </div>
            </div>

            {/* Dashboard Body Mockup */}
            <div className="p-5 sm:p-6 space-y-5 text-right">
              
              {/* Greeting Card inside Mockup */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-sky-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-primary/20">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[11px] font-bold">
                    <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                    <span>مرحباً بك في لوحة التعلم</span>
                  </div>
                  <h3 className="text-lg font-black">استكمل دراستك في المقررات المخصصة لك</h3>
                  <p className="text-xs text-white/80">تم تسجيل كافة الشروحات والمذكرات بدقة عالية</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 text-center">
                    <div className="text-xs text-white/80">نسبة الإنجاز</div>
                    <div className="text-lg font-black">٨٥٪</div>
                  </div>
                </div>
              </div>

              {/* Subject Cards inside Mockup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20">
                      MATH-101
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ٨ / ١٠ مكتمل
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground mb-1">
                    شرح الجبر والتفاضل والتكامل
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    محاضرات فيديو مسجلة ومذكرات تدريبية شاملة
                  </p>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-4/5 rounded-full" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between hover:border-purple-400 transition-all shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-xs font-bold border border-purple-500/20">
                      PHYS-201
                    </span>
                    <span className="text-xs font-bold text-primary">
                      ٥ / ٦ مكتمل
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground mb-1">
                    الفيزياء التطبيقية والنظرية
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    تجارب عملية ومسائل محلولة بالتفصيل
                  </p>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
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
