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

import { Dependency } from "@/helpers/dependency";
import { OrgService } from "@/serices/org";
import { UserService } from "@/serices/user";

const userService = new Dependency(
  (c, prisma, auth) => new UserService(prisma),
);
const orgService = new Dependency((c, prisma, auth) => new OrgService(prisma));

const app = new Hono<{ Bindings: Bindings }>()
  .use(orgService.middleware("orgService"))
  .use(userService.middleware("userService"))
  .post("/clerk", async (c) => {
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

    const orgService = c.get("orgService");
    const userService = c.get("userService");
    // Get the ID and type
    const { id } = event.data;
    const eventType = event.type;

    let response;
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, image_url, first_name, last_name } =
          event.data;
        response = userService.createUser({
          clerkId: id,
          email: email_addresses[0].email_address,
          avatarUrl: image_url ?? null,
          name: `${first_name}${last_name ? ` ${last_name}` : ""}`,
        });
        break;
      }
      case "user.updated": {
        const { id, email_addresses, image_url, first_name, last_name } =
          event.data;
        response = userService.updateUser(id, {
          email: email_addresses[0].email_address,
          avatarUrl: image_url ?? null,
          name: `${first_name}${last_name ? ` ${last_name}` : ""}`,
        });
        break;
      }
      case "user.deleted": {
        const { id } = event.data;
        response = userService.deleteUser(id);
        break;
      }
      case "organization.created": {
        const {
          name,
          slug,
          has_image,
          image_url,
          members_count,
          updated_at,
          created_by,
          admin_delete_enabled,
          public_metadata,
          id,
          max_allowed_memberships,
        } = event.data;

        response = orgService.createOrg({
          name,
          slug,
          createdBy: created_by ?? null,
          membersCount: members_count ?? null,
          avatarUrl: image_url ?? null,
        });
        break;
      }
      case "organization.updated": {
        const {
          name,
          slug,
          has_image,
          image_url,
          members_count,
          admin_delete_enabled,
          public_metadata,
          id,
          max_allowed_memberships,
        } = event.data;

        response = orgService.updateOrg(id, {
          name,
          slug,
          avatarUrl: image_url ?? null,
        });
        break;
      }
      case "organizationMembership.created": {
        const { organization, permissions, role } = event.data;

        // response = handleOrganizationMembershipCreated(event.data);
        break;
      }
      case "organizationMembership.deleted": {
        const {} = event.data;
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
