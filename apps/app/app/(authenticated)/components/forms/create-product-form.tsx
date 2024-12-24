'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import { Form } from '@repo/design-system/components/ui/form';
import { toast } from '@repo/design-system/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const productSchema = z.object({
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  prices: z
    .array(
      z.object({
        type: z.enum(['one_time', 'recurring']),
        recurringInterval: z
          .enum(['daily', 'weekly', 'monthly', 'yearly'])
          .optional(),
        amountType: z.enum(['fixed', 'minimum', 'pay_what_you_want']),
        amount: z.number().min(0),
      })
    )
    .min(1, {
      message: 'At least one price must be added.',
    }),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductCreationPage() {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      prices: [],
    },
  });

  function onSubmit(data: ProductFormValues) {
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Create New Product
          </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* <ProductNameInput form={form} />
              <ProductDescriptionInput form={form} />
              <PriceCreator form={form} /> */}
              <Button type="submit" className="w-full">
                Create Product
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
