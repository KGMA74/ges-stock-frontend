'use client';

import MainLayout from '@/components/MainLayout';
import CustomerTable from '@/components/customers/CustomerTable';

export default function CustomersPage() {
  return (
    <MainLayout>
      <CustomerTable />
    </MainLayout>
  );
}
