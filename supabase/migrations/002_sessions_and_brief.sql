-- Migration 002: Add vf_sessions table and project brief column
-- Run in Supabase SQL Editor

-- Add brief column to vf_projects
ALTER TABLE vf_projects ADD COLUMN IF NOT EXISTS brief TEXT DEFAULT '';

-- Create vf_sessions table
CREATE TABLE IF NOT EXISTS vf_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     TEXT UNIQUE NOT NULL,
  project_id     UUID NOT NULL REFERENCES vf_projects(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES vf_users(id) ON DELETE CASCADE,
  prompt         TEXT NOT NULL,
  outputs        JSONB NOT NULL DEFAULT '[]',
  credits_used   INTEGER NOT NULL DEFAULT 0,
  cost_breakdown JSONB,
  status         TEXT NOT NULL DEFAULT 'complete',
  duration_ms    INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vf_sessions_project ON vf_sessions(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vf_sessions_user    ON vf_sessions(user_id, created_at DESC);
