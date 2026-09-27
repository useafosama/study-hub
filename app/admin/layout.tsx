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
  Users,
  BookOpen,
  Bell,
  Activity,
  Settings,
  LogOut,
  ExternalLink,
  GraduationCap,
  Menu,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session || !session.isAdmin) {
    redirect("/login");
  }

  const navItems = [
    { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/admin/users", label: "المستخدمين والطلاب", icon: Users },
    { href: "/admin/subjects", label: "المواد والمحتوى", icon: BookOpen },
    { href: "/admin/announcements", label: "الإعلانات", icon: Bell },
    { href: "/admin/activity", label: "سجل النشاطات", icon: Activity },
    { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Background Soft Pastel Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[450px] bg-indigo-500/[0.03] rounded-full blur-[140px]" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-l border-border/70 bg-card/60 backdrop-blur-2xl p-4 sticky top-0 h-screen justify-between z-30 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-foreground leading-none block">
                  منصة الچوو
                </span>
                <span className="block text-[10px] font-bold text-primary mt-0.5">
                  لوحة الإدارة
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all border border-transparent hover:border-border/60"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer actions */}
        <div className="space-y-3 pt-4 border-t border-border/60">
          <Link
            href="/dashboard"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-secondary/60 transition-colors border border-transparent hover:border-border/60"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              معاينة منصة الطلاب
            </span>
          </Link>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold">
                  {session.profile.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">
                  {session.profile.full_name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate dir-ltr text-right">
                  @{session.profile.username}
                </p>
              </div>
            </div>

            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="تسجيل الخروج"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border/70 bg-card/70 backdrop-blur-2xl sticky top-0 z-30 shadow-xs">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm text-foreground">منصة الچوو | الإدارة</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </header>

      {/* Mobile Bottom Navigation for Admin */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-2xl border-t border-border/70 flex items-center justify-around py-2 px-1 safe-bottom shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 p-1 text-muted-foreground hover:text-primary text-[10px] font-semibold"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Admin Content Container */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full mb-16 md:mb-0">
        {children}
      </main>
    </div>
  );
}
