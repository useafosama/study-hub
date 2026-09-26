import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
          <FileQuestion className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          الصفحة أو المحتوى غير موجود
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          المحتوى الذي تحاول الوصول إليه غير موجود أو تم نقله أو ليس لديك صلاحية لمشاهدته.
        </p>
        <div className="pt-2">
          <Button asChild className="rounded-xl shadow-sm gap-2">
            <Link href="/dashboard">
              <span>العودة للرئيسية</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
