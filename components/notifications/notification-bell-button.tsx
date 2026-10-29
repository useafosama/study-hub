"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getStoredReadIds } from "@/lib/storage/notifications";

interface NotificationBellButtonProps {
  initialUnreadCount?: number;
  className?: string;
}

export function NotificationBellButton({
  initialUnreadCount = 0,
  className = "",
}: NotificationBellButtonProps) {
  const [unreadCount, setUnreadCount] = React.useState<number>(initialUnreadCount);

  // Sync with client read states
  React.useEffect(() => {
    const localReadIds = getStoredReadIds();
    if (localReadIds.size > 0 && initialUnreadCount > 0) {
      setUnreadCount((prev) => Math.max(0, prev - localReadIds.size));
    }
  }, [initialUnreadCount]);

  return (
    <Link
      href="/notifications"
      className={`relative flex items-center justify-center rounded-2xl h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all ${className}`}
      title="مركز الإشعارات والتنبيهات"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-xs animate-in zoom-in-50">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
