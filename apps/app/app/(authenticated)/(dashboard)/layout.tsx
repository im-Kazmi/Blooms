import { client } from '@/api/client';
import { auth, currentUser } from '@repo/auth/server';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import type { ReactNode } from 'react';
import { GlobalSidebar } from '../components/dashboard/sidebar';
type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  const user = await currentUser();
  const { redirectToSignIn } = await auth();

  if (!user) {
    redirectToSignIn();
  }

  const res = await client.api.stores?.$get();

  const data = await res.json();
  // if (res.ok && data && !data.data?.length) {
  //   redirect('/onboarding');
  // }

  return (
    <SidebarProvider>
      <GlobalSidebar>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted/50">
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min p-5">
            {children}
          </div>
        </div>
      </GlobalSidebar>
    </SidebarProvider>
  );
};

export default AppLayout;
