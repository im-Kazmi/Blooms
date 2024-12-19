import { hc } from "hono/client";
import { type AppType } from ".";
export const client = hc<AppType>("http://localhost:8787/");
