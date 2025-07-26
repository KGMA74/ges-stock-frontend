'use client';

import { useAuthStore } from '@/store/authStore';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/MainLayout';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </AuthGuard>
  );
}
