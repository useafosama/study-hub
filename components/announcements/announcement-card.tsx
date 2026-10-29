"use client";

import * as React from "react";
import Link from "next/link";
import { DetailedAnnouncement } from "@/types/database";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Globe,
  BookOpen,
  FileCheck,
  AlertTriangle,
  Cpu,
  Check,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

interface AnnouncementCardProps {
  announcement: DetailedAnnouncement;
  isFocused?: boolean;
  onMarkAsRead?: (id: string) => void;
}

export function AnnouncementCard({
  announcement,
  isFocused = false,
  onMarkAsRead,
}: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(isFocused);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isFocused) {
      setIsExpanded(true);
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isFocused]);

  const isLong = announcement.clean_content.length > 220;
  const displayContent = isExpanded || !isLong
    ? announcement.clean_content
    : `${announcement.clean_content.slice(0, 220)}...`;

  const getTypeBadge = () => {
    switch (announcement.type) {
      case "exam":
        return (
          <Badge variant="outline" className="gap-1.5 text-xs bg-amber-500/10 text-amber-500 border-amber-500/30 font-medium">
            <FileCheck className="h-3 w-3" />
            امتحان
          </Badge>
        );
      case "course":
        return (
          <Badge variant="outline" className="gap-1.5 text-xs bg-purple-500/10 text-purple-400 border-purple-500/30 font-medium">
            <BookOpen className="h-3 w-3" />
            إعلان مادة
          </Badge>
        );
      case "important":
        return (
          <Badge variant="outline" className="gap-1.5 text-xs bg-red-500/10 text-red-400 border-red-500/30 font-medium">
            <AlertTriangle className="h-3 w-3" />
            تنبيه هام
          </Badge>
        );
      case "system":
        return (
          <Badge variant="outline" className="gap-1.5 text-xs bg-blue-500/10 text-blue-400 border-blue-500/30 font-medium">
            <Cpu className="h-3 w-3" />
            تحديث نظام
          </Badge>
        );
      case "general":
      default:
        return (
          <Badge variant="outline" className="gap-1.5 text-xs bg-secondary/70 text-muted-foreground border-border/80 font-medium">
            <Globe className="h-3 w-3" />
            عام
          </Badge>
        );
    }
  };

  const getPriorityBadge = () => {
    switch (announcement.priority) {
      case "urgent":
        return (
          <Badge className="bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30 text-xs gap-1 font-semibold hover:bg-red-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            عاجل
          </Badge>
        );
      case "important":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs gap-1 font-semibold hover:bg-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            هام
          </Badge>
        );
      case "normal":
      default:
        return (
          <Badge variant="secondary" className="text-xs text-muted-foreground/90 font-normal">
            عادي
          </Badge>
        );
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/announcements?id=${announcement.id}`;
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ رابط الإعلان بنجاح");
  };

  return (
    <Card
      ref={cardRef}
      id={`announcement-${announcement.id}`}
      className={`apple-card p-5 sm:p-6 transition-all duration-300 relative overflow-hidden ${
        isFocused
          ? "ring-2 ring-primary shadow-lg shadow-primary/10 border-primary/40"
          : !announcement.is_read
          ? "border-primary/30 bg-card/95 shadow-sm"
          : "border-border/60 hover:border-border"
      }`}
    >
      {/* Unread Glow Accent */}
      {!announcement.is_read && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary via-blue-400 to-primary/40" />
      )}

      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-border/50">
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority */}
          {getPriorityBadge()}

          {/* Type */}
          {getTypeBadge()}

          {/* Course Badge if applicable */}
          {announcement.subject_id && announcement.subject_name && (
            <Link
              href={`/subjects/${announcement.subject_id}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 transition-colors"
            >
              <BookOpen className="h-3 w-3" />
              <span>{announcement.subject_name}</span>
            </Link>
          )}

          {/* Unread Indicator */}
          {!announcement.is_read && (
            <span className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-primary" />
              جديد
            </span>
          )}
        </div>

        {/* Date & Relative Time */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 text-muted-foreground/70" />
          <span>{formatRelativeTime(announcement.created_at)}</span>
          <span className="text-muted-foreground/40 hidden sm:inline">•</span>
          <span className="hidden sm:inline">{formatDate(announcement.created_at)}</span>
        </div>
      </div>

      {/* Title & Author */}
      <div className="pt-3 pb-1">
        <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight">
          {announcement.title}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground/70" />
            <span>{announcement.author_name || "إدارة المنصة"}</span>
          </span>

          {announcement.expires_at && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs text-muted-foreground">
                ينتهي في: {formatDate(announcement.expires_at)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {displayContent}
      </div>

      {/* Expand/Collapse Button if long */}
      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          {isExpanded ? (
            <>
              <span>عرض أقل</span>
              <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <span>قراءة الإعلان كاملاً</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      )}

      {/* Card Actions Footer */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">نسخ الرابط</span>
        </Button>

        <div>
          {announcement.is_read ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/80 px-2 py-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>تمت القراءة</span>
            </span>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onMarkAsRead?.(announcement.id)}
              className="h-8 px-3 text-xs gap-1.5 rounded-xl font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              <span>تحديد كمقروء</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
