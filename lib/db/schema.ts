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

/** Medium-style bilingual blog posts */
export const createBlogPostsTable = `
  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
    category TEXT NOT NULL,
    source_lang TEXT NOT NULL CHECK(source_lang IN ('en', 'id')),
    title_source TEXT NOT NULL,
    excerpt_source TEXT NOT NULL DEFAULT '',
    body_md_source TEXT NOT NULL,
    title_en TEXT,
    title_id TEXT,
    excerpt_en TEXT,
    excerpt_id TEXT,
    body_md_en TEXT,
    body_md_id TEXT,
    cover_url TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

export const createBlogVotesTable = `
  CREATE TABLE IF NOT EXISTS blog_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    voter_id TEXT NOT NULL,
    value INTEGER NOT NULL CHECK(value IN (1, -1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, voter_id),
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
  )
`;

export const createBlogCommentsTable = `
  CREATE TABLE IF NOT EXISTS blog_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    parent_id INTEGER,
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'visible' CHECK(status IN ('visible', 'hidden')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
  )
`;
