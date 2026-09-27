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
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-2xl transition-all shadow-xs">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors">
              منصة الچوو التعليمية
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              يوسف أسامة
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/60 text-xs font-semibold text-muted-foreground">
          <a
            href="#features"
            className="px-4 py-1.5 rounded-xl hover:text-foreground hover:bg-card hover:shadow-xs transition-all duration-150"
          >
            المميزات
          </a>
          <a
            href="#guide"
            className="px-4 py-1.5 rounded-xl hover:text-foreground hover:bg-card hover:shadow-xs transition-all duration-150"
          >
            دليل الاستخدام
          </a>
          <a
            href="#faq"
            className="px-4 py-1.5 rounded-xl hover:text-foreground hover:bg-card hover:shadow-xs transition-all duration-150"
          >
            الأسئلة الشائعة
          </a>
        </nav>

        {/* Action Button & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {sessionUser ? (
            <Button
              asChild
              size="sm"
              className="rounded-2xl text-xs font-bold gap-2 h-9 px-4"
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
              className="rounded-2xl text-xs font-bold gap-2 h-9 px-4"
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
            className="md:hidden p-2 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none transition-colors"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-2xl px-5 py-4 space-y-2 text-xs font-bold text-foreground animate-in fade-in slide-in-from-top-2 duration-150">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl hover:bg-muted transition-colors"
          >
            المميزات
          </a>
          <a
            href="#guide"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl hover:bg-muted transition-colors"
          >
            دليل الاستخدام السريع
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-3 rounded-xl hover:bg-muted transition-colors"
          >
            الأسئلة الشائعة
          </a>
        </div>
      )}
    </header>
  );
}
