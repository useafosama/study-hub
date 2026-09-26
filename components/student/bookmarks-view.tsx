"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleBookmarkAction } from "@/actions/student";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Bookmark,
  BookOpen,
  Video,
  FileText,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Bookmark as BookmarkType } from "@/types/database";

interface BookmarksViewProps {
  initialBookmarks: BookmarkType[];
}

export function BookmarksView({ initialBookmarks }: BookmarksViewProps) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = React.useState<BookmarkType[]>(initialBookmarks);

  React.useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  const handleRemoveBookmark = async (contentId: string) => {
    try {
      const res = await toggleBookmarkAction(contentId, true);
      if (res.success) {
        setBookmarks((prev) => prev.filter((b) => b.content_id !== contentId));
        toast.success("تمت إزالة المحاضرة من المحفوظات");
        router.refresh();
      }
    } catch {
      toast.error("فشل حذف العلامة المرجعية");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          المحاضرات والمحتويات المحفوظة
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          قائمة المحاضرات والسكاشن التي قمت بتمييزها للرجوع إليها سريعاً
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="لم تقم بحفظ أي محتوى بعد"
          description="أثناء تصفح المحاضرات، اضغط على زر 'حفظ' لتظهر لك هنا في أي وقت"
          action={
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link href="/subjects">تصفح المواد</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b) => {
            const content = b.content;
            const subject = b.subject;
            if (!content) return null;

            const hasVideo = content.resources?.some((r) => r.type === "video");
            const hasPdf = content.resources?.some((r) => r.type === "pdf");

            return (
              <Card
                key={b.content_id}
                className="apple-card p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {subject?.code}
                    </Badge>
                    <Badge variant={content.type === "lecture" ? "default" : "purple"} className="text-[10px]">
                      {content.type === "lecture" ? "محاضرة" : "سكشن"}
                    </Badge>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {content.title}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    مادة {subject?.name} • حُفظت في {formatDate(b.created_at)}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
                    {hasVideo && (
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <Video className="h-3 w-3" />
                        فيديو
                      </span>
                    )}
                    {hasPdf && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <FileText className="h-3 w-3" />
                        PDF
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBookmark(b.content_id)}
                    className="h-8 rounded-xl text-xs text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>إزالة</span>
                  </Button>

                  <Button asChild size="sm" className="h-8 rounded-xl text-xs gap-1.5 font-medium shadow-sm">
                    <Link href={`/content/${b.content_id}`}>
                      <span>فتح</span>
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
