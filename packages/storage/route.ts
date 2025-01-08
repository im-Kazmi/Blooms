import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

export const nextRouter: any = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
