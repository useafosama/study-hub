"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl text-muted-foreground opacity-70"
        aria-label="تغيير المظهر"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          title="تغيير المظهر (فاتح / داكن)"
          aria-label="تغيير المظهر"
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4 text-primary" />
          ) : theme === "light" ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Monitor className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1.5 shadow-xl border-border bg-popover/95 backdrop-blur-xl">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer ${
            theme === "light" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/80"
          }`}
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>مظهر فاتح</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer ${
            theme === "dark" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/80"
          }`}
        >
          <Moon className="h-4 w-4 text-primary" />
          <span>مظهر داكن</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer ${
            theme === "system" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/80"
          }`}
        >
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span>تلقائي (النظام)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
