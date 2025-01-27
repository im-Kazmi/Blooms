import {
  Discount,
  Prisma,
  PrismaClient,
  ProductPrice,
  ProductPriceAmountType,
  ProductPriceType,
  prisma,
} from "@repo/database";
import { COUNTRY_TAX_ID_MAP } from "@repo/shared/index";

export class ValidationService {
  async getValidatedPrice(priceId: string) {
    try {
      const price = await prisma.productPrice.findFirst({
        where: {
          id: priceId,
        },
        include: {
          product: true,
        },
      });

      if (!price) {
        throw new Error(`Price with ID "${priceId}" was not found.`);
      }

      if (price.isArchived) {
        throw new Error(
          `Price with ID "${priceId}" is archived and cannot be used.`,
        );
      }

      if (price.product.isArchived) {
        throw new Error(
          `The product associated with price ID "${priceId}" is archived and cannot be used.`,
        );
      }

      return {
        amountType: price.amountType,
        maximumAmount: price.maximumAmount,
        minimumAmount: price.minimumAmount,
        presetAmount: price.presetAmount,
        priceCurrency: price.priceCurrency,
        stripePriceId: price.stripePriceId,
        isArchived: price.isArchived,
        priceAmount: price.priceAmount,
        productId: price.productId,
        recurringInterval: price.recurringInterval,
        type: price.type,
        createdAt: price.createdAt,
        id: price.id,
        updatedAt: price.updatedAt,
      };
    } catch (err) {
      console.log(err);
    }
  }

  async getValidatedProduct(productId: string) {
    try {
      const product = await prisma.product.findFirst({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new Error(`Product with ID "${productId}" was not found.`);
      }

      if (product.isArchived) {
        throw new Error(
          `Product with ID "${productId}" is archived and cannot be used.`,
        );
      }

      return product;
    } catch (err) {
      console.log(err);
    }
  }

  async getValidatedDiscount({
    discountId,
    dicountCode,
    price,
  }: {
    discountId?: string;
    dicountCode?: string;
    price: ProductPrice;
  }) {
    try {
      if (!this.isValidAmountTypeForDiscount(price.amountType)) {
        throw new Error(
          `Discounts can only be applied to prices with "fixed" or "custom" amount types. The provided price has an amount type of "${price.amountType}".`,
        );
      }

      let args: Prisma.DiscountFindFirstArgs = {};

      if (dicountCode) {
        args = {
          ...args,
          where: {
            code: dicountCode,
          },
        };
      }

      if (discountId) {
        args = {
          ...args,
          where: {
            id: discountId,
          },
        };
      }

      let discount: Discount | null;

      discount = await prisma.discount.findFirst(args)!;

      if (!discount) {
        throw new Error(
          discountId
            ? `Discount with ID "${discountId}" was not found.`
            : `Discount with code "${dicountCode}" was not found.`,
        );
      }

      if (price.type === "one_time" && discount.duration === "repeating") {
        throw new Error(
          `A repeating discount cannot be applied to a one-time price. Price ID: "${price.id}", Discount ID: "${discount.id}".`,
        );
      }

      return discount;
    } catch (err) {
      console.log(err);
    }
  }

  async getValidatedSubscription(subscriptionId: string, storeId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          product: {
            storeId,
          },
        },
        include: {
          product: true,
          customer: true,
          price: true,
        },
      });

      if (!subscription) {
        throw new Error(
          `Subscription with ID "${subscriptionId}" was not found for store ID "${storeId}".`,
        );
      }

      if (subscription.price.amountType !== "free") {
        throw new Error(
          `Only free subscriptions can be upgraded. The subscription with ID "${subscriptionId}" has a price amount type of "${subscription.price.amountType}".`,
        );
      }

      return subscription;
    } catch (err) {
      console.log(err);
    }
  }

  isValidAmountTypeForDiscount(value: any): value is ProductPriceAmountType {
    return value === "fixed" || value === "custom";
  }

  getValidatedTax(taxId: string, countryCode: string) {
    const taxIds = COUNTRY_TAX_ID_MAP[countryCode];

    if (!taxIds) {
      throw new Error("unsupported country");
    }

    return taxIds;
  }
}
