"use client";

import * as React from "react";
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  Flame,
  BookOpen,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  getStoredTasks, 
  saveTask, 
  toggleTaskStatus, 
  deleteTask, 
  StudyTask, 
  WEEK_DAYS 
} from "@/lib/storage/planner";

export default function StudyPlannerPage() {
  const [tasks, setTasks] = React.useState<StudyTask[]>([]);
  const [selectedDay, setSelectedDay] = React.useState<string>("الكل");
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDay, setNewDay] = React.useState<StudyTask["day"]>("السبت");
  const [newTime, setNewTime] = React.useState("");
  const [newSubject, setNewSubject] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<"high" | "medium" | "low">("medium");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setTasks(getStoredTasks());
  }, []);

  const handleToggle = (id: string) => {
    const updated = toggleTaskStatus(id);
    setTasks([...updated]);
    const task = updated.find((t) => t.id === id);
    if (task?.isCompleted) {
      toast.success("أحسنت! تم إنجاز المهمة بنجاح 🎯");
    }
  };

  const handleDelete = (id: string) => {
    const updated = deleteTask(id);
    setTasks([...updated]);
    toast.info("تم حذف المهمة");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("يرجى كتابة عنوان للمهمة الدراسية");
      return;
    }

    const created = saveTask({
      title: newTitle.trim(),
      day: newDay,
      time: newTime.trim() || undefined,
      subjectName: newSubject.trim() || undefined,
      priority: newPriority,
      isCompleted: false,
    });

    setTasks(getStoredTasks());
    setNewTitle("");
    setNewTime("");
    setNewSubject("");
    setIsAdding(false);
    toast.success("تمت إضافة المهمة إلى جدولك الأسبوعي 📅");
  };

  if (!mounted) return null;

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = selectedDay === "الكل" 
    ? tasks 
    : tasks.filter((t) => t.day === selectedDay);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              خطة المذاكرة والجدول الأسبوعي
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {completedCount} / {totalCount} مكتمل
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            نظّم وقتك ووزّع مهامك ومحاضراتك على مدار أيام الأسبوع لضمان أعلى تركيز
          </p>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-2 shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة مهمة دراسية جديدة</span>
        </Button>
      </div>

      {/* Weekly Progress Banner */}
      <div className="rounded-3xl border border-border bg-card p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-foreground">نسبة إنجاز مهام الأسبوع</span>
          <span className="text-primary">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Add Task Drawer/Form */}
      {isAdding && (
        <form
          onSubmit={handleAddTask}
          className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-5 sm:p-6 space-y-4 shadow-xs animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <span>بيانات المهمة الدراسية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-foreground">
                عنوان المهمة / المحاضرة
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: مذاكرة المحاضرة 4 + حل أسئلة الـ PDF"
                className="rounded-xl bg-background text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">اليوم</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value as StudyTask["day"])}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {WEEK_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                التوقيت (اختياري)
              </label>
              <Input
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="مثال: 07:00 مساءً"
                className="rounded-xl bg-background text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                المادة (اختياري)
              </label>
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="مثال: الفيزياء أو الجبر"
                className="rounded-xl bg-background text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">الأهمية</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="high">عالية (هام وعاجل 🔴)</option>
                <option value="medium">متوسطة (عادي 🟡)</option>
                <option value="low">منخفضة (مراجعة خفيفة 🟢)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="rounded-xl text-xs"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs"
            >
              حفظ المهمة
            </Button>
          </div>
        </form>
      )}

      {/* Days Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedDay("الكل")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedDay === "الكل"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          كل الأسبوع ({tasks.length})
        </button>
        {WEEK_DAYS.map((day) => {
          const dayCount = tasks.filter((t) => t.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDay === day
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {day} {dayCount > 0 && `(${dayCount})`}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-10 text-center rounded-3xl border border-dashed border-border bg-card/40 space-y-2">
          <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            لا توجد مهام دراسية مضافة {selectedDay !== "الكل" && `ليوم ${selectedDay}`}
          </h3>
          <p className="text-xs text-muted-foreground">
            اضغط على "إضافة مهمة دراسية جديدة" لتنظيم جدولك
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  task.isCompleted
                    ? "bg-muted/40 border-border/60 opacity-70"
                    : "bg-card border-border shadow-xs hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(task.id)}
                    className="shrink-0 text-muted-foreground hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="h-5 w-5 hover:text-primary" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <p
                      className={`text-sm font-bold text-foreground ${
                        task.isCompleted ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-primary">
                        {task.day}
                      </span>
                      {task.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.time}
                        </span>
                      )}
                      {task.subjectName && (
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {task.subjectName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      task.priority === "high"
                        ? "bg-rose-500"
                        : task.priority === "medium"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    title={`الأهمية: ${task.priority}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

