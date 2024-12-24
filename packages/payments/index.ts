import { env } from "@repo/env";
import Stripe from "stripe";

export const stripe = new Stripe('asdfsdfasdf', {
  apiVersion: "2024-11-20.acacia",
});

export type { Stripe } from "stripe";
