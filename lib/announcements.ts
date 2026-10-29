import {
  AnnouncementMeta,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementAudience,
} from "@/types/database";

const META_PREFIX = "<!--ann_meta:";
const META_SUFFIX = "-->";

/**
 * Encodes announcement metadata cleanly inside the stored content.
 * This guarantees atomic preservation across database instances without requiring
 * external table joins or breaking database check constraints.
 */
export function encodeAnnouncementContent(
  content: string,
  meta: AnnouncementMeta
): string {
  const jsonStr = JSON.stringify(meta);
  return `${META_PREFIX}${jsonStr}${META_SUFFIX}\n${content.trim()}`;
}

/**
 * Parses announcement content, extracting metadata if present,
 * or gracefully generating defaults for legacy records.
 */
export function parseAnnouncementContent(
  rawContent: string,
  subjectId?: string | null
): {
  cleanContent: string;
  meta: AnnouncementMeta;
} {
  if (!rawContent) {
    return {
      cleanContent: "",
      meta: {
        type: subjectId ? "course" : "general",
        priority: "normal",
        author_name: "إدارة المنصة",
        target_audience: subjectId ? "subject" : "all",
        target_student_ids: [],
      },
    };
  }

  const match = rawContent.match(/^<!--ann_meta:(.*?)-->\s*([\s\S]*)$/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      return {
        cleanContent: match[2].trim(),
        meta: {
          type: (parsed.type as AnnouncementType) || (subjectId ? "course" : "general"),
          priority: (parsed.priority as AnnouncementPriority) || "normal",
          author_name: parsed.author_name || "إدارة المنصة",
          target_audience: (parsed.target_audience as AnnouncementAudience) || (subjectId ? "subject" : "all"),
          target_student_ids: Array.isArray(parsed.target_student_ids) ? parsed.target_student_ids : [],
        },
      };
    } catch {
      // If parsing failed, fallback below
    }
  }

  // Fallbacks for legacy announcements
  const isUrgent = rawContent.includes("عاجل") || rawContent.includes("هام جداً");
  const isImportant = isUrgent || rawContent.includes("هام") || rawContent.includes("تنبيه");
  const isExam = rawContent.includes("امتحان") || rawContent.includes("اختبار");

  return {
    cleanContent: rawContent.trim(),
    meta: {
      type: isExam ? "exam" : subjectId ? "course" : "general",
      priority: isUrgent ? "urgent" : isImportant ? "important" : "normal",
      author_name: "إدارة المنصة",
      target_audience: subjectId ? "subject" : "all",
      target_student_ids: [],
    },
  };
}
