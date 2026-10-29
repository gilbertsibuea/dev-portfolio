import { turso } from './turso';

// Project type definition for TypeScript
interface Project {
  id?: number;
  title: string;
  year: number;
  description: string;
  details?: string;
  category?: string;
  languages: string[];
  image: { src: string };
  gifUrl?: string; // Optional GIF for portfolio display (prioritized over image)
  githubLink?: string;
  liveLink?: string;
  selected?: number;
  selectedOrder?: number;
  created_at?: string;
  updated_at?: string;
}

// Define a type for the database row
interface ProjectRow {
  id: number;
  title: string;
  year: number;
  description: string;
  details: string | null;
  category: string | null;
  languages: string;
  image_url: string | null;
  gif_url: string | null;
  github_link: string | null;
  live_link: string | null;
  selected: number;
  selected_order: number;
  created_at: string;
  updated_at: string;
}

// Convert database row to Project
function rowToProject(row: ProjectRow): Project {
  // Make sure image paths are properly formatted
  let imageSrc = row.image_url || '/proj1.png';

  // If image path is relative and from uploads directory, ensure it has leading slash
  if (imageSrc && !imageSrc.startsWith('/') && !imageSrc.startsWith('http')) {
    imageSrc = '/' + imageSrc;
  }

  // Parse JSON if it's stored as JSON string in DB
  if (typeof imageSrc === 'string' && (imageSrc.startsWith('{') || imageSrc.includes('"src":'))) {
    try {
      const parsed = JSON.parse(imageSrc);
      if (parsed && typeof parsed === 'object' && parsed.src) {
        imageSrc = parsed.src;
      }
    } catch (e) {
      console.error(`Failed to parse image JSON for project ${row.id}:`, e);
    }
  }

  // console.log(`rowToProject ID ${row.id}: Final imageSrc = "${imageSrc}"`);

  return {
    id: row.id,
    title: row.title,
    year: row.year,
    description: row.description,
    details: row.details || '',
    category: row.category || '',
    languages: JSON.parse(row.languages),
    image: { src: imageSrc },
    gifUrl: row.gif_url || '',
    githubLink: row.github_link || '',
    liveLink: row.live_link || '',
    selected: row.selected,
    selectedOrder: row.selected_order,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Get all projects
export async function getAllProjects(): Promise<Project[]> {
  try {
    const result = await turso.execute('SELECT * FROM projects ORDER BY year DESC');
    return result.rows.map((row) => rowToProject(row as unknown as ProjectRow));
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
}

// Get a single project by ID
export async function getProjectById(id: number): Promise<Project | null> {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM projects WHERE id = ?',
      args: [id]
    });
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return rowToProject(result.rows[0] as unknown as ProjectRow);
  } catch (error) {
    console.error(`Error getting project id ${id}:`, error);
    return null;
  }
}

// Create a new project
export async function createProject(project: Omit<Project, 'id'>): Promise<Project | null> {
  try {
    const result = await turso.execute({
      sql: `
        INSERT INTO projects (
          title, year, description, details, category, languages, 
          image_url, gif_url, github_link, live_link
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        project.title,
        project.year,
        project.description,
        project.details || '',
        project.category || '',
        JSON.stringify(project.languages),
        project.image.src,
        project.gifUrl || '',
        project.githubLink || '',
        project.liveLink || ''
      ]
    });
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return rowToProject(result.rows[0] as unknown as ProjectRow);
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

// Update an existing project
export async function updateProject(id: number, project: Partial<Project>): Promise<Project | null> {
  try {
    // First get the current project to merge with updates
    const currentProject = await getProjectById(id);
    
    if (!currentProject) {
      return null;
    }
    
    // Prepare updated fields
    const updatedProject = {
      ...currentProject,
      ...project,
      languages: project.languages || currentProject.languages,
      image: project.image || currentProject.image,
      gifUrl: project.gifUrl !== undefined ? project.gifUrl : currentProject.gifUrl,
    };
    
    const result = await turso.execute({
      sql: `
        UPDATE projects SET
          title = ?, 
          year = ?, 
          description = ?, 
          details = ?, 
          category = ?,
          languages = ?, 
          image_url = ?,
          gif_url = ?,
          github_link = ?, 
          live_link = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *
      `,
      args: [
        updatedProject.title,
        updatedProject.year,
        updatedProject.description,
        updatedProject.details || '',
        updatedProject.category || '',
        JSON.stringify(updatedProject.languages),
        updatedProject.image.src,
        updatedProject.gifUrl || '',
        updatedProject.githubLink || '',
        updatedProject.liveLink || '',
        id
      ]
    });
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return rowToProject(result.rows[0] as unknown as ProjectRow);
  } catch (error) {
    console.error(`Error updating project id ${id}:`, error);
    return null;
  }
}

// Delete a project
export async function deleteProject(id: number): Promise<boolean> {
  try {
    await turso.execute({
      sql: 'DELETE FROM projects WHERE id = ?',
      args: [id]
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting project id ${id}:`, error);
    return false;
  }
}

// Get selected projects for portfolio display
export async function getSelectedProjects(): Promise<Project[]> {
  try {
    const result = await turso.execute(`
      SELECT * FROM projects 
      WHERE selected = 1 
      ORDER BY selected_order ASC
    `);
    return result.rows.map((row) => rowToProject(row as unknown as ProjectRow));
  } catch (error) {
    console.error('Error getting selected projects:', error);
    return [];
  }
}

// Update project selection status
export async function updateProjectSelection(id: number, selected: boolean, order: number): Promise<boolean> {
  try {
    await turso.execute({
      sql: `
        UPDATE projects SET
          selected = ?,
          selected_order = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [selected ? 1 : 0, order, id]
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating project selection for id ${id}:`, error);
    return false;
  }
}

// Update multiple projects' selection status at once
export async function updateSelectedProjects(selectedProjects: {id: number, order: number}[]): Promise<boolean> {
  try {
    // First, reset all projects to not selected
    await turso.execute(`
      UPDATE projects SET
        selected = 0,
        selected_order = 0
    `);
    
    // Then set the selected projects
    for (const project of selectedProjects) {
      await turso.execute({
        sql: `
          UPDATE projects SET
            selected = 1,
            selected_order = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        args: [project.order, project.id]
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating selected projects:', error);
    return false;
  }
}