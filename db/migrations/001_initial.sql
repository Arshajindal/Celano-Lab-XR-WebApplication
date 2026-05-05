-- 001_initial.sql
-- Core schema for Celano Lab XR web application

BEGIN;

-- Labs
CREATE TABLE IF NOT EXISTS labs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  location      TEXT,
  website       TEXT,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Users (for future auth — supports password + Google OAuth)
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  password_hash TEXT,                -- null for OAuth-only accounts
  google_id     TEXT UNIQUE,         -- null for password-only accounts
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'viewer'
                  CHECK (role IN ('admin', 'member', 'viewer')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Tools (one row per lab instrument)
CREATE TABLE IF NOT EXISTS tools (
  tool_id             TEXT PRIMARY KEY,
  lab_id              UUID REFERENCES labs(id),
  name                TEXT NOT NULL,
  vendor              TEXT,
  model               TEXT,
  category            TEXT,
  lab_location        TEXT,
  short_description   TEXT,
  detailed_description TEXT,
  cache_version       INTEGER DEFAULT 1,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Specs (ordered list of spec strings per tool)
CREATE TABLE IF NOT EXISTS tool_specs (
  id          SERIAL PRIMARY KEY,
  tool_id     TEXT REFERENCES tools(tool_id) ON DELETE CASCADE,
  spec        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

-- Tags
CREATE TABLE IF NOT EXISTS tool_tags (
  id      SERIAL PRIMARY KEY,
  tool_id TEXT REFERENCES tools(tool_id) ON DELETE CASCADE,
  tag     TEXT NOT NULL
);

-- Research areas
CREATE TABLE IF NOT EXISTS tool_research_areas (
  id      SERIAL PRIMARY KEY,
  tool_id TEXT REFERENCES tools(tool_id) ON DELETE CASCADE,
  area    TEXT NOT NULL
);

-- Safety notes
CREATE TABLE IF NOT EXISTS tool_safety_notes (
  id          SERIAL PRIMARY KEY,
  tool_id     TEXT REFERENCES tools(tool_id) ON DELETE CASCADE,
  note        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

-- Assets (images, PDFs, 3D models, videos)
CREATE TABLE IF NOT EXISTS assets (
  id          SERIAL PRIMARY KEY,
  tool_id     TEXT REFERENCES tools(tool_id) ON DELETE CASCADE,
  asset_type  TEXT NOT NULL CHECK (asset_type IN ('image', 'pdf', 'model', 'video')),
  title       TEXT,
  file_path   TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

-- XR headset pages (ordered set of pages per tool)
CREATE TABLE IF NOT EXISTS tool_pages (
  id          SERIAL PRIMARY KEY,
  tool_id     TEXT REFERENCES tools(tool_id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

-- Content blocks within each page
CREATE TABLE IF NOT EXISTS page_content_blocks (
  id            SERIAL PRIMARY KEY,
  page_id       INTEGER REFERENCES tool_pages(id) ON DELETE CASCADE,
  content_type  TEXT NOT NULL,
  sub_type      TEXT,
  info          TEXT,
  sort_order    INTEGER DEFAULT 0
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_vendor ON tools(vendor);
CREATE INDEX IF NOT EXISTS idx_tool_tags_tag ON tool_tags(tag);
CREATE INDEX IF NOT EXISTS idx_assets_tool_id ON assets(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_pages_tool_id ON tool_pages(tool_id);
CREATE INDEX IF NOT EXISTS idx_page_content_blocks_page_id ON page_content_blocks(page_id);

COMMIT;
