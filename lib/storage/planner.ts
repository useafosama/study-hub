export interface StudyTask {
  id: string;
  title: string;
  day: "السبت" | "الأحد" | "الإثنين" | "الثلاثاء" | "الأربعاء" | "الخميس" | "الجمعة";
  time?: string;
  subjectName?: string;
  isCompleted: boolean;
  priority: "high" | "medium" | "low";
  createdAt: number;
}

const PLANNER_STORAGE_KEY = "studyhub_study_planner_tasks";

export const WEEK_DAYS: Array<StudyTask["day"]> = [
  "السبت",
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

export function getStoredTasks(): StudyTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLANNER_STORAGE_KEY);
    if (!raw) {
      // Default starter templates
      const starter: StudyTask[] = [
        {
          id: "task_1",
          title: "مراجعة المحاضرة الأولى وتدوين الملاحظات",
          day: "السبت",
          time: "06:00 م",
          priority: "high",
          isCompleted: false,
          createdAt: Date.now(),
        },
        {
          id: "task_2",
          title: "حل تدريبات مذكرة الـ PDF",
          day: "الإثنين",
          time: "08:00 م",
          priority: "medium",
          isCompleted: false,
          createdAt: Date.now(),
        },
      ];
      localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(starter));
      return starter;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTask(task: Omit<StudyTask, "id" | "createdAt">): StudyTask {
  const tasks = getStoredTasks();
  const newTask: StudyTask = {
    ...task,
    id: "task_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    createdAt: Date.now(),
  };
  tasks.unshift(newTask);
  try {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
  return newTask;
}

export function toggleTaskStatus(taskId: string): StudyTask[] {
  const tasks = getStoredTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index > -1) {
    tasks[index].isCompleted = !tasks[index].isCompleted;
    try {
      localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }
  return tasks;
}

export function deleteTask(taskId: string): StudyTask[] {
  const tasks = getStoredTasks().filter((t) => t.id !== taskId);
  try {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
  return tasks;
}
