import { z } from "zod";

export const sortingAndPaginationSchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const createProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  sortBy: z.string(),
  sortOrder: z.enum(["asc", "desc"]),
});
