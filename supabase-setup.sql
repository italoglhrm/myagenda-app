-- Run this in your Supabase project's SQL Editor
-- (safe to re-run — uses IF NOT EXISTS / IF NOT EXISTS guards)

-- ── Tasks ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID        REFERENCES auth.users NOT NULL,
  name                TEXT        NOT NULL,
  description         TEXT,
  solution            TEXT,
  description_images  TEXT[]      DEFAULT '{}',
  solution_images     TEXT[]      DEFAULT '{}',
  priority            TEXT        NOT NULL CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  category            TEXT        NOT NULL CHECK (category IN ('work', 'personal', 'health', 'study', 'other')),
  status              TEXT        NOT NULL CHECK (status IN ('todo', 'inprogress', 'done')),
  project_id          UUID        REFERENCES projects(id) ON DELETE SET NULL,
  due_date            DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Projects ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users NOT NULL,
  name        TEXT        NOT NULL,
  color       TEXT        NOT NULL DEFAULT '#534AB7',
  description TEXT,
  parent_id   UUID        REFERENCES projects(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Storage: task images ──────────────────────────────────────────────────────
-- In Supabase Dashboard → Storage → New bucket:
--   Name: task-images
--   Public: true
--
-- Then add this RLS policy in Storage → task-images → Policies:

-- INSERT (upload):
-- CREATE POLICY "auth users can upload task images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'task-images' AND auth.role() = 'authenticated');

-- SELECT (view):
-- CREATE POLICY "public can view task images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'task-images');

-- DELETE:
-- CREATE POLICY "users can delete own task images"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'task-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── Migrations (if you ran an older version of this file) ────────────────────
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS solution TEXT;
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description_images TEXT[] DEFAULT '{}';
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS solution_images TEXT[] DEFAULT '{}';
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES projects(id) ON DELETE CASCADE;
