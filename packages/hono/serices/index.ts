import { Dependency } from '@/helpers/dependency';
import { ProductService } from '@/serices/product';
import { StripeService } from '@/serices/stripe';
import { UserService } from '@/serices/user';
import { StoreService } from './store';

export const userService = new Dependency(
  (c, prisma, auth) => new UserService(prisma)
);

export const stripeService = new Dependency(
  (c, prisma, auth) => new StripeService(prisma)
);

export const productService = new Dependency(
  (c, prisma, auth) => new ProductService(prisma)
);

export const storeService = new Dependency(
  (c, prisma, auth) => new StoreService(prisma)
);
