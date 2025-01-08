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

const userService = new UserService(prisma);

export class CheckoutService extends BaseService {
  listStores(
    storeId: string,
    productId: string,
    params: PaginationParams &
      SortingParams<keyof Prisma.StoreOrderByWithRelationInput>,
  ) {
    const { skip, take } = QueryUtils.getPaginationParams(params);
    const orderBy = QueryUtils.getSortingParams(params);

    let args: Prisma.CheckoutFindManyArgs = {
      skip,
      take,
      orderBy,
    };

    if (productId) {
      args = {
        ...args,
        where: {
          productId,
        },
      };
    }

    if (storeId) {
      args = {
        ...args,
        where: {
          storeId,
        },
      };
    }

    const query = this.prisma.checkout.findMany(args);

    return QueryUtils.paginateQuery(query, this.prisma.checkout, params);
  }
}