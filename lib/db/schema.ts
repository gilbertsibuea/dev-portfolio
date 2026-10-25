// Project table schema for Turso database

export const createProjectsTable = `
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    details TEXT,
    languages TEXT NOT NULL, -- Stored as JSON string
    image_url TEXT,
    gif_url TEXT,
    github_link TEXT,
    live_link TEXT,
    selected INTEGER DEFAULT 0, -- 0: not selected, 1: selected for portfolio
    selected_order INTEGER DEFAULT 0, -- For ordering the selected projects
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

export const createAdminTable = `
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    reset_token TEXT,
    reset_token_expires INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

/** Professional Journey carousel panels */
export const createExperiencePanelsTable = `
  CREATE TABLE IF NOT EXISTS experience_panels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL CHECK(kind IN ('feature', 'stack')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    jobs_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;