import { storeService } from '@/serices';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import type { Store } from '@repo/database';
import { Hono } from 'hono';
import { z } from 'zod';

export const sortingAndPaginationSchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createStoreSchema = z.object({
  url: z.string(),
  name: z.string(),
  description: z.string().optional(),
  currency: z.string().default('USD'),
});

export const updateStoreSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().optional(),
});

export default new Hono()
  .use(clerkMiddleware())
  .use(storeService.middleware('storeService'))
  .get('/', zValidator('query', sortingAndPaginationSchema), async (c) => {
    const storeService = c.var.storeService;

    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({
        message: 'You are not logged in.',
      });
    }

    const { page, sortBy, pageSize, sortOrder } = c.req.valid('query');

    const stores = await storeService.listStores(
      {
        page: page ? Number.parseInt(page, 10) : 1,
        pageSize: pageSize ? Number.parseInt(pageSize, 10) : 10,
        sortBy: sortBy ? (sortBy as keyof Store) : 'createdAt',
        sortOrder: sortOrder ? sortOrder : 'desc',
      },
      auth.userId
    );

    return c.json(stores, 200);
  })
  .post('/', zValidator('json', createStoreSchema), async (c) => {
    const storeService = c.var.storeService;
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({
        message: 'You are not logged in.',
      });
    }

    const { name, description, currency, url } = c.req.valid('json');

    const store = await storeService.createStore(
      {
        url,
        name,
        description,
        currency,
        user: {
          connect: {
            clerkId: auth.userId,
          },
        },
      },
      auth.userId
    );

    return c.json(store, 200);
  })
  .get('/active', async (c) => {
    const storeService = c.var.storeService;

    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json(
        {
          message: 'You are not logged in.',
        },
        400
      );
    }

    const store = await storeService.getActiveStore(auth.userId);

    return c.json(store, 200);
  })

  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const storeService = c.var.storeService;

    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({
        message: 'You are not logged in.',
      });
    }

    const store = await storeService.getStore(id, auth.userId);
    if (!store) {
      return c.json({ error: 'Store not found' }, 404);
    }
    return c.json(store);
  })

  .patch('/:id', zValidator('json', updateStoreSchema), async (c) => {
    const { id } = c.req.param();
    const storeService = c.var.storeService;
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({
        message: 'You are not logged in.',
      });
    }

    const updateData = c.req.valid('json');

    const store = await storeService.updateStore(id, updateData);

    return c.json(store);
  })
  .delete('/:id', async (c) => {
    const { id } = c.req.param();
    const storeService = c.var.storeService;
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({
        message: 'You are not logged in.',
      });
    }

    const store = await storeService.deleteStore(id);

    return c.json(store);
  });
