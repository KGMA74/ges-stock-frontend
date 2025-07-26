'use client';

import MainLayout from '@/components/MainLayout';
import ProductTable from '@/components/products/ProductTable';

export default function ProductsPage() {
  return (
    <MainLayout>
      <ProductTable />
    </MainLayout>
  );
}
