'use client';

import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/MainLayout';
import ProductList from '@/components/products/ProductList';

export default function ProductsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ProductList />
      </MainLayout>
    </AuthGuard>
  );
}
