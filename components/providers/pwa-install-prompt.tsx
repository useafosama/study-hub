"use client";

import * as React from "react";
import { Download, Smartphone, X, Sparkles, Share, PlusSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [showIOSGuide, setShowIOSGuide] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(false);

  React.useEffect(() => {
    // Check if running as installed standalone app
    const isStandaloneApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneApp);

    if (isStandaloneApp) return;

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if user previously dismissed today
    const dismissedAt = localStorage.getItem("studyhub_pwa_dismissed_time");
    const oneDay = 24 * 60 * 60 * 1000;
    const isRecentlyDismissed = dismissedAt && Date.now() - parseInt(dismissedAt, 10) < oneDay;

    // Listen for Chrome/Android/Desktop install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isRecentlyDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Auto-show prompt after 2 seconds for iOS or if deferred prompt is available
    const timer = setTimeout(() => {
      if (!isStandaloneApp && !isRecentlyDismissed) {
        setShowPrompt(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android / Chrome / Edge / Desktop
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // Show iOS modal guide
      setShowIOSGuide(true);
    } else {
      // Default instruction
      alert("لتثبيت التطبيق: اضغط على خيارات المتصفح (⋮) ثم اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    try {
      localStorage.setItem("studyhub_pwa_dismissed_time", Date.now().toString());
    } catch {}
  };

  // If already running in standalone PWA, don't show anything
  if (isStandalone) return null;

  return (
    <>
      {/* 1. Main Persistent Floating Prompt Banner */}
      {showPrompt && (
        <aside 
          aria-label="تثبيت التطبيق"
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-5 shadow-2xl shadow-blue-500/20 text-right">
            
            {/* Ambient subtle glow */}
            <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-xl pointer-events-none" />

            {/* Close / Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3.5 left-3.5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="إغلاق التنبيه"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3.5 pl-6">
              {/* Animated Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <Smartphone className="h-6 w-6" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    تطبيق منصة الچوو
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                  ثبّت التطبيق على جهازك الآن 🚀
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  احصل على وصول فوري من الشاشة الرئيسية، وسرعة فائقة بدون الحاجة لفتح المتصفح كل مرة.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="rounded-xl text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                لاحقاً
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleInstallClick}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/25 transition-transform hover:scale-105"
              >
                <Download className="h-3.5 w-3.5" />
                <span>تثبيت التطبيق مجاناً</span>
              </Button>
            </div>

          </div>
        </aside>
      )}

      {/* 2. Floating Permanent Mini-Button (Always available when main prompt is hidden) */}
      {!showPrompt && (
        <aside 
          aria-label="زر تثبيت التطبيق"
          className="fixed bottom-5 left-5 z-40"
        >
          <button
            onClick={() => setShowPrompt(true)}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-105 transition-all text-xs font-bold"
            title="تثبيت التطبيق على جهازك"
          >
            <Download className="h-4 w-4 group-hover:animate-bounce" />
            <span className="hidden sm:inline">تثبيت التطبيق</span>
          </button>
        </aside>
      )}

      {/* 3. iOS Safari Step-by-Step Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-right space-y-5">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    تثبيت على أجهزة iPhone & iPad
                  </h3>
                  <p className="text-xs text-zinc-500">اتبع الخطوتين البسيطتين أدناه</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  اضغط على زر المشاركة <strong className="text-blue-600 dark:text-blue-400">Share</strong> في أسفل شاشة متصفح Safari.
                  <div className="mt-1 text-[11px] text-zinc-400 flex items-center gap-1">
                    <Share className="h-3.5 w-3.5 text-blue-500" /> أيقونة المربع بسهم لأعلى
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  مرر للأسفل واختر <strong className="text-blue-600 dark:text-blue-400">"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong> ثم اضغط <strong className="text-emerald-600">Add</strong>.
                  <div className="mt-1 text-[11px] text-zinc-400 flex items-center gap-1">
                    <PlusSquare className="h-3.5 w-3.5 text-emerald-500" /> إضافة إلى الشاشة الرئيسية
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              فهمت ذلك، تم!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
