import { env } from "@repo/env";
import Stripe from "stripe";

// this is a wrong key dont try
export const stripe = new Stripe(
  "rk_test_51OKnuPLBCdaxkRfFuO8aJNKJIX27HZ7Xd5jZUGI0H0XG6c0dwtEdOLS3beAcgT1oiaFUybyMDvzOkziVoTFKr9Jl00QWTCGdCg",
  {
    apiVersion: "2024-11-20.acacia",
  },
);

export type { Stripe } from "stripe";
