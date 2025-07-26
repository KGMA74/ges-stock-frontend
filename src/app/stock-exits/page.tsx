'use client';

import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/MainLayout';
import StockExitList from '@/components/StockExitList';

export default function StockExitsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <StockExitList />
      </MainLayout>
    </AuthGuard>
  );
}
