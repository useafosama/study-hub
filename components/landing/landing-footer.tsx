import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/60 backdrop-blur-2xl py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="font-bold text-sm text-foreground">
              منصة الچوو التعليمية
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              بإشراف يوسف أسامة
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs font-semibold text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">
            المميزات
          </a>
          <a href="#guide" className="hover:text-primary transition-colors">
            دليل الاستخدام
          </a>
          <a href="#faq" className="hover:text-primary transition-colors">
            الأسئلة الشائعة
          </a>
          <Link href="/login" className="hover:text-primary font-bold transition-colors">
            تسجيل الدخول
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-muted-foreground text-center md:text-left font-medium">
          © {currentYear} جميع الحقوق محفوظة لـ منصة الچوو | يوسف أسامة
        </div>

      </div>
    </footer>
  );
}

