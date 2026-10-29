-- Migration: Notifications System
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means broadcast to all or course
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE, -- NULL if general
    type VARCHAR(50) NOT NULL DEFAULT 'announcement',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table to track per-user read states for broadcast or individual notifications
CREATE TABLE IF NOT EXISTS public.notification_reads (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, notification_id)
);

-- Table for user notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    new_lectures BOOLEAN NOT NULL DEFAULT TRUE,
    new_resources BOOLEAN NOT NULL DEFAULT TRUE,
    announcements BOOLEAN NOT NULL DEFAULT TRUE,
    quiz_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    study_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    progress_milestones BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_subject_id ON public.notifications(subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON public.notification_reads(user_id);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Students can read broadcast notifications or notifications targeted to them
CREATE POLICY "Users can view accessible notifications"
    ON public.notifications
    FOR SELECT
    USING (
        user_id IS NULL OR user_id = auth.uid()
    );

-- Admins can insert and manage all notifications
CREATE POLICY "Admins can manage notifications"
    ON public.notifications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Users can view and manage their own read states
CREATE POLICY "Users can manage their notification reads"
    ON public.notification_reads
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can view and update their notification preferences
CREATE POLICY "Users can manage their notification preferences"
    ON public.notification_preferences
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
