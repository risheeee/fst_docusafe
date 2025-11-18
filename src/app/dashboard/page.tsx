'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { StudentDashboard } from '@/components/student/student-dashboard';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { Header } from '@/components/shared/header';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authAPI.getCurrentUser,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (data?.success && data.user) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    }
  }, [data, isLoading, setUser, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
      </main>
    </div>
  );
}
