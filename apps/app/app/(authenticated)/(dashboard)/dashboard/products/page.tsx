"use client";

import DashboardHeader from "@/app/(authenticated)/components/dashboard/dashboard-header";
import { ShadowWrapper } from "@/app/(authenticated)/components/shadow-wrapper";
import type { $Enums } from "@prisma/client";
import type { ColumnDef } from "@repo/design-system/components/data-table";
import { Button } from "@repo/design-system/components/ui/button";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { DataTable } from "@repo/design-system/components/data-table";
import { DataTableColumnHeader } from "@repo/design-system/components/data-table/helpers";
import { useGetProducts } from "@repo/features/product/queries/use-get-products";
import { useGetActiveStore } from "@repo/features/store/queries/use-get-active-store";
import {
  Grid,
  Table,
  PlusCircle,
  Grid2X2,
  List,
  LayoutDashboard,
  Layout,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/design-system/components/ui/tooltip";
import ProductActions from "@/app/(authenticated)/components/product/table-actions";

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
  stripeProductId: string | null;
};

const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    // enableSorting: false,
    // enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="name" />
    ),
  },
  {
    accessorKey: "storeId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="storeId" />
    ),
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => {
      return <ProductActions id={row.original.id} />;
    },
  },
];

enum ProductView {
  TABLE = "table",
  GRID = "grid",
}

export default function page() {
  const [view, setView] = useState<ProductView>(ProductView.TABLE);

  const { data: activeStore, isLoading: isActiveStoreLoading } =
    useGetActiveStore();

  if (!activeStore?.id && !isActiveStoreLoading) {
    redirect("/onboarding");
  }

  const { data: products, isLoading: isProductsLoading } = useGetProducts({});

  const isLoading = isActiveStoreLoading || isProductsLoading;

  return (
    <div>
      <DashboardHeader title="Products">
        <div className="flex gap-x-2">
          <Tooltip>
            <TooltipTrigger>
              <Layout onClick={() => setView(ProductView.GRID)} />
            </TooltipTrigger>
            <TooltipContent side="top">Grid View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <List onClick={() => setView(ProductView.TABLE)} />
              <TooltipContent side="top">Table View</TooltipContent>
            </TooltipTrigger>
          </Tooltip>
          <Link href="/dashboard/products/new">
            <Button size="sm">
              <PlusCircle /> new product
            </Button>
          </Link>
        </div>
      </DashboardHeader>
      {view === ProductView.TABLE ? (
        <DataTable
          data={products ? products : []}
          columns={columns}
          isLoading={isLoading}
          filterableColumns={[
            {
              id: "isArchived",
              title: "isArchived",
              options: [{ label: "Archived", value: "isArchived" }],
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
