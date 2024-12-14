import { prisma, Prisma, Product } from "@repo/database";
import { BaseService } from "./base-service";
import {
  QueryUtils,
  PaginationParams,
  SortingParams,
  PaginatedResult,
} from "@/utils/query";

export class ProductService extends BaseService {
  async listProducts(
    params: PaginationParams &
      SortingParams<keyof Prisma.ProductOrderByWithRelationInput>,
  ): Promise<PaginatedResult<Product>> {
    const { skip, take } = QueryUtils.getPaginationParams(params);
    const orderBy = QueryUtils.getSortingParams(params);

    const query = this.prisma.product.findMany({
      include: {
        prices: {
          where: {
            isArchived: false,
          },
        },
      },
      skip,
      take,
      orderBy,
    });

    return QueryUtils.paginateQuery(query, this.prisma.product, params);
  }

  async getProduct(id: string) {
    try {
      const query = this.prisma.product.findFirst({
        where: {
          id,
        },
        include: {
          prices: true,
          productMedias: true,
          productCustomFields: true,
        },
      });

      return query;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async getEmbed(id: string) {
    try {
      const query = this.prisma.product.findFirst({
        where: {
          id,
          isArchived: false,
        },
        include: {
          productMedias: true,
        },
      });

      return query;
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }

  async createProduct(values: Prisma.ProductCreateInput) {
    try {
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }
  async createProductInStripe(values: Prisma.ProductCreateInput) {
    try {
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }
  async createProductInOpenCollective(values: Prisma.ProductCreateInput) {
    try {
    } catch (error) {
      throw new Error(`Error creating product: ${(error as Error).message}`);
    }
  }
}
