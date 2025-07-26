'use client';

import { useAuthStore } from '@/store/authStore';
import MainLayout from '@/components/MainLayout';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}
