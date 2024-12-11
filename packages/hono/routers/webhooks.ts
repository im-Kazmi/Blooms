import { analytics } from "@repo/analytics/posthog/server";
import type {
  DeletedObjectJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,
  WebhookEvent,
} from "@repo/auth/server";
import { env } from "@repo/env";
import { log } from "@repo/observability/log";
import { Webhook } from "svix";
import { Hono } from "hono";

type Bindings = {
  CLERK_WEBHOOK_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>().post("/clerk", async (c) => {
  if (!c.env.CLERK_WEBHOOK_SECRET) {
    return c.json({ message: "Not configured" }, 400);
  }

  const headerPayload = c.req.header();
  const svixId = headerPayload["svix-id"];
  const svixTimestamp = headerPayload["svix-timestamp"];
  const svixSignature = headerPayload["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json("Error occured -- no svix headers", 400);
  }

  const body = await c.req.json();

  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let event: WebhookEvent | undefined;

  // Verify the payload with the headers
  try {
    event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    log.error("Error verifying webhook:", { error });
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = event.data;
  const eventType = event.type;

  switch (eventType) {
    case "user.created": {
      // response = handleUserCreated(event.data);
      break;
    }
    case "user.updated": {
      // response = handleUserUpdated(event.data);
      break;
    }
    case "user.deleted": {
      // response = handleUserDeleted(event.data);
      break;
    }
    case "organization.created": {
      // response = handleOrganizationCreated(event.data);
      break;
    }
    case "organization.updated": {
      // response = handleOrganizationUpdated(event.data);
      break;
    }
    case "organizationMembership.created": {
      const { organization } = event.data;

      // response = handleOrganizationMembershipCreated(event.data);
      break;
    }
    case "organizationMembership.deleted": {
      // response = handleOrganizationMembershipDeleted(event.data);
      break;
    }
    default: {
      break;
    }
  }

  return c.json("Everything is perfect. webhook successuly handled.", 200);
});

export default app;
