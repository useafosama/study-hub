-- STUDY HUB ROW LEVEL SECURITY POLICIES
-- Migration: 20260921000002_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if authenticated user is active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if authenticated user has access to a subject
CREATE OR REPLACE FUNCTION public.has_subject_access(check_subject_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin has access to all subjects
    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;

    -- Active student with explicit assignment has access if subject is published
    RETURN EXISTS (
        SELECT 1
        FROM public.user_subjects us
        JOIN public.profiles p ON p.id = us.user_id
        JOIN public.subjects s ON s.id = us.subject_id
        WHERE us.user_id = auth.uid()
          AND us.subject_id = check_subject_id
          AND p.is_active = TRUE
          AND s.is_published = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 1. PROFILES POLICIES
-- =====================================================================
-- Users can view their own profile; admins can view all profiles
CREATE POLICY "Profiles view policy"
ON public.profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid() OR public.is_admin()
);

-- Users can update their own profile (e.g. avatar, name), admins can update any profile
CREATE POLICY "Profiles update policy"
ON public.profiles FOR UPDATE
TO authenticated
USING (
    id = auth.uid() OR public.is_admin()
)
WITH CHECK (
    id = auth.uid() OR public.is_admin()
);

-- Only admins can insert profiles (or service role)
CREATE POLICY "Admins insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Only admins can delete profiles
CREATE POLICY "Admins delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.is_admin());

-- =====================================================================
-- 2. SUBJECTS POLICIES
-- =====================================================================
-- Students see only published subjects assigned to them; admins see all
CREATE POLICY "Subjects select policy"
ON public.subjects FOR SELECT
TO authenticated
USING (
    public.is_admin() OR (
        is_published = TRUE AND EXISTS (
            SELECT 1 FROM public.user_subjects us
            JOIN public.profiles p ON p.id = us.user_id
            WHERE us.user_id = auth.uid()
              AND us.subject_id = subjects.id
              AND p.is_active = TRUE
        )
    )
);

CREATE POLICY "Admins manage subjects"
ON public.subjects FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================================
-- 3. CONTENTS POLICIES
-- =====================================================================
-- Students see only published content of assigned subjects; admins see all
CREATE POLICY "Contents select policy"
ON public.contents FOR SELECT
TO authenticated
USING (
    public.is_admin() OR (
        is_published = TRUE AND public.has_subject_access(subject_id)
    )
);

CREATE POLICY "Admins manage contents"
ON public.contents FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================================
-- 4. RESOURCES POLICIES
-- =====================================================================
-- Students see only published resources for accessible content; admins see all
CREATE POLICY "Resources select policy"
ON public.resources FOR SELECT
TO authenticated
USING (
    public.is_admin() OR (
        is_published = TRUE AND EXISTS (
            SELECT 1 FROM public.contents c
            WHERE c.id = resources.content_id
              AND c.is_published = TRUE
              AND public.has_subject_access(c.subject_id)
        )
    )
);

CREATE POLICY "Admins manage resources"
ON public.resources FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================================
-- 5. USER SUBJECTS PERMISSIONS POLICIES
-- =====================================================================
-- Students can read their own assignments; admins have full access
CREATE POLICY "User subjects select policy"
ON public.user_subjects FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR public.is_admin()
);

CREATE POLICY "Admins manage user subjects"
ON public.user_subjects FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================================
-- 6. ANNOUNCEMENTS POLICIES
-- =====================================================================
-- Students see published announcements targeted to 'all' or their assigned subjects; admins see all
CREATE POLICY "Announcements select policy"
ON public.announcements FOR SELECT
TO authenticated
USING (
    public.is_admin() OR (
        is_published = TRUE AND (
            (expires_at IS NULL OR expires_at > NOW()) AND (
                target_type = 'all' OR
                (target_type = 'subject' AND public.has_subject_access(subject_id))
            )
        )
    )
);

CREATE POLICY "Admins manage announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================================
-- 7. ACTIVITY LOGS POLICIES
-- =====================================================================
-- Only admins can view activity logs; authenticated users can insert (for action tracking)
CREATE POLICY "Admins read activity logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Authenticated insert activity logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- =====================================================================
-- 8. CONTENT PROGRESS POLICIES
-- =====================================================================
-- Students manage their own progress for accessible content; admins can inspect
CREATE POLICY "Content progress select policy"
ON public.content_progress FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR public.is_admin()
);

CREATE POLICY "Content progress insert/update policy"
ON public.content_progress FOR ALL
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- =====================================================================
-- 9. BOOKMARKS POLICIES
-- =====================================================================
-- Students manage their own bookmarks; admins can inspect
CREATE POLICY "Bookmarks select policy"
ON public.bookmarks FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR public.is_admin()
);

CREATE POLICY "Bookmarks insert/delete policy"
ON public.bookmarks FOR ALL
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- =====================================================================
-- 10. PLATFORM SETTINGS POLICIES
-- =====================================================================
-- Anyone authenticated can view settings; only admins can modify
CREATE POLICY "Authenticated view settings"
ON public.platform_settings FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "Admins manage settings"
ON public.platform_settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
