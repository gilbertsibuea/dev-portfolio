'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Reorder, useDragControls } from 'framer-motion';
import { MdDragIndicator } from 'react-icons/md';

function getProjectCategory(project: Project): string {
  return project.category?.trim() || 'Other';
}

/** Group while preserving first-seen category order and relative item order */
function groupSelectedByCategory(projects: Project[]): {
  categories: string[];
  groups: Record<string, Project[]>;
} {
  const categories: string[] = [];
  const groups: Record<string, Project[]> = {};
  for (const project of projects) {
    const cat = getProjectCategory(project);
    if (!groups[cat]) {
      groups[cat] = [];
      categories.push(cat);
    }
    groups[cat].push(project);
  }
  return { categories, groups };
}

// Project type definition
interface Project {
  id: number;
  title: string;
  year: number;
  description: string;
  details?: string;
  category?: string;
  image: { src: string } | string;
  languages: string[];
  selected?: number;
  selectedOrder?: number;
}

// Helper function to ensure valid image paths (updated for Azure support)
const getValidImagePath = (image: { src: string } | string): string => {
  // console.log('Processing image in selected projects page:', image);
  
  // Default fallback
  const fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2plY3QgSW1hZ2U8L3RleHQ+PC9zdmc+';
  
  // Handle image object with src property
  if (typeof image === 'object' && image !== null && 'src' in image) {
    const src = image.src;
    // console.log('Image src from object:', src);
    
    if (!src || src.trim() === '') {
      return fallback;
    }
    
    // Check if it's an Azure blob URL
    if (src.includes('.blob.core.windows.net')) {
      // console.log('✅ Azure blob URL detected:', src);
      return src;
    }
    
    // Check if it's a local upload
    if (src.includes('uploads/')) {
      const result = src.startsWith('/') ? src : '/' + src;
      // console.log('Fixed upload path:', result);
      return result;
    }
    
    // If it's a full URL or already has a leading slash, return as is
    if (src.startsWith('http') || src.startsWith('/')) {
      return src;
    }
    
    // Otherwise, add a leading slash
    return '/' + src;
  }
  
  // Handle direct string path
  if (typeof image === 'string') {
    const src = image;
    // console.log('Image string path:', src);
    
    if (!src || src.trim() === '') {
      return fallback;
    }
    
    // Check if it's an Azure blob URL
    if (src.includes('.blob.core.windows.net')) {
      return src;
    }
    
    if (src.startsWith('http') || src.startsWith('/')) {
      return src;
    }
    
    return '/' + src;
  }
  
  // Fallback
  return fallback;
};

// Helper function to check if file is a video
const isVideoFile = (url: string): boolean => {
  return url.includes('.webm') || url.includes('.mp4') || url.includes('.mov');
};

function SortableSelectedRow({
  project,
  index,
  onRemove,
}: {
  project: Project;
  index: number;
  onRemove: () => void;
}) {
  const controls = useDragControls();
  const imagePath = getValidImagePath(project.image);

  return (
    <Reorder.Item
      value={project}
      dragListener={false}
      dragControls={controls}
      className="flex items-center justify-between gap-3 bg-gray-800 p-4 rounded-lg touch-none"
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        zIndex: 20,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label={`Drag to reorder ${project.title}`}
          onPointerDown={(e) => controls.start(e)}
          className="shrink-0 cursor-grab active:cursor-grabbing rounded-md p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white touch-none"
        >
          <MdDragIndicator className="text-xl" />
        </button>
        <span className="text-violet-500 font-bold w-6 shrink-0 tabular-nums">
          {index + 1}
        </span>
        <div className="w-12 h-12 overflow-hidden rounded-md shrink-0">
          {isVideoFile(imagePath) ? (
            <video
              src={imagePath}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <img
              src={imagePath}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                if (!e.currentTarget.src.includes('proj1.gif')) {
                  e.currentTarget.src = '/proj1.gif';
                }
              }}
            />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium truncate">{project.title}</h3>
          <p className="text-sm text-gray-400">{project.year}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-red-400 hover:text-red-300 transition-colors"
      >
        Remove
      </button>
    </Reorder.Item>
  );
}

export default function SelectedProjectsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  
  const router = useRouter();

  const { categories: selectedCategories, groups: selectedGroups } = useMemo(
    () => groupSelectedByCategory(selectedProjects),
    [selectedProjects]
  );

  const reorderWithinCategory = (category: string, nextInCategory: Project[]) => {
    setSelectedProjects((prev) => {
      const { categories, groups } = groupSelectedByCategory(prev);
      groups[category] = nextInCategory;
      return categories.flatMap((cat) => groups[cat] ?? []);
    });
  };

  // Check authentication and load projects
  useEffect(() => {
    // Check if user is authenticated
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin');
      return;
    }
    
    setIsAuthenticated(true);
    
    // Fetch all projects
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects', { cache: 'no-store' });
        const data = await res.json();
        
        if (data.success && Array.isArray(data.projects)) {
          setAllProjects(data.projects);
          
          // Filter out already selected projects
          const selected = data.projects.filter((p: Project) => p.selected === 1)
            .sort((a: Project, b: Project) => (a.selectedOrder || 0) - (b.selectedOrder || 0));
          
          setSelectedProjects(selected);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [router]);

  // Add a project to the selected list
  const addProject = (project: Project) => {
    // Check if project is already selected
    if (selectedProjects.some(p => p.id === project.id)) {
      setSaveMessage({ type: 'error', text: 'Project already selected' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    
    setSelectedProjects(prevProjects => [...prevProjects, project]);
  };

  // Remove a project from the selected list
  const removeProject = (id: number) => {
    setSelectedProjects((prevProjects) => prevProjects.filter((p) => p.id !== id));
  };

  // Save selected projects to the database
  const saveSelectedProjects = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const projectsToSave = selectedProjects.map((project, index) => ({
        id: project.id,
        order: index + 1
      }));
      
      const res = await fetch('/api/projects/selected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedProjects: projectsToSave }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Selected projects saved successfully' });
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error saving selected projects' });
      }
    } catch (error) {
      console.error('Error saving selected projects:', error);
      setSaveMessage({ type: 'error', text: 'Error saving selected projects' });
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This should never render as the useEffect will redirect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Selected <span className="text-violet-500">Projects</span></h1>
          </div>
          
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            View Site
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Featured Projects</h2>
            <button 
              onClick={saveSelectedProjects} 
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          {saveMessage && (
            <div className={`mb-4 p-4 rounded-lg ${saveMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {saveMessage.text}
            </div>
          )}

          <div className="bg-gray-900 p-4 rounded-xl mb-6">
            <p className="text-gray-400 mb-2">
              Select projects to feature in your portfolio. {selectedProjects.length} selected.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Drag the handle to reorder within each category. Order is saved when you click Save Changes.
            </p>
            {selectedProjects.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No projects selected.
              </div>
            ) : (
              <div>
                {selectedCategories.map((category) => {
                  const projects = selectedGroups[category] ?? [];
                  return (
                    <div key={category} className="mb-6 last:mb-0">
                      <h3 className="text-lg font-bold mb-3 text-violet-400">
                        {category}
                      </h3>
                      <Reorder.Group
                        axis="y"
                        values={projects}
                        onReorder={(next) => reorderWithinCategory(category, next)}
                        className="space-y-2"
                      >
                        {projects.map((project, index) => (
                          <SortableSelectedRow
                            key={project.id}
                            project={project}
                            index={index}
                            onRemove={() => removeProject(project.id)}
                          />
                        ))}
                      </Reorder.Group>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">All Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProjects
              .filter(project => !selectedProjects.some(p => p.id === project.id))
              .map(project => (
                <div
                  key={project.id}
                  className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-full h-32 mb-3 overflow-hidden rounded-md">
                    {isVideoFile(getValidImagePath(project.image)) ? (
                      <video
                        src={getValidImagePath(project.image)}
                        className="w-full h-full object-cover"
                        style={{ objectFit: 'cover' }}
                        autoPlay
                        loop
                        muted
                        playsInline
                        // onLoadedData={() => {
                        //   console.log(`✅ Video loaded for ${project.title}:`, getValidImagePath(project.image));
                        // }}
                        onError={(e) => {
                          console.error(`❌ Video failed for ${project.title}:`, getValidImagePath(project.image));
                          // Optionally set a fallback here
                          e.currentTarget.style.display = 'none'; // Hide the video element
                        }}
                      />
                    ) : (
                      <img
                        src={getValidImagePath(project.image)}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        style={{ objectFit: 'cover' }}
                        // onLoad={() => {
                        //   console.log(`✅ Image loaded for ${project.title}:`, getValidImagePath(project.image));
                        // }}
                        onError={(e) => {
                          if (!e.currentTarget.src.includes('proj1.gif')) {
                            e.currentTarget.src = '/proj1.gif';
                          }
                        }}
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-medium mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{project.year}</p>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  {/* Category */}
                  <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-800 rounded">
                    <strong>Category:</strong> {project?.category || "Uncategorized"}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.languages.slice(0, 3).map((lang, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-1 text-xs bg-gray-800 rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                    {project.languages.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-800 rounded-full">
                        +{project.languages.length - 3}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addProject(project)}
                    className="w-full px-3 py-2 mt-2 bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 rounded-lg transition-colors"
                  >
                    Select Project
                  </button>
                </div>
              ))}
              
            {allProjects.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No projects found. <Link href="/admin/projects/new" className="text-violet-400 hover:underline">Add a project</Link> first.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}