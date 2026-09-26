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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              خطة المذاكرة والجدول الأسبوعي
            </h1>
            <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400">
              {completedCount} / {totalCount} مكتمل
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            نظّم وقتك ووزّع مهامك ومحاضراتك على مدار أيام الأسبوع لضمان أعلى تركيز
          </p>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-2 shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة مهمة دراسية جديدة</span>
        </Button>
      </div>

      {/* Weekly Progress Banner */}
      <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-zinc-700 dark:text-zinc-300">نسبة إنجاز مهام الأسبوع</span>
          <span className="text-blue-600 dark:text-blue-400">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Add Task Drawer/Form */}
      {isAdding && (
        <form
          onSubmit={handleAddTask}
          className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-950/20 dark:via-zinc-900 dark:to-indigo-950/20 p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-600" />
            <span>بيانات المهمة الدراسية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                عنوان المهمة / المحاضرة
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: مذاكرة المحاضرة 4 + حل أسئلة الـ PDF"
                className="rounded-xl bg-white dark:bg-zinc-950 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">اليوم</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value as StudyTask["day"])}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {WEEK_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                التوقيت (اختياري)
              </label>
              <Input
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="مثال: 07:00 مساءً"
                className="rounded-xl bg-white dark:bg-zinc-950 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                المادة (اختياري)
              </label>
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="مثال: الفيزياء أو الجبر"
                className="rounded-xl bg-white dark:bg-zinc-950 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">الأهمية</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
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
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedDay === "الكل"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDay === day
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
              }`}
            >
              {day} {dayCount > 0 && `(${dayCount})`}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-10 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/30 space-y-2">
          <Calendar className="h-8 w-8 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            لا توجد مهام دراسية مضافة {selectedDay !== "الكل" && `ليوم ${selectedDay}`}
          </h3>
          <p className="text-xs text-zinc-400">
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
                    ? "bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 opacity-70"
                    : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-500/40"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(task.id)}
                    className="shrink-0 text-zinc-400 hover:text-emerald-600 transition-colors"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/40" />
                    ) : (
                      <Circle className="h-5 w-5 hover:text-blue-600" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <p
                      className={`text-sm font-bold text-zinc-900 dark:text-zinc-100 ${
                        task.isCompleted ? "line-through text-zinc-400 dark:text-zinc-500" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {task.day}
                      </span>
                      {task.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.time}
                        </span>
                      )}
                      {task.subjectName && (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
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
                    className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-rose-600"
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
