import {
  Discount,
  prisma,
  Prisma,
  Product,
  ProductPrice,
  SubscriptionRecurringInterval,
} from "@repo/database";
import { BaseService } from "./base-service";
import { stripe, Stripe } from "@repo/payments";
import { UserService } from "./user";
import { PaginationParams, QueryUtils, SortingParams } from "@/utils/query";
import { productService, storeService, stripeService } from ".";

const userService = new UserService(prisma);

export class DiscoundService extends BaseService {
  list(
    storeId: string | null,
    params: PaginationParams &
      SortingParams<keyof Prisma.StoreOrderByWithRelationInput>,
  ) {
    const { skip, take } = QueryUtils.getPaginationParams(params);
    const orderBy = QueryUtils.getSortingParams(params);

    let args: Prisma.DiscountFindManyArgs = {
      skip,
      take,
      orderBy,
    };

    if (storeId) {
      args = {
        ...args,
        where: {
          storeId,
        },
      };
    }

    const query = this.prisma.discount.findMany(args);

    return QueryUtils.paginateQuery(query, this.prisma.discount, params);
  }

  async getById(id: string) {
    try {
      const query = await this.prisma.discount.findFirst({
        where: {
          id,
        },
        include: {
          store: true,
        },
      });

      return query;
    } catch (error) {
      throw new Error(`Error getting discount: ${(error as Error).message}`);
    }
  }
  async getByIdAndProduct(
    id: string,
    product: Product,
    isRedeemAble?: boolean,
  ) {
    try {
      const args: Prisma.DiscountFindFirstOrThrowArgs = {
        where: {
          id,
          discountProducts: {
            some: {
              productId: product.id,
            },
          },
        },
      };

      const query = await this.prisma.discount.findFirst(args);

      if (!query) {
        throw new Error("discount not found");
      }

      if (isRedeemAble && (await this.isRedeemAbleDiscount(query))) {
        return;
      }

      return query;
    } catch (error) {
      throw new Error(
        `Error getting discount with producte: ${(error as Error).message}`,
      );
    }
  }

  async getByCode(code: string) {
    try {
      const query = await this.prisma.discount.findFirst({
        where: {
          code,
        },
      });

      return query;
    } catch (error) {
      throw new Error(
        `Error getting discount with code: ${(error as Error).message}`,
      );
    }
  }

  async getByCodeAndStore(
    code: string,
    storeId: string,
    isRedeemAble?: boolean,
  ) {
    try {
      const query = await this.prisma.discount.findFirst({
        where: {
          code,
          storeId,
        },
      });

      if (!query) {
        throw new Error("discount not found");
      }

      if (isRedeemAble && (await this.isRedeemAbleDiscount(query))) {
        return;
      }

      return query;
    } catch (error) {
      throw new Error(
        `Error getting discount with code and store: ${(error as Error).message}`,
      );
    }
  }

  async getByCodeAndProduct(
    code: string,
    product: Product,
    isRedeemAble?: boolean,
  ) {
    try {
      const args: Prisma.DiscountFindFirstOrThrowArgs = {
        where: {
          code,
          discountProducts: {
            some: {
              productId: product.id,
            },
          },
        },
      };

      const query = await this.prisma.discount.findFirst(args);

      if (!query) {
        throw new Error("discount not found");
      }

      if (isRedeemAble && (await this.isRedeemAbleDiscount(query))) {
        return;
      }

      return query;
    } catch (error) {
      throw new Error(
        `Error getting discount with producte: ${(error as Error).message}`,
      );
    }
  }

  async getByStripeCouponId(stripeCouponId: string) {
    try {
      const args: Prisma.DiscountFindFirstOrThrowArgs = {
        where: {
          stripeCouponId,
        },
      };

      const query = await this.prisma.discount.findFirst(args);

      return query;
    } catch (error) {
      throw new Error(
        `Error getting discount with stripeCouponId: ${(error as Error).message}`,
      );
    }
  }
  async create(
    userId: string,
    values: Omit<Prisma.DiscountCreateInput, "store">,
  ) {
    try {
      const store = await storeService.getActiveStore(userId);

      if (!store) {
        throw new Error("there is no active store. please create one.");
      }

      if (values.code) {
        const exists = await this.getByCodeAndStore(values.code, store.id);

        if (exists) {
          throw new Error("discount with this code already exits.");
        }
      }

      if (values.discountProducts) {
        for (const productId in values.discountProducts) {
          const exists = await productService.getProduct(productId);

          if (!exists) {
            throw new Error("product does not exits with this id.");
          }
        }
      }

      const newValues: Prisma.DiscountCreateArgs = {
        data: {
          ...values,
          store: {
            connect: {
              id: store.id,
            },
          },
        },
      };

      let params: Stripe.CouponCreateParams = {
        name: values.name,
      };

      if (values.maxRedemptions) {
        params.max_redemptions = values.maxRedemptions;
      }

      if (values.endsAt) {
        params.redeem_by = Math.floor(new Date(values.endsAt).getTime() / 1000);
      }

      if (values.durationInMonths) {
        params.duration_in_months = values.durationInMonths;
      }

      const stripeCoupen = await stripeService.createCoupon(params);

      if (stripeCoupen) {
        newValues["data"].stripeCouponId = stripeCoupen.id;
      } else {
        throw new Error("cannot create stripe coupen");
      }

      const query = await this.prisma.discount.create(newValues);

      return query;
    } catch (error) {
      throw new Error(`Error creating discount: ${(error as Error).message}`);
    }
  }

  async delete(id: string) {
    try {
      return this.prisma.$transaction(async (ctx) => {
        const coupen = await this.prisma.discount.findFirst({
          where: {
            id,
          },
        });

        if (!coupen) {
          throw new Error("cannot find coupen.");
        }

        await stripeService.deleteCoupen(coupen?.stripeCouponId);

        await this.prisma.discount.delete({
          where: {
            id: coupen.id,
          },
        });
      });
    } catch (error) {
      throw new Error(`Error deleting discount: ${(error as Error).message}`);
    }
  }

  private async isRedeemAbleDiscount(discount: Discount) {
    if (discount.startsAt && discount.startsAt > new Date(Date.now())) {
      return false;
    }

    if (discount.endsAt && discount.endsAt < new Date(Date.now())) {
      return false;
    }

    if (discount.maxRedemptions) {
      const redemptions = await this.prisma.discountRedemption.count({
        where: {
          discountId: discount.id,
        },
      });

      return discount.maxRedemptions < redemptions;
    }

    return true;
  }
}
