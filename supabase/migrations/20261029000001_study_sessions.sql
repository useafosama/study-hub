-- Migration: Study Sessions tracking table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    content_id UUID REFERENCES public.contents(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    target_duration_seconds INTEGER NOT NULL DEFAULT 0,
    completion_status VARCHAR(50) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON public.study_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject_id ON public.study_sessions(subject_id);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Students can read their own sessions
CREATE POLICY "Students can view their own study sessions"
    ON public.study_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Students can insert their own study sessions
CREATE POLICY "Students can insert their own study sessions"
    ON public.study_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all study sessions
CREATE POLICY "Admins can view all study sessions"
    ON public.study_sessions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
