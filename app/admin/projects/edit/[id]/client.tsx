'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { uploadAdminFile } from '@/lib/admin-upload'

// Helper function to check if file is a video
const isVideoFile = (url: string | URL | undefined | null, fileType?: string): boolean => {
  // Check file type first (for blob URLs from newly uploaded files)
  if (fileType && fileType.startsWith('video/')) {
    return true;
  }
  
  if (!url) return false;
  if (url instanceof URL) url = url.toString();
  if (typeof url !== 'string') return false;
  
  // Check URL extension
  return url.includes('.webm') || url.includes('.mp4') || url.includes('.mov');
};

// Helper function to validate image/video URL
const getValidMediaUrl = (url: string | URL | undefined | null): string => {

  // Default fallback image
  const fallbackImage = '/proj1.png';

  if (url instanceof URL) {
    return url.toString();
  }
  if (!url || typeof url !== 'string') {
    return fallbackImage;
  }
  // Blob URLs are temporary and only valid during the upload session
  if (url.startsWith('blob:')) {
    return fallbackImage;
  }
  if (url.includes('uploads/')) {
    return url.startsWith('/') ? url : '/' + url;
  }
  if (!url.startsWith('http') && !url.startsWith('/')) {
    return '/' + url;
  }
  return url;
}

// Client component that receives id directly
export function ProjectEditClient({ id }: { id: string }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [projectNotFound, setProjectNotFound] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadedFileType, setUploadedFileType] = useState<string>('') // Track uploaded file type
  const [originalImage, setOriginalImage] = useState<string>('/proj1.png') // Store original image for reset
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // GIF upload state
  const [uploadedGif, setUploadedGif] = useState<File | null>(null)
  const [gifPreview, setGifPreview] = useState<string>('')
  const [gifUploadProgress, setGifUploadProgress] = useState<number>(0)
  const [isUploadingGif, setIsUploadingGif] = useState<boolean>(false)
  const gifFileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  
    
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    year: new Date().getFullYear(),
    description: '',
    details: '',
    category: '',
    languages: [''],
    githubLink: '',
    liveLink: '',
    image: '/proj1.png',
    gifUrl: ''
  })

  useEffect(() => {
    const AdminAuth = localStorage.getItem('adminAuth')
    if (!AdminAuth){
      router.push('/admin')
      return
    }

  const fetchProject = async () => {
    try {
      if (!id || isNaN(parseInt(id))) {
        setProjectNotFound(true)
        setIsLoading(false)
        return
      }
      
      // Fetch project from API
      const response = await fetch(`/api/projects/${id}`)
      const data = await response.json()
      
      if (data.success && data.project) {
        const imageUrl = data.project.image.src || '/proj1.png';
        setOriginalImage(imageUrl);
        setForm({
          title: data.project.title,
          year: data.project.year,
          description: data.project.description,
          details: data.project.details || '',
          category: data.project.category || '',
          languages: data.project.languages,
          githubLink: data.project.githubLink || '',
          liveLink: data.project.liveLink || '',
          image: imageUrl,
          gifUrl: data.project.gifUrl || ''
        })
        // Set GIF preview if project already has a GIF
        if (data.project.gifUrl) {
          setGifPreview(data.project.gifUrl)
        }
      } else {
        setProjectNotFound(true)
      }
      
      setIsAuthenticated(true)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching project:', error)
      setProjectNotFound(true)
      setIsLoading(false)
    }
  }

    
    // Get the project data to edit
    fetchProject()
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLanguageChange = (index: number, value: string) => {
    const updatedLanguages = [...form.languages]
    updatedLanguages[index] = value
    setForm(prev => ({
      ...prev,
      languages: updatedLanguages
    }))
  }

  const addLanguageField = () => {
    setForm(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }))
  }

  const removeLanguageField = (index: number) => {
    if (form.languages.length <= 1) return
    
    const updatedLanguages = [...form.languages]
    updatedLanguages.splice(index, 1)
    setForm(prev => ({
      ...prev,
      languages: updatedLanguages
    }))
  }

  // New file upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type - now includes video formats
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/webm', 'video/mp4', 'video/mov'
    ]
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image file (JPG, PNG, GIF, WebP) or video file (WebM, MP4, MOV)')
      return
    }

    // Check file size (limit based on type)
    let maxSize
    if (file.type.startsWith('video/')) {
      maxSize = 50 * 1024 * 1024 // 50MB for videos
    } else if (file.type === 'image/gif') {
      maxSize = 10 * 1024 * 1024 // 10MB for GIFs
    } else {
      maxSize = 5 * 1024 * 1024 // 5MB for images
    }

    if (file.size > maxSize) {
      const sizeLimit = file.type.startsWith('video/') ? '50MB' : 
                       file.type === 'image/gif' ? '10MB' : '5MB'
      alert(`File size exceeds ${sizeLimit} limit`)
      return
    }

    setUploadedImage(file)
    setUploadedFileType(file.type) // Store the file type for preview detection
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    
    // Update form with the preview URL for now
    // This will be replaced with the actual URL after upload
    setForm(prev => ({
      ...prev,
      image: previewUrl
    }))
  }

  const uploadImage = async (): Promise<string> => {
    if (!uploadedImage) return form.image

    setIsUploading(true)
    setUploadProgress(0)

    try {
      return await uploadAdminFile(uploadedImage, {
        folder: 'projects',
        onProgress: setUploadProgress,
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image. Please try again.')
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleGifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'image/gif') {
      alert('Please upload a GIF file (.gif)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('GIF file size exceeds 10MB limit')
      return
    }
    setUploadedGif(file)
    setGifPreview(URL.createObjectURL(file))
  }

  const uploadGif = async (): Promise<string> => {
    if (!uploadedGif) return form.gifUrl

    setIsUploadingGif(true)
    setGifUploadProgress(0)

    try {
      return await uploadAdminFile(uploadedGif, {
        folder: 'projects',
        onProgress: setGifUploadProgress,
      })
    } catch (error) {
      console.error('Error uploading GIF:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload GIF. Please try again.')
      throw error
    } finally {
      setIsUploadingGif(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // First upload the image if there is one
      let imageUrl = form.image
      if (uploadedImage) {
        imageUrl = await uploadImage()
      }

      // Upload GIF if a new one was selected
      let gifUrl = form.gifUrl
      if (uploadedGif) {
        gifUrl = await uploadGif()
      }
      
      // Update project using the API
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          image: { src: imageUrl },
          gifUrl,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        router.push('/admin/projects')
      } else {
        throw new Error(data.error || 'Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (projectNotFound) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-400 mb-6">The project you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link
            href="/admin/projects"
            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors inline-block"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Admin Header/Navigation */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard" className="text-xl font-bold">
              Admin <span className="text-violet-500">Dashboard</span>
            </Link>
            <span className="text-gray-500">/</span>
            <Link href="/admin/projects" className="text-xl font-bold">
              Projects
            </Link>
            <span className="text-gray-500">/</span>
            <h1 className="text-xl font-bold">Edit Project</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/admin/projects" className="text-gray-400 hover:text-white transition-colors">
              Cancel
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Edit Project</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="title" className="block text-gray-400 mb-2">Project Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="year" className="block text-gray-400 mb-2">Year *</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  min={2000}
                  max={2100}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-400 mb-2">Description (Short) *</label>
              <input
                type="text"
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="details" className="block text-gray-400 mb-2">Details (Long)</label>
              <textarea
                id="details"
                name="details"
                value={form.details}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="category" className="block text-gray-400 mb-2">Category</label>
                <select
                  name="category"
                  id="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select Category</option>
                  <option value="Web">Web</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Data">Data</option>
                  <option value="ML & AI">ML & AI</option>
                  <option value="Others">Others</option>
                </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-400 mb-2">Technologies/Languages *</label>
              {form.languages.map((lang, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={lang}
                    onChange={(e) => handleLanguageChange(index, e.target.value)}
                    className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeLanguageField(index)}
                    className="ml-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    disabled={form.languages.length <= 1}
                  >
                    -
                  </button>
                  {index === form.languages.length - 1 && (
                    <button
                      type="button"
                      onClick={addLanguageField}
                      className="ml-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="githubLink" className="block text-gray-400 mb-2">GitHub Link</label>
                <input
                  type="url"
                  id="githubLink"
                  name="githubLink"
                  value={form.githubLink}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="https://github.com/..."
                />
              </div>
              
              <div>
                <label htmlFor="liveLink" className="block text-gray-400 mb-2">Live Demo Link</label>
                <input
                  type="url"
                  id="liveLink"
                  name="liveLink"
                  value={form.liveLink}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-gray-400 mb-2">Project Image / Video</label>
              <div className="flex flex-col space-y-4">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/webm,video/mp4,video/mov,.gif,.webm,.mp4,.mov"
                  className="hidden"
                />
                
                {/* Image or video preview */}
                <div className="relative h-48 border-2 border-dashed rounded-lg overflow-hidden border-gray-700 hover:border-gray-500 transition-colors">
                  {imagePreview || form.image ? (
                    <div className="relative w-full h-full">
                      {isVideoFile(imagePreview || form.image, imagePreview ? uploadedFileType : undefined) ? (
                        <video
                          key={imagePreview || form.image} // Force re-render when source changes
                          src={getValidMediaUrl(imagePreview || form.image)}
                          className="w-full h-full object-cover"
                          width={600}
                          height={400}
                          autoPlay
                          loop
                          muted
                          playsInline
                          onError={(e) => {
                            const fallbackVideo = '/project_fallback.webm';
                            if (e.currentTarget.src !== fallbackVideo) {
                              e.currentTarget.src = fallbackVideo;
                            }
                          }}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={imagePreview || getValidMediaUrl(form.image)} 
                          alt="Project thumbnail" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const fallbackImage = '/proj1.png';
                            if (!e.currentTarget.src.endsWith(fallbackImage)) {
                              e.currentTarget.src = fallbackImage;
                            }
                          }}
                        />
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
                          <div className="w-3/4 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-violet-500 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="mt-2 text-sm text-white">{uploadProgress}% Uploaded</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400">No image or video selected</p>
                    </div>
                  )}
                </div>
                
                {/* Upload button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={triggerFileInput}
                  className="w-full py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  {uploadedImage ? 'Change Image/Video' : 'Upload Image/Video'}
                </motion.button>
                
                {/* File selected indicator */}
                {uploadedImage && (
                  <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400 text-sm">
                      New file selected: <strong>{uploadedImage.name}</strong> ({(uploadedImage.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImage(null);
                        setImagePreview('');
                        setUploadedFileType('');
                        // Reset to original image
                        setForm(prev => ({ ...prev, image: originalImage }));
                      }}
                      className="ml-auto text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                <p className="text-sm text-gray-400">
                  Supports JPG, PNG, GIF, WEBP, WEBM, MP4, MOV (Max size: 5MB for images, 10MB for GIFs, 50MB for videos)
                </p>
              </div>
            </div>

            {/* GIF Upload for Portfolio Display */}
            <div className="mb-8">
              <label className="block text-gray-400 mb-1">Portfolio GIF <span className="text-xs text-violet-400">(optional — prioritized over main image in portfolio)</span></label>
              <div className="flex flex-col space-y-3">
                <input
                  type="file"
                  ref={gifFileInputRef}
                  onChange={handleGifChange}
                  accept=".gif,image/gif"
                  className="hidden"
                />

                {gifPreview ? (
                  <div className="relative h-32 rounded-lg overflow-hidden bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gifPreview}
                      alt="GIF preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    {isUploadingGif && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
                        <div className="w-3/4 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 transition-all duration-300" style={{ width: `${gifUploadProgress}%` }} />
                        </div>
                        <p className="mt-2 text-sm text-white">{gifUploadProgress}%</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-24 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                    No GIF selected
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => gifFileInputRef.current?.click()}
                  className="w-full py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  {uploadedGif || form.gifUrl ? 'Change GIF' : 'Upload GIF'}
                </button>

                {(uploadedGif || form.gifUrl) && (
                  <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                    <span className="text-green-400 text-sm">
                      {uploadedGif ? <>New GIF: <strong>{uploadedGif.name}</strong> ({(uploadedGif.size / (1024 * 1024)).toFixed(2)} MB)</> : <>Current GIF: <strong>{form.gifUrl}</strong></>}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setUploadedGif(null); setGifPreview(''); setForm(prev => ({ ...prev, gifUrl: '' })); }}
                      className="ml-auto text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/projects"
                className="px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </Link>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Update Project'}
              </motion.button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}