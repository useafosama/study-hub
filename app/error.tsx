"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          حدث خطأ غير متوقع
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          تعذر إتمام العملية المطلوبة حالياً. يرجى إعادة المحاولة.
        </p>
        <Button onClick={() => reset()} className="rounded-xl gap-2 text-xs">
          <RotateCcw className="h-4 w-4" />
          <span>إعادة المحاولة</span>
        </Button>
      </div>
    </div>
  );
}
