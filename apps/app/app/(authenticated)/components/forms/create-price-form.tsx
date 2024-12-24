'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProductPriceAmountType,
  ProductPriceType,
  SubscriptionRecurringInterval,
} from '@prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
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
import {
  RadioGroup,
  RadioGroupItem,
} from '@repo/design-system/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Switch } from '@repo/design-system/components/ui/switch';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const priceFormSchema = z.object({
  type: z.nativeEnum(ProductPriceType),
  recurringInterval: z.nativeEnum(SubscriptionRecurringInterval).optional(),
  amountType: z.nativeEnum(ProductPriceAmountType),
  priceCurrency: z.string().min(3).max(3),
  priceAmount: z.number().min(0).optional(),
  minimumAmount: z.number().min(0).optional(),
  maximumAmount: z.number().min(0).optional(),
  presetAmount: z.number().min(0).optional(),
  isArchived: z.boolean(),
});

type PriceFormValues = z.infer<typeof priceFormSchema>;

export function CreatePriceForm() {
  const [priceType, setPriceType] = useState<ProductPriceType>(
    ProductPriceType.one_time
  );
  const [amountType, setAmountType] = useState<ProductPriceAmountType>(
    ProductPriceAmountType.fixed
  );

  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: {
      type: ProductPriceType.one_time,
      amountType: ProductPriceAmountType.fixed,
      priceCurrency: 'USD',
      isArchived: false,
    },
  });

  function onSubmit(data: PriceFormValues) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setPriceType(value as ProductPriceType);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a price type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ProductPriceType.one_time}>
                    One Time
                  </SelectItem>
                  <SelectItem value={ProductPriceType.recurring}>
                    Recurring
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {priceType === ProductPriceType.recurring && (
          <FormField
            control={form.control}
            name="recurringInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurring Interval</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a recurring interval" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={SubscriptionRecurringInterval.month}>
                      Monthly
                    </SelectItem>
                    <SelectItem value={SubscriptionRecurringInterval.year}>
                      Yearly
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="amountType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Amount Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    setAmountType(value as ProductPriceAmountType);
                  }}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={ProductPriceAmountType.fixed} />
                    </FormControl>
                    <FormLabel className="font-normal">Fixed</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={ProductPriceAmountType.custom} />
                    </FormControl>
                    <FormLabel className="font-normal">Custom</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={ProductPriceAmountType.free} />
                    </FormControl>
                    <FormLabel className="font-normal">Free</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priceCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="USD" {...field} />
              </FormControl>
              <FormDescription>
                Enter the 3-letter currency code (e.g., USD, EUR, GBP)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {amountType === ProductPriceAmountType.fixed && (
          <FormField
            control={form.control}
            name="priceAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {amountType === ProductPriceAmountType.custom && (
          <>
            <FormField
              control={form.control}
              name="minimumAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number.parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maximumAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number.parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="presetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preset Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number.parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="isArchived"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Archived</FormLabel>
                <FormDescription>
                  This price will be archived and not available for new
                  purchases.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Create Price</Button>
      </form>
    </Form>
  );
}
