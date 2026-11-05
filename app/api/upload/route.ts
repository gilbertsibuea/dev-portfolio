import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Route segment config for App Router - increase body size limit for video uploads
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for large uploads

export async function POST(req: NextRequest) {
  // console.log('=== UPLOAD API ROUTE CALLED ===');

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    
    // Check if file is an image, GIF, or video
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/webm', 'video/mp4', 'video/mov', 'video/quicktime'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPG, PNG, GIF, WebP, WebM, MP4, and MOV files are allowed.' 
      }, { status: 400 });
    }
    
    // Check file size (limit based on type: 50MB for videos, 10MB for GIFs, 5MB for images)
    let maxSize: number;
    if (file.type.startsWith('video/')) {
      maxSize = 50 * 1024 * 1024; // 50MB for videos
    } else if (file.type === 'image/gif') {
      maxSize = 10 * 1024 * 1024; // 10MB for GIFs
    } else {
      maxSize = 5 * 1024 * 1024; // 5MB for images
    }
    
    if (file.size > maxSize) {
      const sizeLimit = file.type.startsWith('video/') ? '50MB' : 
                       file.type === 'image/gif' ? '10MB' : '5MB';
      return NextResponse.json({ 
        success: false, 
        error: `File size exceeds ${sizeLimit} limit` 
      }, { status: 400 });
    }
    
    // Optional folder: projects (default) | blog
    const folderRaw = String(formData.get('folder') || 'projects').toLowerCase();
    const folder = folderRaw === 'blog' ? 'blog' : 'projects';

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Return the public URL path
    const imageUrl = `/uploads/${folder}/${fileName}`;
    
    // console.log('File saved successfully:', imageUrl);
    
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileType: file.type,
      fileName: fileName
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' }, 
      { status: 500 }
    );
  }
}