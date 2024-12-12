import { Dependency } from "../helpers/dependency";
import { UserService, UserService } from "../serices/user";

const userService = new Dependency(
  (c, prisma, auth) => new UserService(prisma),
);

import { Hono } from "hono";

export default new Hono()
  .use(userService.middleware("userService"))
  .get("/", async (c) => {
    const { userService } = c.var;

    const msg = userService.createUser();
    return c.json(msg, 200);
  })
  .get("/data", async (c) => {
    const { userService } = c.var;

    const data = userService.upda();
    return c.json(data, 200);
  });
