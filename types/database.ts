export type UserRole = "admin" | "student";
export type ContentType = "lecture" | "section" | "summary" | "exam";
export type ResourceType = "video" | "pdf" | "link" | "summary" | "presentation" | "exam";
export type AnnouncementTargetType = "all" | "subject";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  image_url?: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Computed fields
  total_contents?: number;
  completed_contents?: number;
  progress_percentage?: number;
}

export interface Content {
  id: string;
  subject_id: string;
  type: ContentType;
  title: string;
  description?: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Associated resources
  resources?: Resource[];
  // Student specific flags
  is_completed?: boolean;
  is_bookmarked?: boolean;
}

export interface Resource {
  id: string;
  content_id: string;
  type: ResourceType;
  title: string;
  url: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubject {
  user_id: string;
  subject_id: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_type: AnnouncementTargetType;
  subject_id?: string | null;
  subject_name?: string | null;
  is_published: boolean;
  created_at: string;
  expires_at?: string | null;
}

export interface ActivityLog {
  id: string;
  user_id?: string | null;
  user_full_name?: string | null;
  user_username?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ContentProgress {
  user_id: string;
  content_id: string;
  completed: boolean;
  completed_at?: string | null;
  updated_at: string;
}

export interface Bookmark {
  user_id: string;
  content_id: string;
  created_at: string;
  content?: Content;
  subject?: Subject;
}

export interface PlatformSettings {
  platform_name: string;
  platform_name_en?: string;
  description?: string;
  maintenance_mode: boolean;
  logo_url?: string | null;
  theme_default?: "system" | "light" | "dark";
  accent_color?: string;
}
