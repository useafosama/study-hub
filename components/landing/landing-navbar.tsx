"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, LogIn, LayoutDashboard, Menu, X, Sparkles } from "lucide-react";

interface LandingNavbarProps {
  sessionUser: {
    isAdmin: boolean;
    name: string;
  } | null;
}

export function LandingNavbar({ sessionUser }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/80 bg-white/75 backdrop-blur-2xl transition-all shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-zinc-900 leading-tight group-hover:text-blue-600 transition-colors">
              منصة الچوو التعليمية
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">
              يوسف أسامة
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/70 p-1 rounded-2xl border border-zinc-200/50 backdrop-blur-md text-xs font-semibold text-zinc-600">
          <a
            href="#features"
            className="px-4 py-1.5 rounded-xl hover:text-blue-600 hover:bg-white hover:shadow-xs transition-all duration-200"
          >
            المميزات
          </a>
          <a
            href="#guide"
            className="px-4 py-1.5 rounded-xl hover:text-blue-600 hover:bg-white hover:shadow-xs transition-all duration-200"
          >
            دليل الاستخدام
          </a>
          <a
            href="#faq"
            className="px-4 py-1.5 rounded-xl hover:text-blue-600 hover:bg-white hover:shadow-xs transition-all duration-200"
          >
            الأسئلة الشائعة
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {sessionUser ? (
            <Button
              asChild
              size="sm"
              className="apple-button-glow rounded-2xl text-xs font-bold gap-2 text-white h-9 px-4.5"
            >
              <Link href={sessionUser.isAdmin ? "/admin" : "/dashboard"}>
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{sessionUser.isAdmin ? "لوحة الإدارة" : "لوحة الطالب"}</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="apple-button-glow rounded-2xl text-xs font-bold gap-2 text-white h-9 px-4.5"
            >
              <Link href="/login">
                <LogIn className="h-3.5 w-3.5" />
                <span>تسجيل الدخول</span>
              </Link>
            </Button>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl text-zinc-600 hover:bg-zinc-100 focus:outline-none transition-colors"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200/80 bg-white/95 backdrop-blur-2xl px-5 py-4 space-y-2 text-xs font-bold text-zinc-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            المميزات
          </a>
          <a
            href="#guide"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            دليل الاستخدام السريع
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            الأسئلة الشائعة
          </a>
        </div>
      )}
    </header>
  );
}
