"use client";

import * as React from "react";
import { ExternalLink, Play, AlertCircle } from "lucide-react";
import { extractYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeWatchUrl } from "@/lib/youtube/utils";
import { Button } from "@/components/ui/button";

interface YouTubePlayerProps {
  url: string;
  title?: string;
  className?: string;
}

export function YouTubePlayer({ url, title = "مقطع الفيديو", className = "" }: YouTubePlayerProps) {
  const [hasError, setHasError] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoId = extractYouTubeVideoId(url);
  const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : null;
  const watchUrl = videoId ? getYouTubeWatchUrl(videoId) : url;

  if (!videoId || !embedUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center">
        <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          رابط الفيديو غير صالح أو غير متاح
        </p>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>محاولة الفتح بالمتصفح</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative w-full overflow-hidden rounded-2xl bg-black border border-zinc-800 shadow-lg aspect-video">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
          onError={() => setHasError(true)}
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          يتم العرض مباشرة عبر مشغل YouTube الرسمي
        </span>
        <a
          href={watchUrl || url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
        >
          <span>مشاهدة على YouTube</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
