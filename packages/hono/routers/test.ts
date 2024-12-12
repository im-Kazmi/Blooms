import { Dependency } from "../helpers/dependency";
import { TestService } from "../serices/test";

const testService = new Dependency(
  (c, prisma, auth) => new TestService(prisma),
);

import { Hono } from "hono";

export default new Hono()
  .use(testService.middleware("testService"))
  .get("/", async (c) => {
    const { testService } = c.var;

    const msg = testService.justTest();
    return c.json(msg, 200);
  })
  .get("/data", async (c) => {
    const { testService } = c.var;

    const data = testService.getData();
    return c.json(data, 200);
  });
