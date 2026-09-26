export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "streak" | "completion" | "engagement";
  isUnlocked: boolean;
  progress: number; // 0 to 100
  unlockedAt?: number;
}

export interface StudentGamificationState {
  streakDays: number;
  lastActiveDate: string;
  badges: BadgeItem[];
}

const GAMIFICATION_STORAGE_KEY = "studyhub_gamification_state";

export function getGamificationState(stats: {
  totalContents: number;
  completedContents: number;
  notesCount: number;
  subjectsCount: number;
  completedSubjectsCount: number;
}): StudentGamificationState {
  if (typeof window === "undefined") {
    return {
      streakDays: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      badges: [],
    };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  let streakDays = 1;
  let lastActiveDate = todayStr;

  try {
    const raw = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.lastActiveDate) {
        const lastDate = new Date(parsed.lastActiveDate);
        const today = new Date(todayStr);
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 0) {
          streakDays = parsed.streakDays || 1;
        } else if (diffDays === 1) {
          streakDays = (parsed.streakDays || 1) + 1;
        } else {
          streakDays = 1; // Streak reset
        }
      }
    }
    // Save updated streak
    localStorage.setItem(
      GAMIFICATION_STORAGE_KEY,
      JSON.stringify({ streakDays, lastActiveDate: todayStr })
    );
  } catch {}

  const { totalContents, completedContents, notesCount, completedSubjectsCount } = stats;

  const badges: BadgeItem[] = [
    {
      id: "first_step",
      title: "الانطلاقة الأولى",
      description: "أكملت أول محاضرة في منصة الچوو بنجاح",
      icon: "🚀",
      category: "completion",
      isUnlocked: completedContents >= 1,
      progress: Math.min(100, Math.round((completedContents / 1) * 100)),
    },
    {
      id: "streak_3",
      title: "شعلة الالتزام",
      description: "حافظت على المذاكرة لمدة 3 أيام متتالية",
      icon: "🔥",
      category: "streak",
      isUnlocked: streakDays >= 3,
      progress: Math.min(100, Math.round((streakDays / 3) * 100)),
    },
    {
      id: "streak_7",
      title: "المثابرة الذهبية",
      description: "التزام أسطوري لمدة 7 أيام متواصلة",
      icon: "⚡",
      category: "streak",
      isUnlocked: streakDays >= 7,
      progress: Math.min(100, Math.round((streakDays / 7) * 100)),
    },
    {
      id: "note_taker",
      title: "دوّان الملاحظات",
      description: "قمت بكتابة أول ملخص أو ملاحظة دراسية",
      icon: "📝",
      category: "engagement",
      isUnlocked: notesCount >= 1,
      progress: notesCount >= 1 ? 100 : 0,
    },
    {
      id: "subject_master",
      title: "سيد المقررات",
      description: "أنهيت مادة دراسية كاملة بنسبة 100%",
      icon: "📚",
      category: "completion",
      isUnlocked: completedSubjectsCount >= 1,
      progress: completedSubjectsCount >= 1 ? 100 : 0,
    },
    {
      id: "halfway_hero",
      title: "نصف الطريق",
      description: "أنجزت 50% من جميع المحاضرات المخصصة لك",
      icon: "🎯",
      category: "completion",
      isUnlocked: totalContents > 0 && completedContents >= Math.ceil(totalContents * 0.5),
      progress: totalContents > 0 ? Math.min(100, Math.round((completedContents / (totalContents * 0.5)) * 100)) : 0,
    },
    {
      id: "grand_master",
      title: "العلامة الكاملة",
      description: "أتممت جميع المحاضرات والملفات بنسبة 100%",
      icon: "👑",
      category: "completion",
      isUnlocked: totalContents > 0 && completedContents === totalContents,
      progress: totalContents > 0 ? Math.min(100, Math.round((completedContents / totalContents) * 100)) : 0,
    },
  ];

  return {
    streakDays,
    lastActiveDate: todayStr,
    badges,
  };
}
