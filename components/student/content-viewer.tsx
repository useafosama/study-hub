"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  toggleContentCompletionAction,
  toggleBookmarkAction,
} from "@/actions/student";
import { YouTubePlayer } from "@/components/shared/youtube-player";
import { PDFViewer } from "@/components/shared/pdf-viewer";
import { SmartNotes } from "@/components/student/smart-notes";
import { saveRecentViewed } from "@/components/student/continue-learning-widget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Bookmark,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Share2,
  Layers,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { Content, Subject, Resource } from "@/types/database";

interface ContentViewerProps {
  content: Content;
  subject: Subject;
  prevContent?: { id: string; title: string; type: string } | null;
  nextContent?: { id: string; title: string; type: string } | null;
}

export function ContentViewer({
  content,
  subject,
  prevContent,
  nextContent,
}: ContentViewerProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = React.useState(content.is_completed || false);
  const [isBookmarked, setIsBookmarked] = React.useState(content.is_bookmarked || false);
  const [isPending, setIsPending] = React.useState(false);

  // Sync to localStorage on visit
  React.useEffect(() => {
    saveRecentViewed({
      contentId: content.id,
      contentTitle: content.title,
      contentType: content.type,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
    });
  }, [content, subject]);

  const handleToggleCompleted = async () => {
    setIsPending(true);
    try {
      const res = await toggleContentCompletionAction(content.id, isCompleted, subject.id);
      if (res.success) {
        setIsCompleted(res.isCompleted);
        if (res.isCompleted) {
          toast.success("رائع! تم تحديد المحتوى كمكتمل 🎉");
        } else {
          toast.info("تم إلغاء تحديد الإكمال");
        }
        router.refresh();
      }
    } catch {
      toast.error("فشل تحديث حالة الإكمال");
    } finally {
      setIsPending(false);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await toggleBookmarkAction(content.id, isBookmarked);
      if (res.success) {
        setIsBookmarked(res.isBookmarked);
        if (res.isBookmarked) {
          toast.success("تمت الإضافة إلى المحفوظات 🔖");
        } else {
          toast.info("تمت الإزالة من المحفوظات");
        }
        router.refresh();
      }
    } catch {
      toast.error("فشل حفظ العنصر");
    }
  };

  const videoResource = content.resources?.find((r) => r.type === "video");
  const pdfResources = content.resources?.filter((r) => r.type === "pdf") || [];
  const linkResources = content.resources?.filter((r) => r.type === "link") || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={`/subjects/${subject.id}`} className="hover:text-foreground flex items-center gap-1.5 transition-colors">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>{subject.name}</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 rotate-180 text-muted-foreground" />
          <Badge variant={content.type === "lecture" ? "default" : "purple"} className="text-[10px]">
            {content.type === "lecture" ? "محاضرة" : "سكشن"}
          </Badge>
        </div>

        {/* Action buttons: Bookmark & Complete */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleBookmark}
            className={`rounded-xl gap-1.5 text-xs transition-all ${
              isBookmarked
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : ""
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
            <span>{isBookmarked ? "محفوظ" : "حفظ"}</span>
          </Button>

          <Button
            variant={isCompleted ? "secondary" : "default"}
            size="sm"
            disabled={isPending}
            onClick={handleToggleCompleted}
            className={`rounded-xl gap-1.5 text-xs transition-all ${
              isCompleted
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                : ""
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${isCompleted ? "text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" : ""}`} />
            <span>{isCompleted ? "تم الإكمال ✓" : "تحديد كمكتمل"}</span>
          </Button>
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {content.title}
        </h1>
        {content.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {content.description}
          </p>
        )}
      </div>

      {/* YouTube Video Section */}
      {videoResource ? (
        <div className="space-y-2">
          <YouTubePlayer
            url={videoResource.url}
            title={videoResource.title || content.title}
          />
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground bg-muted/20">
          لا يوجد مقطع فيديو مرفق بهذه المحاضرة
        </div>
      )}

      {/* Smart Lecture Notes */}
      <SmartNotes
        contentId={content.id}
        contentTitle={content.title}
        subjectId={subject.id}
        subjectName={subject.name}
        subjectCode={subject.code}
      />

      {/* Materials & Attachments Section */}
      {(pdfResources.length > 0 || linkResources.length > 0) && (
        <div className="space-y-3 pt-4 border-t border-border/60">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-red-500" />
            الملفات والمرفقات الدراسية
          </h2>

          <div className="space-y-2.5">
            {pdfResources.map((pdf) => (
              <PDFViewer key={pdf.id} url={pdf.url} title={pdf.title} />
            ))}

            {linkResources.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LinkIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {link.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">رابط خارجي معتمد</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <span>زيارة الرابط</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer (Previous / Next) */}
      <div className="pt-6 border-t border-border/60 flex items-center justify-between gap-4">
        {prevContent ? (
          <Button asChild variant="outline" className="rounded-xl gap-2 text-xs flex-1 sm:flex-none justify-start">
            <Link href={`/content/${prevContent.id}`}>
              <ArrowRight className="h-4 w-4" />
              <div className="text-right">
                <span className="block text-[10px] text-muted-foreground">المحتوى السابق</span>
                <span className="font-semibold line-clamp-1">{prevContent.title}</span>
              </div>
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {nextContent && (
          <Button asChild variant="default" className="rounded-xl gap-2 text-xs flex-1 sm:flex-none justify-end">
            <Link href={`/content/${nextContent.id}`}>
              <div className="text-left">
                <span className="block text-[10px] text-primary-foreground/70">المحتوى التالي</span>
                <span className="font-semibold line-clamp-1">{nextContent.title}</span>
              </div>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

