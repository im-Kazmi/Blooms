import {
  type PaginatedResult,
  type PaginationParams,
  QueryUtils,
  type SortingParams,
} from "@/utils/query";
import { type Prisma, type Store, prisma } from "@repo/database";
import { BaseService } from "./base-service";
export class StoreService extends BaseService {
  listStores(
    params: PaginationParams &
      SortingParams<keyof Prisma.StoreOrderByWithRelationInput>,
    userId: string,
  ): Promise<PaginatedResult<Store>> {
    const { skip, take } = QueryUtils.getPaginationParams(params);
    const orderBy = QueryUtils.getSortingParams(params);

    const query = this.prisma.store.findMany({
      skip,
      take,
      orderBy,
      where: {
        userId,
      },
    });

    return QueryUtils.paginateQuery(query, this.prisma.store, params);
  }

  async getStore(id: string, userId: string) {
    try {
      const query = await this.prisma.store.findUnique({
        where: { id, userId },
      });

      return query;
    } catch (error) {
      throw new Error(`Error fetching store: ${(error as Error).message}`);
    }
  }

  async getActiveStore(userId: string) {
    try {
      const query = await prisma.store.findFirst({
        where: {
          active: true,
          userId,
        },
      });

      return query;
    } catch (error) {
      throw new Error(
        `Error fetching active store: ${(error as Error).message}`,
      );
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

  async updateStore(id: string, data: Prisma.StoreUpdateInput): Promise<Store> {
    try {
      const store = await this.prisma.store.update({
        where: { id },
        data,
      });

      return store;
    } catch (error) {
      throw new Error(`Error updating store: ${(error as Error).message}`);
    }
  }

  async deleteStore(id: string): Promise<Store> {
    try {
      const store = await this.prisma.store.delete({
        where: { id },
      });

      return store;
    } catch (error) {
      throw new Error(`Error deleting store: ${(error as Error).message}`);
    }
  }
}
