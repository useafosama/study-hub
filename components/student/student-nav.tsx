"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  BarChart3,
  Bell,
  FileEdit,
  Bookmark,
  Search,
  User,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string | null;
}

export const DESKTOP_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/subjects", label: "المواد الدراسية", icon: BookOpen },
  { href: "/planner", label: "خطة المذاكرة", icon: Calendar },
  { href: "/analytics", label: "التحليلات التعليمية", icon: BarChart3 },
  { href: "/announcements", label: "مركز الإعلانات", icon: Bell },
  { href: "/notes", label: "دفتر ملاحظاتي", icon: FileEdit },
  { href: "/bookmarks", label: "المحفوظات", icon: Bookmark },
  { href: "/search", label: "البحث في المحتوى", icon: Search },
  { href: "/profile", label: "الملف الشخصي", icon: User },
];

export const MOBILE_BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/subjects", label: "المواد", icon: BookOpen },
  { href: "/planner", label: "المذاكرة", icon: Calendar },
  { href: "/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/profile", label: "حسابي", icon: User },
];

export function DesktopSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="شريط التنقل الجانبي">
      {DESKTOP_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 group ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 active:scale-[0.99]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span>{item.label}</span>
            </div>

            {isActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 dark:bg-card/95 backdrop-blur-xl border-t border-border flex items-center justify-around py-2 px-2 safe-bottom shadow-lg"
      aria-label="شريط التنقل السفلي للهاتف"
    >
      {MOBILE_BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer min-w-[56px] min-h-[48px] active:scale-95 ${
              isActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isActive ? "bg-primary/15 text-primary" : ""
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] leading-none tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
