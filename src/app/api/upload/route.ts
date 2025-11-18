import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
];

export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'File type not allowed' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const fileExt = file.name.split('.').pop() || 'bin';
    const sanitizedExt = fileExt.replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `${uuidv4()}.${sanitizedExt}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const result = await query(
      `INSERT INTO documents (user_id, file_name, original_name, file_size, file_type, file_path) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [user.id, fileName, file.name, file.size, file.type, `/uploads/${fileName}`]
    );

    const document = result.rows[0];

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        userId: document.user_id,
        userName: user.name,
        userEmail: user.email,
        fileName: document.file_name,
        originalName: document.original_name,
        fileSize: parseInt(document.file_size),
        fileType: document.file_type,
        filePath: document.file_path,
        uploadedAt: document.uploaded_at,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
