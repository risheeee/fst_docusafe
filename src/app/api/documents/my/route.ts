import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const user = await getUserSession();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT d.*, u.name as user_name, u.email as user_email 
       FROM documents d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.user_id = $1 
       ORDER BY d.uploaded_at DESC`,
      [user.id]
    );

    const documents = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      fileName: row.file_name,
      originalName: row.original_name,
      fileSize: parseInt(row.file_size),
      fileType: row.file_type,
      filePath: row.file_path,
      uploadedAt: row.uploaded_at,
    }));

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Get my documents error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
