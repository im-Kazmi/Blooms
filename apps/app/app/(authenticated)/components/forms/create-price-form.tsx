'use client';

import {
  type ProductPrice,
  ProductPriceAmountType,
  ProductPriceType,
  SubscriptionRecurringInterval,
} from '@prisma/client';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type * as z from 'zod';
import { PriceInput } from '../price-input';
import type { createProductSchema } from './create-product-form';

type FormType = z.infer<typeof createProductSchema>;

export function CreatePriceForm() {
  const form = useFormContext<FormType>();
  const { control } = form;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'prices',
  });

  const [priceType, setPriceType] = useState<ProductPriceType>(
    ProductPriceType.one_time
  );

  const [amountType, setAmountType] = useState<'fixed' | 'custom' | 'free'>(
    fields.length > 0 && (fields as ProductPrice[])[0].amountType
      ? (fields as ProductPrice[])[0].amountType
      : 'fixed'
  );

  useEffect(() => {
    if (priceType === ProductPriceType.one_time) {
      if (amountType === 'fixed') {
        replace([
          {
            type: 'one_time',

            amountType: 'fixed',

            amount: 0,
          },
        ]);
      } else if (amountType === 'custom') {
        replace([
          {
            type: 'one_time',

            amountType: 'custom',
          },
        ]);
      } else {
        replace([
          {
            type: 'one_time',

            amountType: 'free',
          },
        ]);
      }
    } else if (priceType === ProductPriceType.recurring) {
      if (amountType === 'fixed') {
        replace([
          {
            type: 'recurring',
            amountType: 'fixed',
            recurringInterval: SubscriptionRecurringInterval.month,
            amount: 1,
          },
        ]);
      } else if (amountType === 'free') {
        replace([
          {
            type: 'recurring',

            amountType: 'free',

            recurringInterval: SubscriptionRecurringInterval.month,
          },
        ]);
      } else {
        setAmountType('fixed');
      }
    }
  }, [priceType, replace, amountType]);

  const handleAddPrice = (
    type: ProductPriceType,
    interval?: SubscriptionRecurringInterval
  ) => {
    append({
      type,
      amountType: ProductPriceAmountType.fixed,
      amount: 0,
      ...(interval && { recurringInterval: interval }),
    });
  };

  return (
    <div className="space-y-6">
      <Tabs
        onValueChange={(value) => setPriceType(value as ProductPriceType)}
        defaultValue={ProductPriceType.one_time}
      >
        <TabsList>
          <TabsTrigger value={ProductPriceType.one_time}>One Time</TabsTrigger>
          <TabsTrigger value={ProductPriceType.recurring}>
            Subscription
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {fields.map((field, index) => (
        <PriceField
          key={field.id}
          index={index}
          remove={remove}
          priceType={priceType}
        />
      ))}

      {priceType === ProductPriceType.one_time && fields.length === 0 && (
        <Button
          type="button"
          onClick={() => handleAddPrice(ProductPriceType.one_time)}
        >
          Add One-time Price
        </Button>
      )}

      {priceType === ProductPriceType.recurring && (
        <div className="flex space-x-2">
          {!fields.some(
            (f) => f.recurringInterval === SubscriptionRecurringInterval.month
          ) && (
            <Button
              type="button"
              onClick={() =>
                handleAddPrice(
                  ProductPriceType.recurring,
                  SubscriptionRecurringInterval.month
                )
              }
            >
              Add Monthly Price
            </Button>
          )}
          {!fields.some(
            (f) => f.recurringInterval === SubscriptionRecurringInterval.year
          ) && (
            <Button
              type="button"
              onClick={() =>
                handleAddPrice(
                  ProductPriceType.recurring,
                  SubscriptionRecurringInterval.year
                )
              }
            >
              Add Yearly Price
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface PriceFieldProps {
  index: number;
  remove: (index: number) => void;
  priceType: ProductPriceType;
}

function PriceField({ index, remove, priceType }: PriceFieldProps) {
  const { control, watch, setValue, getValues } = useFormContext<FormType>();
  const amountType = watch(`prices.${index}.amountType`);
  const interval = watch(`prices.${index}.recurringInterval`);

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="flex justify-between items-center">
        <FormField
          control={control}
          name={`prices.${index}.amountType`}
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(val) => {
                  if (priceType === ProductPriceType.recurring) {
                    setValue(
                      `prices.${0}.amountType`,
                      val as ProductPriceAmountType
                    );
                    if (getValues('prices').length > 1) {
                      setValue(
                        `prices.${1}.amountType`,
                        val as ProductPriceAmountType
                      );
                    }
                  } else {
                    field.onChange(val);
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ProductPriceAmountType.fixed}>
                    Fixed
                  </SelectItem>
                  {priceType !== ProductPriceType.recurring && (
                    <SelectItem value={ProductPriceAmountType.custom}>
                      Custom
                    </SelectItem>
                  )}
                  <SelectItem value={ProductPriceAmountType.free}>
                    Free
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        {interval === 'month' ? (
          <Badge>Montly plan</Badge>
        ) : interval === 'year' ? (
          <Badge>Yearly plan</Badge>
        ) : null}
      </div>
      {amountType === ProductPriceAmountType.fixed && (
        <FormField
          control={control}
          name={`prices.${index}.amount`}
          rules={{
            required: 'Amount is required',
            min: { value: 0, message: 'Amount must be positive' },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <PriceInput
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
            control={control}
            name={`prices.${index}.minimumAmount`}
            rules={{
              required: 'Minimum amount is required',
              min: { value: 0, message: 'Amount must be positive' },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Amount</FormLabel>
                <FormControl>
                  <PriceInput
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
            control={control}
            name={`prices.${index}.presetAmount`}
            rules={{
              required: 'Suggested amount is required',
              min: { value: 0, message: 'Amount must be positive' },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suggested Amount</FormLabel>
                <FormControl>
                  <PriceInput
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
    </div>
  );
}
