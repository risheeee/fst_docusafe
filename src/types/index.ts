export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  createdAt: Date;
}

export interface Document {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  filePath: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface UploadResponse {
  success: boolean;
  document?: Document;
  message?: string;
}

export interface DocumentsResponse {
  success: boolean;
  documents: Document[];
  message?: string;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
  message?: string;
}
