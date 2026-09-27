"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, GraduationCap } from "lucide-react";

interface CtaBannerProps {
  sessionUser: {
    isAdmin: boolean;
    name: string;
  } | null;
}

export function CtaBanner({ sessionUser }: CtaBannerProps) {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 p-8 sm:p-14 text-white text-center shadow-2xl shadow-blue-500/25 border border-white/30">
          
          {/* Ambient Inner Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-xl px-4 py-1.5 text-xs font-bold text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>ابدأ الآن بتجربة تعليمية مختلفة كلياً</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              جاهز لتنظيم مذاكرتك والتفوق؟
            </h2>

            <p className="text-sm sm:text-base text-blue-50 font-normal max-w-xl mx-auto leading-relaxed">
              سجل دخولك لحسابك المخصص وتابع كافة محاضرات ومذكرات الأستاذ يوسف أسامة بأعلى جودة.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              {sessionUser ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm sm:text-base shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Link href={sessionUser.isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
                    <span>{sessionUser.isAdmin ? "لوحة الإدارة" : "الذهاب للوحة دراستي"}</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm sm:text-base shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Link href="/login" className="flex items-center gap-2">
                    <span>تسجيل الدخول للمنصة</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
