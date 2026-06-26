-- Run this in your Supabase project's SQL Editor
-- (safe to re-run — uses IF NOT EXISTS / IF NOT EXISTS guards)

-- ── Tasks ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users NOT NULL,
  name        TEXT        NOT NULL,
  priority    TEXT        NOT NULL CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  category    TEXT        NOT NULL CHECK (category IN ('work', 'personal', 'health', 'study', 'other')),
  status      TEXT        NOT NULL CHECK (status IN ('todo', 'inprogress', 'done')),
  project_id  UUID        REFERENCES projects(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
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
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── If you already ran the first version, add project_id to existing tasks ───
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
