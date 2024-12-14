import type { ClerkAuth } from "@/types";
import { PrismaClient, prisma } from "@repo/database";

export class BaseService {
  constructor(protected prisma: PrismaClient) {}

  protected getAuth(auth: ClerkAuth) {
    return auth;
  }
}
