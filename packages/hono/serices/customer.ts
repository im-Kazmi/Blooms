import {
  type PaginatedResult,
  type PaginationParams,
  QueryUtils,
  type SortingParams,
} from "@/utils/query";
import { Customer, type Prisma, type Store, prisma } from "@repo/database";
import { BaseService } from "./base-service";

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

  async getCustomer(id: string, userId: string) {
    try {
      const query = await this.prisma.store.findUnique({
        where: { id, userId },
      });

      return query;
    } catch (error) {
      throw new Error(`Error fetching store: ${(error as Error).message}`);
    }
  }

  async createStore(
    data: Prisma.StoreCreateInput,
    userId: string,
  ): Promise<Store> {
    try {
      await this.prisma.store.updateMany({
        where: {
          userId,
          active: true,
        },
        data: {
          active: false,
        },
      });

      return await this.prisma.store.create({
        data,
      });
    } catch (error) {
      throw new Error(`Error creating store: ${(error as Error).message}`);
    }
  }
}
