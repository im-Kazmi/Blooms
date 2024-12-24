'use client';

import { useGetActiveStore } from '@/features/store/queries/use-get-active-store';
import { useGetStores } from '@/features/store/queries/use-get-stores';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { cn } from '@repo/design-system/lib/utils';
import { Check, ChevronsUpDown, PlusCircle, Store } from 'lucide-react';
import { useState } from 'react';

const StoreSwitcher = () => {
  const { data: activeStore } = useGetActiveStore();
  const { data: stores } = useGetStores();
  const [open, setOpen] = useState(false);

  const onStoreSelect = (storeId: string) => {
    console.log(`Switching to store: ${storeId}`);
    setOpen(false);
  };

  const onCreateStore = () => {
    console.log('Opening new store modal');
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className="w-[200px] justify-between"
        >
          <Store className="mr-2 h-4 w-4" />
          {activeStore?.name}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>My Stores</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {stores &&
          stores.data &&
          stores.data?.map((store) => (
            <DropdownMenuItem
              key={store.id}
              onSelect={() => onStoreSelect(store.id)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  activeStore?.id === store.id ? 'opacity-100' : 'opacity-0'
                )}
              />
              {store.name}
            </DropdownMenuItem>
          ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onCreateStore} className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Store
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StoreSwitcher;
