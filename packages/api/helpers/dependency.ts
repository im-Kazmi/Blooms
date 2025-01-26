import type { Context, MiddlewareHandler } from "hono";
import type { ClerkAuth, MaybePromise, Scope } from "@/types";
import { PrismaClient, prisma } from "@repo/database";
import { getAuth } from "@hono/clerk-auth";

export class Dependency<Service> {
  private static prisma: PrismaClient;

  constructor(
    private serviceInitializer: (
      c: Context,
      prisma: PrismaClient,
      auth: ClerkAuth,
    ) => MaybePromise<Service>,
    private opts?: {
      scope?: Scope;
    },
  ) {
    if (!Dependency.prisma) {
      Dependency.prisma = prisma;
    }
  }

  private serviceInjected?: Service;
  private serviceCached?: Service;
  private lastRequest?: Request;

  injection(service: Service): this {
    this.serviceInjected = service;
    return this;
  }

  clearInjected(): this {
    this.serviceInjected = undefined;
    return this;
  }

  async resolve(c: Context): Promise<Service> {
    if (this.serviceInjected) {
      return this.serviceInjected;
    }

    if (this.opts?.scope === "request" && this.lastRequest !== c.req.raw) {
      this.serviceCached = undefined;
      this.lastRequest = c.req.raw;
    }

    const auth = getAuth(c);
    const service = (this.serviceCached ??= await this.serviceInitializer(
      c,
      Dependency.prisma,
      auth,
    ));

    return service;
  }

  middleware<ContextKey extends string>(
    contextKey: ContextKey,
  ): MiddlewareHandler<{
    Variables: {
      [key in ContextKey]: Service;
    };
  }> {
    return async (c, next) => {
      const service = await this.resolve(c);
      c.set(contextKey, service);
      await next();
    };
  }
}
