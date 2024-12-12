import { auth } from "@repo/auth/server";
import { env } from "@repo/env";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { AvatarStack } from "./components/avatar-stack";
import { Cursors } from "./components/cursors";
import { Header } from "./components/header";
import { type AppType } from "@repo/hono";
import { hc } from "@repo/hono";
import { prisma } from "@repo/database";
import { APP_NAME, APP_DESCRIPTION } from "@repo/config";

const { api } = hc<AppType>("http://localhost:8787");

const CollaborationProvider = dynamic(() =>
  import("./components/collaboration-provider").then(
    (mod) => mod.CollaborationProvider,
  ),
);

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

const App = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header pages={["Building Your Application"]} page="Data Fetching">
        {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        )}
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {/* {pages &&
            pages.map((page) => (
              <div
                key={page.id}
                className="aspect-video rounded-xl bg-muted/50"
              >
                {page.name}
              </div>
            ))} */}
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
};

export default App;
