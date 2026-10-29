"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Bell,
  Users,
  BookOpen,
  User,
  Sparkles,
  PlayCircle,
  FileText,
  HelpCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Subject, NotificationType } from "@/types/database";
import { createAdminNotificationAction } from "@/actions/notifications";

interface StudentOption {
  id: string;
  full_name: string;
  username: string;
}

interface AdminNotificationDispatcherProps {
  subjects: Subject[];
  students: StudentOption[];
}

export function AdminNotificationDispatcher({
  subjects,
  students,
}: AdminNotificationDispatcherProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [targetType, setTargetType] = React.useState<"all" | "subject" | "user">("all");
  const [targetId, setTargetId] = React.useState<string>("");
  const [type, setType] = React.useState<NotificationType>("announcement");
  const [title, setTitle] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");
  const [link, setLink] = React.useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error("يرجى إدخال عنوان الإشعار ومحتوى الرسالة");
      return;
    }

    if (targetType !== "all" && !targetId) {
      toast.error("يرجى اختيار المادة أو الطالب المستهدف");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAdminNotificationAction({
        type,
        title: title.trim(),
        message: message.trim(),
        targetType,
        targetId: targetType !== "all" ? targetId : null,
        link: link.trim() || null,
      });

      if (res.success) {
        toast.success("تم إرسال الإشعار للطلاب بنجاح 🎉");
        setTitle("");
        setMessage("");
        setLink("");
        router.refresh();
      }
    } catch (err) {
      toast.error("فشل إرسال الإشعار");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-md overflow-hidden">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-2">
            <Send className="h-3.5 w-3.5" />
            <span>نظام البث والإشعارات المباشرة</span>
          </div>
          <h3 className="text-xl font-black text-foreground">
            إرسال إشعار مباشر وفوري للطلاب 📢
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            وجّه تنبيهات مخصصة لجميع الطلاب، أو لمادة معينة، أو لطالب بعينه
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Target Audience Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">
              الفئة المستهدفة بالإشعار:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setTargetType("all");
                  setTargetId("");
                }}
                className={`p-3.5 rounded-2xl text-right border transition-all cursor-pointer flex items-center gap-3 ${
                  targetType === "all"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                    : "bg-secondary/40 hover:bg-secondary border-border/60 text-foreground"
                }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                <div>
                  <div className="text-xs font-black">كافة الطلاب</div>
                  <div className={`text-[10px] ${targetType === "all" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    بث عام للجميع
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetType("subject");
                  setTargetId(subjects[0]?.id || "");
                }}
                className={`p-3.5 rounded-2xl text-right border transition-all cursor-pointer flex items-center gap-3 ${
                  targetType === "subject"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                    : "bg-secondary/40 hover:bg-secondary border-border/60 text-foreground"
                }`}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <div>
                  <div className="text-xs font-black">مادة دراسية محددة</div>
                  <div className={`text-[10px] ${targetType === "subject" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    طلاب المادة فقط
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetType("user");
                  setTargetId(students[0]?.id || "");
                }}
                className={`p-3.5 rounded-2xl text-right border transition-all cursor-pointer flex items-center gap-3 ${
                  targetType === "user"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                    : "bg-secondary/40 hover:bg-secondary border-border/60 text-foreground"
                }`}
              >
                <User className="h-4 w-4 shrink-0" />
                <div>
                  <div className="text-xs font-black">طالب محدد</div>
                  <div className={`text-[10px] ${targetType === "user" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    إشعار فردي خاص
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Target Specific Selection Dropdowns */}
          {targetType === "subject" && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-foreground block">
                اختر المادة المستهدفة:
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-2xl bg-secondary/50 border border-border/80 text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-popover text-foreground">
                    {sub.name} {sub.code ? `(${sub.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === "user" && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-foreground block">
                اختر الطالب المستهدف:
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-2xl bg-secondary/50 border border-border/80 text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id} className="bg-popover text-foreground">
                    {st.full_name} (@{st.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Notification Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              نوع التنبيه:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: "announcement" as NotificationType, label: "إعلان رسمي", icon: Bell },
                { type: "new_lecture" as NotificationType, label: "محاضرة جديدة", icon: PlayCircle },
                { type: "new_resource" as NotificationType, label: "مذكرة / PDF", icon: FileText },
                { type: "new_quiz" as NotificationType, label: "امتحان جديد", icon: HelpCircle },
                { type: "course_update" as NotificationType, label: "تحديث مادة", icon: BookOpen },
                { type: "system" as NotificationType, label: "تنبيه نظام", icon: Sparkles },
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setType(opt.type)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    type === opt.type
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-secondary/30 hover:bg-secondary/70 border-border/60 text-foreground"
                  }`}
                >
                  <opt.icon className="h-3.5 w-3.5" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              عنوان الإشعار:
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تم رفع ملخص المحاضرة الثالثة مع بنك الأسئلة"
              className="rounded-2xl h-11 text-xs"
              required
            />
          </div>

          {/* 4. Message Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              نص الرسالة:
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب تفاصيل التنبيه أو التوجيه للطلاب هنا بوضوح..."
              rows={3}
              className="rounded-2xl text-xs leading-relaxed"
              required
            />
          </div>

          {/* 5. Target Link (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              رابط الإشعار (اختياري - يفتح تلقائياً عند ضغط الطالب):
            </label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="مثال: /content/... أو /subjects/..."
              className="rounded-2xl h-11 text-xs font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl text-xs font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري إرسال الإشعار...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>إرسال الإشعار فوراً</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
