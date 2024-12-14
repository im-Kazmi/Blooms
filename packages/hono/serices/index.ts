import { Dependency } from "@/helpers/dependency";
import { OrgService } from "@/serices/org";
import { UserService } from "@/serices/user";
import { ProductService } from "@/serices/product";
import { StripeService } from "@/serices/stripe";

export const userService = new Dependency(
  (c, prisma, auth) => new UserService(prisma),
);

export const orgService = new Dependency(
  (c, prisma, auth) => new OrgService(prisma),
);

export const stripeService = new Dependency(
  (c, prisma, auth) => new StripeService(prisma),
);

export const productService = new Dependency(
  (c, prisma, auth) => new ProductService(prisma),
);
