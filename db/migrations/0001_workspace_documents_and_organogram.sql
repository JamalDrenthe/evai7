-- ─────────────────────────────────────────────────────────────────
-- Supabase migration: workspace_documents + organogram_nodes
-- Run this once in the Supabase SQL editor (or via drizzle-kit push).
-- ─────────────────────────────────────────────────────────────────

-- 1. Enums --------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE company AS ENUM (
    'VVC', 'Spontiva', 'Investbotiq', 'WoningVry',
    'Djobba', 'Boastplug', 'Sabibank', 'Zheavenzy'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE workspace_doc_section AS ENUM ('codes', 'informatie', 'content');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE workspace_doc_kind AS ENUM ('code', 'markdown', 'text');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Tables -------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_documents (
  id          varchar(64) PRIMARY KEY,
  company     company NOT NULL,
  section     workspace_doc_section NOT NULL,
  title       varchar(255) NOT NULL,
  kind        workspace_doc_kind NOT NULL DEFAULT 'text',
  language    varchar(32),
  content     text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_documents_company_section_idx
  ON workspace_documents (company, section);

CREATE TABLE IF NOT EXISTS organogram_nodes (
  id          varchar(64) PRIMARY KEY,
  name        varchar(255) NOT NULL,
  role        varchar(255) NOT NULL,
  level       integer NOT NULL DEFAULT 0,
  color       varchar(16) NOT NULL DEFAULT '#10b981',
  icon_key    varchar(32) NOT NULL DEFAULT 'user',
  parent_id   varchar(64) REFERENCES organogram_nodes(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS organogram_nodes_parent_idx
  ON organogram_nodes (parent_id);

-- 3. Auto-update `updated_at` on UPDATE ---------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workspace_documents_set_updated_at ON workspace_documents;
CREATE TRIGGER workspace_documents_set_updated_at
  BEFORE UPDATE ON workspace_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS organogram_nodes_set_updated_at ON organogram_nodes;
CREATE TRIGGER organogram_nodes_set_updated_at
  BEFORE UPDATE ON organogram_nodes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Row Level Security (anon read/write — tighten in production) -
ALTER TABLE workspace_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE organogram_nodes    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workspace_documents_all ON workspace_documents;
CREATE POLICY workspace_documents_all ON workspace_documents
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS organogram_nodes_all ON organogram_nodes;
CREATE POLICY organogram_nodes_all ON organogram_nodes
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
