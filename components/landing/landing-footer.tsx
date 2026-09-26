import Link from "next/link";
import { GraduationCap, Heart } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="flex flex-col text-right">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
              منصة الچوو التعليمية
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              بإشراف يوسف أسامة
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            المميزات
          </a>
          <a href="#guide" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            دليل الاستخدام
          </a>
          <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            الأسئلة الشائعة
          </a>
          <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors">
            تسجيل الدخول
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center md:text-left">
          © {currentYear} جميع الحقوق محفوظة لـ منصة الچوو | يوسف أسامة
        </div>

      </div>
    </footer>
  );
}
