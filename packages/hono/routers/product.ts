import { productService } from "@/serices";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Product } from "@repo/database";
import { sortingAndPaginationSchema } from "@repo/types";

const app = new Hono()
  .use(productService.middleware("productService"))
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
  .post(async (c) => {
    const productService = c.get("productService");

    const products = await productService.createProduct({});
  });
