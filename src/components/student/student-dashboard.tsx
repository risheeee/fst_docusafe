'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsAPI } from '@/lib/api';
import { FileUpload } from '@/components/shared/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize, formatDate } from '@/lib/utils';
import { FileText, Download, Trash2, Upload as UploadIcon } from 'lucide-react';

export function StudentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['myDocuments'],
    queryFn: documentsAPI.getMyDocuments,
  });

  const uploadMutation = useMutation({
    mutationFn: documentsAPI.uploadDocument,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
      setUploadingFile(null);
      queryClient.invalidateQueries({ queryKey: ['myDocuments'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Upload failed',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentsAPI.deleteDocument,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['myDocuments'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Delete failed',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setUploadingFile(file);
  };

  const handleUpload = () => {
    if (uploadingFile) {
      uploadMutation.mutate(uploadingFile);
    }
  };

  const handleDelete = (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(documentId);
    }
  };

  const documents = documentsData?.documents || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="text-muted-foreground">Upload and manage your documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>Upload a new document to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFileSelect={handleFileSelect}
            disabled={uploadMutation.isPending}
          />
          {uploadingFile && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{uploadingFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadingFile.size)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  size="sm"
                >
                  <UploadIcon className="h-4 w-4 mr-2" />
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  onClick={() => setUploadingFile(null)}
                  variant="outline"
                  size="sm"
                  disabled={uploadMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Documents ({documents.length})</CardTitle>
          <CardDescription>View and manage your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No documents uploaded yet
            </p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{doc.originalName}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={doc.filePath} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
