import { getIp } from "@/helpers/get-ip";
import { rateLimiter } from "hono-rate-limiter";

export const limiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: async (c) => {
    const ip = getIp(c);
    return ip!;
  },
});
