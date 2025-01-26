import {
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
import { ValidationService } from "./validation";

const userService = new UserService(prisma);
const validationService = new ValidationService();

export class CheckoutService extends BaseService {
  list(
    storeId: string,
    productId: string,
    params: PaginationParams &
      SortingParams<keyof Prisma.StoreOrderByWithRelationInput>,
  ) {
    const { skip, take } = QueryUtils.getPaginationParams(params);
    const orderBy = QueryUtils.getSortingParams(params);

    const args: Prisma.CheckoutFindManyArgs = {
      skip,
      take,
      orderBy,
      where: {
        ...(productId && { productId }),
        ...(storeId && { storeId }),
      },
    };

    const query = this.prisma.checkout.findMany(args);

    return QueryUtils.paginateQuery(query, this.prisma.checkout, params);
  }

  async getById(id: string) {
    try {
      const checkout = await this.prisma.checkout.findFirst({
        where: { id },
        include: { Customer: true },
      });

      if (!checkout) {
        throw new Error(`Checkout with ID "${id}" was not found.`);
      }

      return checkout;
    } catch (error) {
      throw new Error(`Error retrieving checkout: ${(error as Error).message}`);
    }
  }

  async create(
    storeId: string,
    values: { productId: string; productPriceId: string },
  ) {
    try {
      if (!storeId) {
        throw new Error("Store ID is required to create a checkout.");
      }

      const product = await validationService.getValidatedPrice(
        values.productId,
      );

      const price = await validationService.getValidatedPrice(
        values.productPriceId,
      );

      // const checkout = await this.prisma.checkout.create({
      //   data: {
      //     ...values,
      //     storeId,
      //   },
      // });

      // return checkout;
    } catch (error) {
      throw new Error(`Error creating checkout: ${(error as Error).message}`);
    }
  }
}
