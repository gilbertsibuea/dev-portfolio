import { turso } from './turso';
import { createProjectsTable, createAdminTable, createExperiencePanelsTable } from './schema';
import { seedExperiencePanels } from './experience';
import bcrypt from 'bcryptjs';

export async function initializeDatabase() {
  try {
    await turso.execute(createProjectsTable);
    await turso.execute(createAdminTable);
    await turso.execute(createExperiencePanelsTable);

    try {
      const columnCheckResult = await turso.execute(`PRAGMA table_info(projects)`);
      const columns = columnCheckResult.rows.map((row) => row.name as string);

      if (!columns.includes('selected')) {
        await turso.execute(`ALTER TABLE projects ADD COLUMN selected INTEGER DEFAULT 0`);
      }

      if (!columns.includes('selected_order')) {
        await turso.execute(`ALTER TABLE projects ADD COLUMN selected_order INTEGER DEFAULT 0`);
      }

      if (!columns.includes('gif_url')) {
        await turso.execute(`ALTER TABLE projects ADD COLUMN gif_url TEXT`);
      }
    } catch {
      // Silent fail for schema update
    }

    try {
      const adminColumnCheck = await turso.execute(`PRAGMA table_info(admins)`);
      const adminColumns = adminColumnCheck.rows.map((row) => row.name as string);

      if (!adminColumns.includes('email')) {
        await turso.execute(`ALTER TABLE admins ADD COLUMN email TEXT`);
      }
      if (!adminColumns.includes('reset_token')) {
        await turso.execute(`ALTER TABLE admins ADD COLUMN reset_token TEXT`);
      }
      if (!adminColumns.includes('reset_token_expires')) {
        await turso.execute(`ALTER TABLE admins ADD COLUMN reset_token_expires INTEGER`);
      }

      await turso.execute(`
        CREATE UNIQUE INDEX IF NOT EXISTS admins_email_unique
        ON admins(email)
        WHERE email IS NOT NULL AND email != ''
      `);
    } catch {
      // Silent fail for admin schema update
    }

    const adminResult = await turso.execute("SELECT COUNT(*) as count FROM admins");
    const adminCount = adminResult.rows[0].count;

    if (adminCount === 0) {
      const passwordHash = await bcrypt.hash('password123', 10);
      await turso.execute({
        sql: "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
        args: ['admin', passwordHash]
      });
    }

    // Seed Professional Journey panels once when empty
    await seedExperiencePanels(false);
  } catch {
    // Silent fail for initialization
  }
}

export async function fixProjectImages(): Promise<boolean> {
  try {
    const result = await turso.execute('SELECT id, image_url FROM projects');

    for (const row of result.rows) {
      const id = row.id;
      const imageUrl = row.image_url;
      let fixedImageUrl = imageUrl;

      if (!imageUrl) {
        fixedImageUrl = '/proj1.png';
      } else if (typeof imageUrl === 'string' && (imageUrl.includes('"src"') || imageUrl.startsWith('{'))) {
        try {
          const parsed = JSON.parse(imageUrl);
          if (parsed && typeof parsed === 'object' && parsed.src) {
            if (typeof parsed.src === 'object') {
              if (parsed.src.src && typeof parsed.src.src === 'string') {
                fixedImageUrl = parsed.src.src;
              } else {
                fixedImageUrl = '/proj1.png';
              }
            } else {
              fixedImageUrl = parsed.src;
            }
          }
        } catch {
          // Silent fail for JSON parse
        }
      } else if (typeof imageUrl === 'string' && imageUrl.includes('[object Object]')) {
        fixedImageUrl = '/proj1.png';
      }

      if (fixedImageUrl !== imageUrl) {
        await turso.execute({
          sql: 'UPDATE projects SET image_url = ? WHERE id = ?',
          args: [fixedImageUrl, id]
        });
      }
    }
    return true;
  } catch {
    return false;
  }
}
