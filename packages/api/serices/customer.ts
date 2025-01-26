import {
  type PaginatedResult,
  type PaginationParams,
  QueryUtils,
  type SortingParams,
} from "@/utils/query";
import {
  Customer,
  type Prisma,
  type Store,
  User,
  prisma,
} from "@repo/database";
import { BaseService } from "./base-service";
import { stripeService } from ".";

export class CustomerService extends BaseService {
  list(
    params: PaginationParams & SortingParams<keyof Prisma.CustomerFindManyArgs>,
    storeId: string,
  ): Promise<PaginatedResult<Customer>> {
    const { skip, take } = QueryUtils.getPaginationParams(params);
    const orderBy = QueryUtils.getSortingParams(params);

    const query = this.prisma.customer.findMany({
      where: {
        OR: [
          { orders: { some: { product: { storeId: storeId } } } },
          { subscriptions: { some: { product: { storeId: storeId } } } },
          { checkouts: { some: { storeId: storeId } } },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orders: {
          where: {
            product: { storeId: storeId },
          },
          select: {
            id: true,
            createdAt: true,
            amount: true,
          },
        },
        subscriptions: {
          where: {
            product: { storeId: storeId },
          },
          select: {
            id: true,
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    return QueryUtils.paginateQuery(query, this.prisma.customer, params);
  }

  async getById(id: string) {
    try {
      const query = await this.prisma.customer.findUnique({
        where: { id },
      });

      return query;
    } catch (error) {
      throw new Error(`Error fetching customer: ${(error as Error).message}`);
    }
  }

  async linkUser(customer: Customer, user: User) {
    try {
      if (customer.userId) return;

      return await this.prisma.customer.update({
        where: {
          id: customer.id,
        },
        data: {
          user: {
            connect: {
              clerkId: user.clerkId,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(
        `Error linking customer to user: ${(error as Error).message}`,
      );
    }
  }

  async getOrCreateFromStripeCustomer(
    data: Prisma.StoreCreateInput,
    userId: string,
  ) {
    try {
    } catch (error) {
      throw new Error(`Error : ${(error as Error).message}`);
    }
  }
}
