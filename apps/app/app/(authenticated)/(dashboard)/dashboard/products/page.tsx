'use client';

import DashboardHeader from '@/app/(authenticated)/components/dashboard/dashboard-header';
import { ShadowWrapper } from '@/app/(authenticated)/components/shadow-wrapper';
import type { $Enums } from '@prisma/client';
import type { ColumnDef } from '@repo/design-system/components/data-table';
import { DataTable } from '@repo/design-system/components/data-table';
import { DataTableColumnHeader } from '@repo/design-system/components/data-table/helpers';
import { useGetProducts } from '@repo/features/product/queries/use-get-products';
import { useGetActiveStore } from '@repo/features/store/queries/use-get-active-store';
import { Grid, Table } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useState } from 'react';

type Product = {
  prices: {
    id: string;
    amountType: $Enums.ProductPriceAmountType;
  }[];
  storeId: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  stripeProductId: string | null;
};

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="name" />
    ),
  },
];

enum ProductView {
  TABLE = 'table',
  GRID = 'grid',
}

export default function page() {
  const [view, setView] = useState<ProductView>(ProductView.TABLE);

  const { data: activeStore, isLoading: isActiveStoreLoading } =
    useGetActiveStore();

  if (!activeStore?.id && !isActiveStoreLoading) {
    redirect('/onboarding');
  }

  const { data: products, isLoading: isProductsLoading } = useGetProducts(
    'asdf.id',
    {}
  );

  const isLoading = isActiveStoreLoading || isProductsLoading;

  return (
    <div>
      <DashboardHeader title="Products">
        <div className="flex gap-x-2">
          <Grid onClick={() => setView(ProductView.GRID)} />
          <Table onClick={() => setView(ProductView.TABLE)} />
        </div>
      </DashboardHeader>
      {view === ProductView.TABLE ? (
        <DataTable
          data={products ? products : []}
          columns={columns}
          isLoading={isLoading}
          filterableColumns={[
            {
              id: 'isArchived',
              title: 'isArchived',
              options: [{ label: 'Archived', value: 'isArchived' }],
            },
          ]}
        />
      ) : (
        <div className="flex gap-x-5">
          {products?.map((product) => (
            <ShadowWrapper>{product.name}</ShadowWrapper>
          ))}
        </div>
      )}
    </div>
  );
}
