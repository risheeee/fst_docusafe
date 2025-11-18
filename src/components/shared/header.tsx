'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { FileText, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Logout failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">DocuSafe</h1>
            {user && (
              <p className="text-xs text-muted-foreground capitalize">{user.role} Portal</p>
            )}
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
