import { Dependency } from "@/helpers/dependency";
import { ProductService } from "@/serices/product";
import { StripeService } from "@/serices/stripe";
import { UserService } from "@/serices/user";
import { StoreService } from "./store";
import { prisma } from "@repo/database";
import { CheckoutService } from "./checkout";

export const userService = new UserService(prisma);
export const stripeService = new StripeService(prisma);
export const productService = new ProductService(prisma);
export const storeService = new StoreService(prisma);
export const checkoutService = new CheckoutService(prisma);

export const userHonoService = new Dependency(
  (c, prisma, auth) => new UserService(prisma),
);

export const stripeHonoService = new Dependency(
  (c, prisma, auth) => new StripeService(prisma),
);

export const productHonoService = new Dependency(
  (c, prisma, auth) => new ProductService(prisma),
);

export const storeHonoService = new Dependency(
  (c, prisma, auth) => new StoreService(prisma),
);

export const checkoutHonoService = new Dependency(
  (c, prisma, auth) => new CheckoutService(prisma),
);
