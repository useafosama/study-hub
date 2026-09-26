-- =====================================================================
-- STUDY HUB — COMPLETE INITIAL SEED & USERS SETUP
-- File: supabase/seed.sql
-- =====================================================================

-- 1. Initial Platform Settings
INSERT INTO public.platform_settings (key, value)
VALUES 
    ('general', '{"platform_name": "منصة ستادي هب", "platform_name_en": "Study Hub", "description": "منصة تعليمية خاصة للدراسة والمحتوى الأكاديمي", "maintenance_mode": false}'::jsonb),
    ('branding', '{"logo_url": null, "theme_default": "system", "accent_color": "indigo"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- 2. Helper function to safely insert Supabase Auth users with passwords
CREATE OR REPLACE FUNCTION public.create_demo_user(
    p_id UUID,
    p_username TEXT,
    p_full_name TEXT,
    p_password TEXT,
    p_role TEXT
) RETURNS VOID AS $$
DECLARE
    v_email TEXT;
    v_encrypted_pw TEXT;
BEGIN
    v_email := p_username || '@studyhub.internal';
    -- Blowfish crypt hash for password
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- Insert into auth.users if not exists
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        p_id,
        'authenticated',
        'authenticated',
        v_email,
        v_encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', p_full_name, 'username', p_username, 'role', p_role),
        NOW(),
        NOW(),
        ''
    )
    ON CONFLICT (id) DO UPDATE
    SET encrypted_password = v_encrypted_pw,
        updated_at = NOW();

    -- Insert or update public.profiles
    INSERT INTO public.profiles (
        id,
        full_name,
        username,
        role,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        p_id,
        p_full_name,
        p_username,
        p_role,
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        is_active = TRUE;
END;
$$ LANGUAGE plpgsql;


-- 3. Create Default Accounts:
-- ==========================================================
-- Admin Account:
--   Username: admin
--   Password: password123
-- ==========================================================
SELECT public.create_demo_user(
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'admin',
    'يوسف أسامة (المشرف)',
    'password123',
    'admin'
);

-- ==========================================================
-- Student 1:
--   Username: khaled
--   Password: password123
-- ==========================================================
SELECT public.create_demo_user(
    'b0000000-0000-0000-0000-000000000001'::UUID,
    'khaled',
    'خالد علي',
    'password123',
    'student'
);

-- ==========================================================
-- Student 2:
--   Username: salama
--   Password: password123
-- ==========================================================
SELECT public.create_demo_user(
    'b0000000-0000-0000-0000-000000000002'::UUID,
    'salama',
    'سلامة محمود',
    'password123',
    'student'
);


-- 4. Demo Subjects
INSERT INTO public.subjects (id, name, code, description, is_published, sort_order)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'تكنولوجيا النانو (Nano Technology)', 'NANO101', 'مقدمة في علوم وتطبيقات النانومتر والمواد النانوية المتقدمة', TRUE, 0),
    ('c0000000-0000-0000-0000-000000000002', 'وقاية النبات (Plant Protection)', 'PLANT201', 'دراسة الأمراض والآفات الزراعية وطرق المكافحة المتكاملة', TRUE, 1),
    ('c0000000-0000-0000-0000-000000000003', 'الكيمياء العضوية (Organic Chemistry)', 'CHEM301', 'أسس وتفاعلات المركبات العضوية وتطبيقاتها المعملية', TRUE, 2)
ON CONFLICT (id) DO NOTHING;


-- 5. Demo Content (Lectures & Sections)
INSERT INTO public.contents (id, subject_id, type, title, description, sort_order, is_published)
VALUES 
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'lecture', 'المحاضرة 01 — مقدمة في علوم النانو', 'نظرة عامة على المقياس النانوي وأهميته في العلوم الحديثة', 0, TRUE),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'lecture', 'المحاضرة 02 — المواد النانوية وخصائصها', 'دراسة الخصائص الفيزيائية والكيميائية الفريدة للمواد النانوية', 1, TRUE),
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'section', 'السكشن 01 — تحضير الجسيمات النانوية عملياً', 'تجارب معملية لتحضير جسيمات الذهب والفضة النانوية', 0, TRUE),
    ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'lecture', 'المحاضرة 01 — أساسيات وقاية النبات', 'التعرف على الآفات الحشرية والأمراض الفطرية الشائعة', 0, TRUE)
ON CONFLICT (id) DO NOTHING;


-- 6. Demo Resources (YouTube & PDF links)
INSERT INTO public.resources (id, content_id, type, title, url, sort_order, is_published)
VALUES 
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'video', 'فيديو شرح المحاضرة الأولى', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0, TRUE),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'pdf', 'ملف المحاضرة (PDF)', 'https://drive.google.com/file/d/sample-nano-lecture-1', 1, TRUE),
    ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'pdf', 'دليل التجارب المعملية (PDF)', 'https://drive.google.com/file/d/sample-nano-lab-1', 0, TRUE)
ON CONFLICT (id) DO NOTHING;


-- 7. Assign Subjects to Students (Access Control)
-- Khaled has access to: Nano Technology + Plant Protection
INSERT INTO public.user_subjects (user_id, subject_id)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002')
ON CONFLICT (user_id, subject_id) DO NOTHING;


-- 8. Demo Announcement
INSERT INTO public.announcements (title, content, target_type, subject_id, is_published)
VALUES 
    ('مرحباً بكم في منصة ستادي هب 🎓', 'تم تفعيل حساباتكم وإضافة المواد المقررة للفصل الدراسي. نتمنى لكم فصلاً دراسياً موفقاً!', 'all', NULL, TRUE),
    ('تنبيه معمل النانو القادم 🧪', 'يرجى مراجعة ملف التجارب المعملية قبل حضور السكشن القادم.', 'subject', 'c0000000-0000-0000-0000-000000000001', TRUE)
ON CONFLICT DO NOTHING;
