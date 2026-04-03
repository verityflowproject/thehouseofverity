-- VerityFlow — Supabase PostgreSQL Schema
-- Run this entire file in the Supabase SQL Editor (or via CLI: supabase db push)
-- after creating your Supabase project.

-- ─── Helper: auto-update updated_at ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Tables ───────────────────────────────────────────────────────────────────

-- vf_users: application-level user profile linked to auth.users
CREATE TABLE IF NOT EXISTS vf_users (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id            UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   TEXT NOT NULL UNIQUE,
  name                    TEXT,
  image                   TEXT,
  plan                    TEXT NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free','starter','pro','studio')),
  credits                 INTEGER NOT NULL DEFAULT 0,
  daily_credits_used      INTEGER NOT NULL DEFAULT 0,
  daily_credits_reset_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  model_calls_used        INTEGER NOT NULL DEFAULT 0,
  model_calls_limit       INTEGER NOT NULL DEFAULT 50,
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT,
  billing_cycle_start     TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
  billing_cycle_end       TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', now()) + INTERVAL '1 month'),
  email_verified          BOOLEAN DEFAULT false,
  provider                TEXT,
  provider_account_id     TEXT,
  project_ids             TEXT[] DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- vf_projects
CREATE TABLE IF NOT EXISTS vf_projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES vf_users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL DEFAULT '',
  description       TEXT,
  tech_stack        TEXT[] DEFAULT '{}',
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','building','review','complete','error','active')),
  active_session_id TEXT,
  total_sessions    INTEGER NOT NULL DEFAULT 0,
  last_built_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- vf_project_states: 1:1 with vf_projects; JSONB for flexible nested data
CREATE TABLE IF NOT EXISTS vf_project_states (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID UNIQUE NOT NULL REFERENCES vf_projects(id) ON DELETE CASCADE,
  version        INTEGER NOT NULL DEFAULT 1,
  architecture   JSONB NOT NULL DEFAULT '{}',
  conventions    JSONB NOT NULL DEFAULT '{}',
  dependencies   JSONB NOT NULL DEFAULT '{}',
  open_questions JSONB NOT NULL DEFAULT '[]',
  review_log     JSONB NOT NULL DEFAULT '[]',
  active_task    JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- vf_review_logs
CREATE TABLE IF NOT EXISTS vf_review_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            UUID NOT NULL REFERENCES vf_projects(id) ON DELETE CASCADE,
  session_id            TEXT NOT NULL,
  reviewing_model       TEXT NOT NULL,
  author_model          TEXT NOT NULL,
  task_type             TEXT NOT NULL,
  input_summary         TEXT NOT NULL DEFAULT '',
  output_summary        TEXT NOT NULL DEFAULT '',
  flagged_issues        JSONB NOT NULL DEFAULT '[]',
  outcome               TEXT NOT NULL
                          CHECK (outcome IN ('approved','rejected','patched','escalated')),
  patch_applied         TEXT,
  arbitration_required  BOOLEAN NOT NULL DEFAULT false,
  arbitration_rationale TEXT,
  tokens_used           JSONB NOT NULL DEFAULT '{}',
  duration_ms           INTEGER NOT NULL DEFAULT 0,
  confidence            NUMERIC(3,2) NOT NULL DEFAULT 0.80,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- vf_usage_logs
CREATE TABLE IF NOT EXISTS vf_usage_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES vf_users(id) ON DELETE CASCADE,
  project_id          UUID NOT NULL,
  session_id          TEXT NOT NULL,
  ai_model            TEXT NOT NULL,
  task_type           TEXT NOT NULL,
  prompt_tokens       INTEGER NOT NULL DEFAULT 0,
  completion_tokens   INTEGER NOT NULL DEFAULT 0,
  total_tokens        INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd  NUMERIC(12,8) NOT NULL DEFAULT 0,
  success             BOOLEAN NOT NULL DEFAULT true,
  duration_ms         INTEGER NOT NULL DEFAULT 0,
  adapter_status_code INTEGER,
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- vf_credit_transactions
CREATE TABLE IF NOT EXISTS vf_credit_transactions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES vf_users(id) ON DELETE CASCADE,
  type                     TEXT NOT NULL
                             CHECK (type IN (
                               'signup_grant','subscription_grant','topup_purchase',
                               'session_deduction','refund','admin_adjustment'
                             )),
  amount                   INTEGER NOT NULL,
  balance_after            INTEGER NOT NULL,
  description              TEXT NOT NULL DEFAULT '',
  session_id               TEXT,
  project_id               TEXT,
  model_used               TEXT,
  input_tokens             INTEGER,
  output_tokens            INTEGER,
  real_cost_usd            NUMERIC(12,8),
  stripe_payment_intent_id TEXT,
  credit_pack_id           TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_vf_users_email         ON vf_users(email);
CREATE INDEX IF NOT EXISTS idx_vf_users_stripe        ON vf_users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_vf_users_auth          ON vf_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_vf_projects_user       ON vf_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_vf_projects_status     ON vf_projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_vf_credit_tx_user_date ON vf_credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vf_credit_tx_session   ON vf_credit_transactions(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vf_review_logs_project ON vf_review_logs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vf_review_logs_session ON vf_review_logs(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vf_usage_logs_user_date ON vf_usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vf_usage_logs_project  ON vf_usage_logs(project_id);

-- ─── updated_at triggers ──────────────────────────────────────────────────────

CREATE TRIGGER trg_vf_users_updated_at
  BEFORE UPDATE ON vf_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_vf_projects_updated_at
  BEFORE UPDATE ON vf_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_vf_project_states_updated_at
  BEFORE UPDATE ON vf_project_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_vf_review_logs_updated_at
  BEFORE UPDATE ON vf_review_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_vf_usage_logs_updated_at
  BEFORE UPDATE ON vf_usage_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_vf_credit_transactions_updated_at
  BEFORE UPDATE ON vf_credit_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Service role key (used server-side) bypasses RLS automatically.
-- Anon/user keys respect these policies.

ALTER TABLE vf_users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE vf_projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vf_project_states     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vf_review_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vf_usage_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vf_credit_transactions ENABLE ROW LEVEL SECURITY;

-- vf_users: users can only read/update their own row
CREATE POLICY "users_select_own" ON vf_users
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "users_update_own" ON vf_users
  FOR UPDATE USING (auth_user_id = auth.uid());

-- vf_projects: users manage their own projects
CREATE POLICY "projects_select_own" ON vf_projects
  FOR SELECT USING (
    user_id IN (SELECT id FROM vf_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "projects_insert_own" ON vf_projects
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM vf_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "projects_update_own" ON vf_projects
  FOR UPDATE USING (
    user_id IN (SELECT id FROM vf_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "projects_delete_own" ON vf_projects
  FOR DELETE USING (
    user_id IN (SELECT id FROM vf_users WHERE auth_user_id = auth.uid())
  );

-- vf_project_states: accessible via project ownership
CREATE POLICY "project_states_select_own" ON vf_project_states
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM vf_projects
      WHERE user_id IN (SELECT id FROM vf_users WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "project_states_insert_own" ON vf_project_states
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM vf_projects
      WHERE user_id IN (SELECT id FROM vf_users WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "project_states_update_own" ON vf_project_states
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM vf_projects
      WHERE user_id IN (SELECT id FROM vf_users WHERE auth_user_id = auth.uid())
    )
  );

-- vf_review_logs: read-only for project owners
CREATE POLICY "review_logs_select_own" ON vf_review_logs
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM vf_projects
      WHERE user_id IN (SELECT id FROM vf_users WHERE auth_user_id = auth.uid())
    )
  );

-- vf_usage_logs: users see their own logs
CREATE POLICY "usage_logs_select_own" ON vf_usage_logs
  FOR SELECT USING (
    user_id IN (SELECT id FROM vf_users WHERE auth_user_id = auth.uid())
  );

-- vf_credit_transactions: users see their own transactions
CREATE POLICY "credit_tx_select_own" ON vf_credit_transactions
  FOR SELECT USING (
    user_id IN (SELECT id FROM vf_users WHERE auth_user_id = auth.uid())
  );

-- ─── Auto-provision vf_users on new auth.users signup ────────────────────────

CREATE OR REPLACE FUNCTION provision_vf_user()
RETURNS TRIGGER AS $$
DECLARE
  _plan_limit INTEGER := 50; -- free plan default
  _signup_credits INTEGER := 100; -- adjust to match SIGNUP_FREE_CREDITS in credit-costs.ts
  _new_user_id UUID := gen_random_uuid();
  _now TIMESTAMPTZ := now();
BEGIN
  INSERT INTO vf_users (
    id, auth_user_id, email, name, image,
    plan, credits, daily_credits_used, daily_credits_reset_at,
    model_calls_used, model_calls_limit,
    billing_cycle_start, billing_cycle_end,
    email_verified, provider,
    project_ids, created_at, updated_at
  ) VALUES (
    _new_user_id,
    NEW.id,
    LOWER(NEW.email),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    _signup_credits,
    0,
    _now,
    0,
    _plan_limit,
    date_trunc('month', _now),
    date_trunc('month', _now) + INTERVAL '1 month',
    NEW.email_confirmed_at IS NOT NULL,
    NEW.raw_user_meta_data->>'provider',
    '{}',
    _now,
    _now
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  -- Record signup credit grant
  INSERT INTO vf_credit_transactions (
    user_id, type, amount, balance_after, description, created_at, updated_at
  )
  SELECT
    _new_user_id,
    'signup_grant',
    _signup_credits,
    _signup_credits,
    'Welcome bonus — ' || _signup_credits || ' free credits to get started',
    _now,
    _now
  WHERE NOT EXISTS (
    SELECT 1 FROM vf_credit_transactions
    WHERE user_id = _new_user_id AND type = 'signup_grant'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_provision_vf_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION provision_vf_user();

-- ─── RPC: atomic credit increment ────────────────────────────────────────────
-- Replaces Firestore FieldValue.increment for credits/modelCallsUsed/dailyCreditsUsed

CREATE OR REPLACE FUNCTION increment_user_credits(
  p_user_id   UUID,
  p_field     TEXT,   -- 'credits' | 'model_calls_used' | 'daily_credits_used'
  p_delta     INTEGER
)
RETURNS void AS $$
BEGIN
  IF p_field = 'credits' THEN
    UPDATE vf_users SET credits = credits + p_delta WHERE id = p_user_id;
  ELSIF p_field = 'model_calls_used' THEN
    UPDATE vf_users SET model_calls_used = model_calls_used + p_delta WHERE id = p_user_id;
  ELSIF p_field = 'daily_credits_used' THEN
    UPDATE vf_users SET daily_credits_used = daily_credits_used + p_delta WHERE id = p_user_id;
  ELSE
    RAISE EXCEPTION 'Unknown field: %', p_field;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── RPC: atomic deduct credits with floor check ─────────────────────────────
-- Replaces User.findOneAndUpdate with credits.$gte guard.
-- Returns the updated user row or NULL if balance was insufficient.

CREATE OR REPLACE FUNCTION deduct_user_credits(
  p_user_id         UUID,
  p_credits_delta   INTEGER,   -- negative number (deduction)
  p_min_balance     INTEGER    -- minimum balance required before deduction
)
RETURNS SETOF vf_users AS $$
DECLARE
  _user vf_users;
BEGIN
  SELECT * INTO _user FROM vf_users WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF _user.credits < p_min_balance THEN
    RETURN;
  END IF;

  UPDATE vf_users
  SET
    credits          = credits + p_credits_delta,
    model_calls_used = model_calls_used + 1,
    daily_credits_used = daily_credits_used + ABS(p_credits_delta)
  WHERE id = p_user_id
  RETURNING * INTO _user;

  RETURN NEXT _user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── RPC: atomic upsert project state with version bump ──────────────────────
-- Replaces ProjectState.findOneAndUpdate with $inc.version and JSONB array ops.

CREATE OR REPLACE FUNCTION upsert_project_state(
  p_project_id     UUID,
  p_set_data       JSONB    DEFAULT '{}',
  p_push_review    JSONB    DEFAULT NULL,
  p_push_question  JSONB    DEFAULT NULL,
  p_pull_question_id TEXT   DEFAULT NULL,
  p_inc_version    INTEGER  DEFAULT 0
)
RETURNS SETOF vf_project_states AS $$
DECLARE
  _state vf_project_states;
BEGIN
  -- Upsert the base row
  INSERT INTO vf_project_states (project_id)
  VALUES (p_project_id)
  ON CONFLICT (project_id) DO NOTHING;

  -- Lock the row
  SELECT * INTO _state FROM vf_project_states
  WHERE project_id = p_project_id FOR UPDATE;

  -- Apply $set fields from JSONB
  UPDATE vf_project_states
  SET
    version        = version + p_inc_version,
    architecture   = CASE WHEN p_set_data ? 'architecture'   THEN p_set_data->'architecture'   ELSE architecture   END,
    conventions    = CASE WHEN p_set_data ? 'conventions'    THEN p_set_data->'conventions'    ELSE conventions    END,
    dependencies   = CASE WHEN p_set_data ? 'dependencies'   THEN p_set_data->'dependencies'   ELSE dependencies   END,
    active_task    = CASE WHEN p_set_data ? 'active_task'    THEN p_set_data->'active_task'    ELSE active_task    END,
    open_questions = CASE
                       WHEN p_pull_question_id IS NOT NULL THEN (
                         SELECT jsonb_agg(elem)
                         FROM jsonb_array_elements(open_questions) elem
                         WHERE elem->>'id' != p_pull_question_id
                       )
                       WHEN p_push_question IS NOT NULL THEN open_questions || jsonb_build_array(p_push_question)
                       ELSE open_questions
                     END,
    review_log     = CASE
                       WHEN p_push_review IS NOT NULL THEN review_log || jsonb_build_array(p_push_review)
                       ELSE review_log
                     END,
    updated_at     = now()
  WHERE project_id = p_project_id
  RETURNING * INTO _state;

  RETURN NEXT _state;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
