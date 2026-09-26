"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { GraduationCap, ArrowLeft, LogIn, LayoutDashboard, Menu, X } from "lucide-react";

interface LandingNavbarProps {
  sessionUser: {
    isAdmin: boolean;
    name: string;
  } | null;
}

export function LandingNavbar({ sessionUser }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/75 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/75 transition-all">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-zinc-900 dark:text-zinc-50 leading-tight">
              منصة الچوو التعليمية
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              يوسف أسامة
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            المميزات
          </a>
          <a href="#guide" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            دليل الاستخدام
          </a>
          <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            الأسئلة الشائعة
          </a>
        </nav>

        {/* Action Button & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {sessionUser ? (
            <Button asChild size="sm" className="rounded-xl shadow-sm text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700">
              <Link href={sessionUser.isAdmin ? "/admin" : "/dashboard"}>
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{sessionUser.isAdmin ? "لوحة الإدارة" : "لوحة الطالب"}</span>
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="rounded-xl shadow-sm text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700">
              <Link href="/login">
                <LogIn className="h-3.5 w-3.5" />
                <span>تسجيل الدخول</span>
              </Link>
            </Button>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-4 py-3 space-y-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-blue-600 dark:hover:text-blue-400"
          >
            المميزات
          </a>
          <a
            href="#guide"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-blue-600 dark:hover:text-blue-400"
          >
            دليل الاستخدام السريع
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-blue-600 dark:hover:text-blue-400"
          >
            الأسئلة الشائعة
          </a>
        </div>
      )}
    </header>
  );
}
