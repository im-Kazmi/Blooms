import { prisma, Prisma } from "@repo/database";
import { BaseService } from "./base-service";
import { stripe } from "@repo/payments";

export class ProductService extends BaseService {
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
