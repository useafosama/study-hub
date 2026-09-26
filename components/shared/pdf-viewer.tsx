"use client";

import * as React from "react";
import { FileText, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  url: string;
  title?: string;
  className?: string;
}

export function PDFViewer({ url, title = "ملف المحاضرة (PDF)", className = "" }: PDFViewerProps) {
  // Determine provider hint
  const getProviderName = (targetUrl: string) => {
    try {
      const u = new URL(targetUrl);
      if (u.hostname.includes("drive.google.com")) return "Google Drive";
      if (u.hostname.includes("onedrive.live.com") || u.hostname.includes("1drv.ms") || u.hostname.includes("sharepoint.com")) return "OneDrive";
      if (u.hostname.includes("dropbox.com")) return "Dropbox";
      return "رابط خارجي معتمد";
    } catch {
      return "ملف خارجي";
    }
  };

  const provider = getProviderName(url);

  return (
    <div
      className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm transition-all hover:border-red-200 dark:hover:border-red-900/40 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            مستند PDF • مستضاف عبر {provider}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none rounded-xl gap-2 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900/50"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <span>فتح ملف PDF</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
