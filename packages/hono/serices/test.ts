import { prisma } from "@repo/database";
import { BaseService } from "./base-service";

export class TestService extends BaseService {
  justTest() {
    const prods = this.prisma.product.findMany();
    return prods;
  }
  async getData() {
    const data = await prisma.product.findMany();

    return data;
  }
}
