import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  Search,
  Bell,
  User,
  LogOut,
  GraduationCap,
  Shield,
  Calendar,
  FileEdit,
} from "lucide-react";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  const navItems = [
    { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/subjects", label: "موادي", icon: BookOpen },
    { href: "/planner", label: "خطة المذاكرة", icon: Calendar },
    { href: "/notes", label: "دفتر ملاحظاتي", icon: FileEdit },
    { href: "/bookmarks", label: "المحفوظات", icon: Bookmark },
    { href: "/search", label: "البحث", icon: Search },
    { href: "/announcements", label: "الإعلانات", icon: Bell },
    { href: "/profile", label: "الملف الشخصي", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Background Soft Pastel Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[450px] bg-purple-500/[0.03] rounded-full blur-[140px]" />
      </div>

      {/* Desktop macOS Style Glass Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-l border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl p-4 sticky top-0 h-screen justify-between z-30 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-none truncate block">
                  منصة الچوو
                </span>
                <span className="block text-[11px] text-zinc-400 mt-0.5 truncate font-medium">
                  يوسف أسامة
                </span>
              </div>
            </Link>
            <ThemeToggle />
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-white/90 hover:shadow-xs dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/80 transition-all border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-700/60"
                >
                  <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer */}
        <div className="space-y-3 pt-4 border-t border-zinc-200/60 dark:border-white/10">
          {session.isAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold text-purple-600 bg-purple-500/10 border border-purple-500/20 dark:text-purple-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                لوحة تحكم المشرف
              </span>
            </Link>
          )}

          <div className="flex items-center justify-between px-2 pt-1">
            <Link href="/profile" className="flex items-center gap-2.5 min-w-0 group">
              <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold">
                  {session.profile.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 transition-colors">
                  {session.profile.full_name}
                </p>
                <p className="text-[11px] text-zinc-400 truncate dir-ltr text-right">
                  @{session.profile.username}
                </p>
              </div>
            </Link>

            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="تسجيل الخروج"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl sticky top-0 z-30 shadow-xs">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm">منصة الچوو</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/profile">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold">
                {session.profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Navigation for Students */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-t border-zinc-200/70 dark:border-white/10 flex items-center justify-around py-2 px-1 safe-bottom shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 p-1 text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 text-[10px] font-semibold"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full mb-16 md:mb-0">
        {children}
      </main>
    </div>
  );
}
