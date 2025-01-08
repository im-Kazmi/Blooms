import { productService, storeService } from "../serices";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

export const sortingAndPaginationSchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  prices: z
    .array(
      z.object({
        type: z.enum(["one_time", "recurring"]),
        recurringInterval: z.enum(["month", "year"]).optional(),
        amountType: z.enum(["fixed", "custom", "free"]),
        amount: z.number().min(0).optional(),
        minimumAmount: z.number().min(0).optional(),
        maximumAmount: z.number().min(0).optional(),
        presetAmount: z.number().min(0).optional(),
      }),
    )
    .min(1, {
      message: "At least one price must be added.",
    }),
});

const app = new Hono()
  .use(clerkMiddleware())
  .use(productService.middleware("productService"))
  .use(storeService.middleware("storeService"))
  .get("/list", zValidator("query", sortingAndPaginationSchema), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json(
        {
          message: "You are not logged in.",
        },
        400,
      );
    }

    const productService = c.var.productService;
    const storeService = c.get("storeService");

    const { page, sortBy, pageSize, sortOrder } = c.req.valid("query");

    const store = await storeService.getActiveStore(auth.userId);

    if (!store) {
      return c.json(
        {
          message: "No active store found.",
        },
        400,
      );
    }
    // const products = await productService.listProducts(
    //   {
    //     page: page ? Number.parseInt(page, 10) : 1,
    //     pageSize: pageSize ? Number.parseInt(pageSize, 10) : 10,
    //     sortBy: sortBy ? (sortBy as keyof Product) : 'createdAt',
    //     sortOrder: sortOrder ? sortOrder : 'desc',
    //   },
    //   storeId
    // );

    const products = await productService.listProducts({}, store.id);
    return c.json(products, 200);
  })
  .get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid("param");
    const productService = c.var.productService;

    const product = await productService.getProduct(id);
    return c.json(product);
  })
  .post("/", zValidator("json", createProductSchema), async (c) => {
    const productService = c.get("productService");
    const storeService = c.get("storeService");

    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json(
        {
          message: "You are not logged in.",
        },
        400,
      );
    }

    const values = c.req.valid("json");

    const store = await storeService.getActiveStore(auth.userId);

    if (!store) {
      return c.json(
        {
          message: "No active store found.",
        },
        400,
      );
    }

    const products = await productService.createProduct(store.id, values);

    return c.json(products, 200);
  });

export default app;
