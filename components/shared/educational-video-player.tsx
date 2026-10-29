"use client";

import * as React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  Settings,
  Bookmark,
  FileEdit,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Clock,
  Check,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { extractYouTubeVideoId, getYouTubeWatchUrl } from "@/lib/youtube/utils";
import {
  getVideoProgress,
  saveVideoProgress,
  formatTimestamp,
} from "@/lib/storage/video-progress";
import {
  addVideoBookmark,
} from "@/lib/storage/video-bookmarks";
import {
  addTimestampNote,
} from "@/lib/storage/video-notes";

interface EducationalVideoPlayerProps {
  url: string;
  title: string;
  contentId: string;
  onCompletionThreshold?: () => void;
  onSeekRequested?: (timestamp: number) => void;
  activeSeekTimestamp?: number | null;
  className?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export function EducationalVideoPlayer({
  url,
  title,
  contentId,
  onCompletionThreshold,
  activeSeekTimestamp,
  className = "",
}: EducationalVideoPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const playerRef = React.useRef<any>(null);

  const videoId = extractYouTubeVideoId(url);
  const watchUrl = videoId ? getYouTubeWatchUrl(videoId) : url;

  // Player States
  const [isPlayerReady, setIsPlayerReady] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(100);
  const [isMuted, setIsMuted] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState<number>(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [hasCompletedNotified, setHasCompletedNotified] = React.useState(false);

  // Resume Banner State
  const [resumePrompt, setResumePrompt] = React.useState<{
    timestamp: number;
    formatted: string;
  } | null>(null);

  // Add Bookmark Dialog State
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = React.useState(false);
  const [bookmarkTitle, setBookmarkTitle] = React.useState("");

  // Add Timestamp Note Dialog State
  const [isNoteModalOpen, setIsNoteModalOpen] = React.useState(false);
  const [noteText, setNoteText] = React.useState("");

  // Controls visibility timer
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const playerId = React.useId().replace(/:/g, "_");

  // 1. Check for stored resume position on mount
  React.useEffect(() => {
    const saved = getVideoProgress(contentId);
    if (saved && saved.currentTime > 15 && saved.duration > 30) {
      if (saved.currentTime < saved.duration - 15) {
        setResumePrompt({
          timestamp: saved.currentTime,
          formatted: formatTimestamp(saved.currentTime),
        });
      }
    }
  }, [contentId]);

  // 2. Load YouTube IFrame API script
  React.useEffect(() => {
    if (!videoId) return;

    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      try {
        playerRef.current = new window.YT.Player(`yt_player_${playerId}`, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1, // enable YouTube's native controls as solid baseline
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              setIsPlayerReady(true);
              setDuration(event.target.getDuration() || 0);
              setPlaybackRate(event.target.getPlaybackRate() || 1);
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                setIsPlaying(false);
                // Mark finished
                if (onCompletionThreshold && !hasCompletedNotified) {
                  setHasCompletedNotified(true);
                  onCompletionThreshold();
                }
              }
            },
            onError: () => {
              if (isMounted) setHasError(true);
            },
          },
        });
      } catch (err) {
        console.debug("YouTube Player init error:", err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingTag = document.getElementById("yt-iframe-api-script");
      if (!existingTag) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        if (isMounted) initPlayer();
      };
    }

    return () => {
      isMounted = false;
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
  }, [videoId, playerId, onCompletionThreshold, hasCompletedNotified]);

  // 3. Ticker for Progress Tracking & Auto-Save
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlayerReady) {
      interval = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          try {
            const time = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || duration;
            setCurrentTime(time);
            if (dur > 0 && dur !== duration) setDuration(dur);

            // Auto-save progress
            if (dur > 0 && time > 0) {
              saveVideoProgress(contentId, {
                currentTime: time,
                duration: dur,
                videoId: videoId || undefined,
              });

              // Completion threshold check (85%)
              if (
                dur > 60 &&
                time / dur >= 0.85 &&
                onCompletionThreshold &&
                !hasCompletedNotified
              ) {
                setHasCompletedNotified(true);
                onCompletionThreshold();
              }
            }
          } catch {}
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayerReady, duration, contentId, videoId, onCompletionThreshold, hasCompletedNotified]);

  // 4. Handle external seek requests (e.g. from timestamp notes or bookmarks)
  React.useEffect(() => {
    if (activeSeekTimestamp != null && playerRef.current) {
      seekTo(activeSeekTimestamp);
      if (resumePrompt) setResumePrompt(null);
    }
  }, [activeSeekTimestamp]);

  // 5. Player Actions
  const togglePlay = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
        if (resumePrompt) setResumePrompt(null);
      }
    } catch {}
  };

  const seekTo = (seconds: number) => {
    if (!playerRef.current) return;
    try {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    } catch {}
  };

  const handleSeekRelative = (secondsOffset: number) => {
    const target = Math.max(0, Math.min(duration, currentTime + secondsOffset));
    seekTo(target);
  };

  const handleRateChange = (rate: number) => {
    if (!playerRef.current) return;
    try {
      playerRef.current.setPlaybackRate(rate);
      setPlaybackRate(rate);
      toast.info(`سرعة التشغيل: ${rate}x`);
    } catch {}
  };

  const handleToggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch {}
  };

  const handleFullscreenToggle = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (e) {
      console.debug("Fullscreen toggle error:", e);
    }
  };

  // Fullscreen change listener
  React.useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // 6. Keyboard Shortcuts Handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleSeekRelative(-10); // rewind 10s
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSeekRelative(10); // forward 10s
          break;
        case "KeyF":
          e.preventDefault();
          handleFullscreenToggle();
          break;
        case "KeyM":
          e.preventDefault();
          handleToggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentTime, duration, isMuted]);

  // 7. Resume Action Handler
  const handleResumeClick = () => {
    if (resumePrompt) {
      seekTo(resumePrompt.timestamp);
      if (playerRef.current) {
        try {
          playerRef.current.playVideo();
          setIsPlaying(true);
        } catch {}
      }
      setResumePrompt(null);
      toast.success(`تم استئناف المحاضرة من ${resumePrompt.formatted} ⏱️`);
    }
  };

  const handleRestartClick = () => {
    seekTo(0);
    setResumePrompt(null);
  };

  // 8. Add Bookmark Handler
  const handleSaveBookmark = () => {
    const ts = Math.floor(currentTime);
    const titleToSave = bookmarkTitle.trim() || `علامة زمنية عند ${formatTimestamp(ts)}`;
    addVideoBookmark(contentId, ts, titleToSave);
    setIsBookmarkModalOpen(false);
    setBookmarkTitle("");
    toast.success(`تم حفظ العلامة الزمنية (${formatTimestamp(ts)}) 🔖`);
  };

  // 9. Add Note Handler
  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    const ts = Math.floor(currentTime);
    addTimestampNote(contentId, ts, noteText);
    setIsNoteModalOpen(false);
    setNoteText("");
    toast.success(`تمت إضافة ملاحظة عند ${formatTimestamp(ts)} 📝`);
  };

  // Invalid Video Fallback
  if (!videoId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-secondary/40 border border-border text-center space-y-3">
        <AlertCircle className="w-9 h-9 text-amber-500" />
        <h4 className="text-sm font-bold text-foreground">رابط الفيديو غير صالح أو غير متاح</h4>
        <p className="text-xs text-muted-foreground max-w-sm">
          يرجى التأكد من إضافة رابط YouTube صحيح لهذه المحاضرة
        </p>
        {url && (
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 mt-2">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <span>محاولة الفتح بالمتصفح</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        )}
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden bg-black border border-border/80 shadow-2xl group select-none ${className}`}
    >
      {/* Resume Watching Floating Banner */}
      {resumePrompt && (
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between p-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 text-white shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-black">استئناف المتابعة من حيث توقفت؟</div>
              <div className="text-[11px] text-zinc-300">توقفت سابقاً عند الدقيقة {resumePrompt.formatted}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleResumeClick}
              className="rounded-xl h-8 px-3 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
            >
              استئناف الآن
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestartClick}
              className="rounded-xl h-8 px-2.5 text-xs text-zinc-300 hover:text-white hover:bg-white/10"
            >
              من البداية
            </Button>
          </div>
        </div>
      )}

      {/* Main Video Screen Container */}
      <div className="relative aspect-video w-full bg-black">
        <div id={`yt_player_${playerId}`} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Premium Apple Educational Control Bar */}
      <div className="p-3.5 sm:p-4 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 text-white space-y-3">
        {/* Scrubber Progress Slider */}
        <div className="relative flex items-center group/scrubber cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary group-hover/scrubber:h-2.5 transition-all"
            style={{
              background: `linear-gradient(to left, #3b82f6 ${progressPercent}%, #27272a ${progressPercent}%)`,
            }}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left / Primary Controls (Play, Skip, Time, Volume) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-10 w-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              title={isPlaying ? "إيقاف مؤقت (Space)" : "تشغيل (Space)"}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </Button>

            {/* Rewind 10s */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSeekRelative(-10)}
              className="h-9 px-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-bold"
              title="تراجع 10 ثوانٍ (Arrow Left)"
            >
              <span>-10 ث</span>
            </Button>

            {/* Forward 10s */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSeekRelative(10)}
              className="h-9 px-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-bold"
              title="تقديم 10 ثوانٍ (Arrow Right)"
            >
              <span>+10 ث</span>
            </Button>

            {/* Time Indicator */}
            <div className="text-xs font-mono font-semibold text-zinc-400 px-1 dir-ltr">
              <span className="text-white">{formatTimestamp(currentTime)}</span>
              <span className="text-zinc-600 mx-1">/</span>
              <span>{formatTimestamp(duration)}</span>
            </div>

            {/* Mute Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleMute}
              className="h-9 w-9 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10"
              title={isMuted ? "إلغاء الكتم (M)" : "كتم الصوت (M)"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Right / Educational Tools (Bookmark, Note, Speed, Fullscreen) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Timestamp Bookmark Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarkModalOpen(true)}
              className="h-9 px-2.5 rounded-xl text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 gap-1.5"
              title="حفظ علامة زمنية عند هذا التوقيت"
            >
              <Bookmark className="h-3.5 w-3.5 fill-current" />
              <span className="hidden sm:inline">علامة زمنية</span>
            </Button>

            {/* Timestamp Note Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNoteModalOpen(true)}
              className="h-9 px-2.5 rounded-xl text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-sky-400/10 gap-1.5"
              title="إضافة ملاحظة عند هذا التوقيت"
            >
              <FileEdit className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ملاحظة زمنية</span>
            </Button>

            {/* Playback Rate Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2 rounded-xl text-xs font-bold font-mono text-zinc-300 hover:text-white hover:bg-white/10"
                >
                  {playbackRate}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-28 rounded-2xl bg-zinc-900 border-zinc-800 text-white">
                {PLAYBACK_SPEEDS.map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className="cursor-pointer text-xs font-bold font-mono py-1.5 flex items-center justify-between"
                  >
                    <span>{rate}x</span>
                    {playbackRate === rate && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreenToggle}
              className="h-9 w-9 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10"
              title={isFullscreen ? "إنهاء ملء الشاشة (F)" : "ملء الشاشة (F)"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal: Add Bookmark at current timestamp */}
      <Dialog open={isBookmarkModalOpen} onOpenChange={setIsBookmarkModalOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-amber-500 fill-current" />
              <span>حفظ علامة زمنية عند {formatTimestamp(currentTime)}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                عنوان العلامة الزمنية:
              </label>
              <Input
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
                placeholder="مثال: تعريف هام في المحاضرة"
                className="rounded-xl text-xs"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBookmarkModalOpen(false)}
                className="flex-1 rounded-xl text-xs"
              >
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={handleSaveBookmark}
                className="flex-1 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white"
              >
                حفظ العلامة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Add Timestamp Note */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <FileEdit className="h-4 w-4 text-sky-500" />
              <span>تدوين ملاحظة عند {formatTimestamp(currentTime)}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                اكتب ملاحظتك على هذا الجزء من المحاضرة:
              </label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="مثال: شرح الأستاذ يوسف أسامة لمعادلة الحساب الختامي وطريقة حلها..."
                rows={3}
                className="rounded-xl text-xs leading-relaxed"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNoteModalOpen(false)}
                className="flex-1 rounded-xl text-xs"
              >
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNote}
                className="flex-1 rounded-xl text-xs font-bold bg-primary text-primary-foreground"
              >
                حفظ الملاحظة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
