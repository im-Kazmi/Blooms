import { productService } from "@/serices";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Product } from "@repo/database";
import {
  sortingAndPaginationSchema,
  createProductSchema,
  ProductPriceAmountType,
} from "@repo/types/";
import { z } from "zod";
import { clerkMiddleware } from "@hono/clerk-auth";

const app = new Hono()
  .use(productService.middleware("productService"))
  .use(clerkMiddleware())
  .get("/list", zValidator("param", sortingAndPaginationSchema), async (c) => {
    const productService = c.var.productService;

    const { page, sortBy, pageSize, sortOrder } = c.req.valid("param");

    const products = await productService.listProducts({
      page: page ? parseInt(page!, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      sortBy: sortBy ? (sortBy as keyof Product) : "createdAt",
      sortOrder: sortOrder ? sortOrder : "desc",
    });

    return c.json(products);
  })
  .get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid("param");
    const productService = c.var.productService;

    const product = await productService.getProduct(id);
    return c.json(product);
  })
  .post("/", zValidator("json", createProductSchema), async (c) => {
    const productService = c.get("productService");

    const auth = c.get("clerkAuth");

    if (!auth || !auth.userId) {
      return c.json("unauthorized", 400);
    }

    const { name } = c.req.valid("json");

    const products = await productService.createProduct({
      user: {
        connect: {
          clerkId: auth.userId,
        },
      },
      name,
      medias: [{ fileId: "asdfsdf", order: 34, id: "a343" }],
      prices: [
        {
          type: "recurring",
          priceAmount: 3434,
          priceCurrency: "usd",
        },
      ],
      customFields: [
        {
          order: 3,
          id: "Asdf",
        },
      ],
    });
  });

export default app;
