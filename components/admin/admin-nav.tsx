"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Bell,
  Activity,
  Settings,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "لوحة التحكم الرئيسية", shortLabel: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/users", label: "المستخدمين والطلاب", shortLabel: "الطلاب", icon: Users },
  { href: "/admin/subjects", label: "المواد والمحتوى", shortLabel: "المواد", icon: BookOpen },
  { href: "/admin/announcements", label: "مركز الإعلانات", shortLabel: "الإعلانات", icon: Bell },
  { href: "/admin/activity", label: "سجل التدقيق والنشاطات", shortLabel: "النشاطات", icon: Activity },
  { href: "/admin/settings", label: "إعدادات المنصة", shortLabel: "الإعدادات", icon: Settings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="شريط تنقل الإدارة">
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
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

export function AdminMobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 dark:bg-card/95 backdrop-blur-xl border-t border-border flex items-center justify-around py-2 px-1 safe-bottom shadow-lg"
      aria-label="شريط تنقل الإدارة للهاتف"
    >
      {ADMIN_NAV_ITEMS.slice(0, 5).map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer min-w-[50px] min-h-[48px] active:scale-95 ${
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
              {item.shortLabel}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
