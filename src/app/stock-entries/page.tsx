'use client';

import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/MainLayout';
import StockEntryList from '@/components/StockEntryList';

export default function StockEntriesPage() {
  return (
      <MainLayout>
        <StockEntryList />
      </MainLayout>
  );
}
