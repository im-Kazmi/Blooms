'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextureButton } from '@repo/design-system/components/texture-button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { useCreateStore } from '@repo/features/store/mutations/use-create-store';
import { useGetStores } from '@repo/features/store/queries/use-get-stores';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
const storeSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  url: z.string().min(1, 'Store url is required'),
  description: z.string().optional(),
  currency: z.string().default('USD'),
});

type StoreFormValues = z.infer<typeof storeSchema>;

export function CreateStoreForm() {
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      url: '',
      description: '',
      currency: 'USD',
    },
  });

  const mutation = useCreateStore();
  const { data: stores, isLoading } = useGetStores();

  function onSubmit(data: StoreFormValues) {
    mutation.mutate(
      {
        ...data,
      },
      {
        onSuccess(data, variables, context) {},
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>name</FormLabel>
              <FormControl>
                <Input placeholder="mystore" {...field} />
              </FormControl>
              <FormDescription>This is the name of the store.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>url</FormLabel>
              <FormControl>
                <Input placeholder="mystore" {...field} />
              </FormControl>
              <FormDescription>
                Public url for store (products).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <TextureButton variant="destructive" size="sm">
          {mutation.isPending ? 'creating...' : 'create'}
        </TextureButton>
      </form>
    </Form>
  );
}
