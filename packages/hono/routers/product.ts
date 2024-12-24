import { productService } from '@/serices';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

export const sortingAndPaginationSchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  sortBy: z.string(),
  sortOrder: z.enum(['asc', 'desc']),
});

const app = new Hono()
  .use(clerkMiddleware())
  .use(productService.middleware('productService'))
  .get(
    '/list',
    zValidator('query', sortingAndPaginationSchema),
    zValidator('param', z.object({ storeId: z.string() })),
    async (c) => {
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json(
          {
            message: 'You are not logged in.',
          },
          400
        );
      }

      const productService = c.var.productService;

      const { page, sortBy, pageSize, sortOrder } = c.req.valid('query');
      const { storeId } = c.req.valid('param');

      // const products = await productService.listProducts(
      //   {
      //     page: page ? Number.parseInt(page, 10) : 1,
      //     pageSize: pageSize ? Number.parseInt(pageSize, 10) : 10,
      //     sortBy: sortBy ? (sortBy as keyof Product) : 'createdAt',
      //     sortOrder: sortOrder ? sortOrder : 'desc',
      //   },
      //   storeId
      // );

      const products = await productService.listProducts({}, storeId);
      return c.json(products, 200);
    }
  )
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const productService = c.var.productService;

    const product = await productService.getProduct(id);
    return c.json(product);
  })
  .post('/', zValidator('json', createProductSchema), async (c) => {
    const productService = c.get('productService');

    const { name } = c.req.valid('json');

    // const products = await productService.createProduct({
    //   user: {
    //     connect: {
    //       clerkId: auth.userId,
    //     },
    //   },
    //   name,
    //   medias: [{ fileId: "asdfsdf", order: 34, id: "a343" }],
    //   prices: [
    //     {
    //       type: "recurring",
    //       priceAmount: 3434,
    //       priceCurrency: "usd",
    //     },
    //   ],
    //   customFields: [
    //     {
    //       order: 3,
    //       id: "Asdf",
    //     },
    //   ],
    // });
  });

export default app;
