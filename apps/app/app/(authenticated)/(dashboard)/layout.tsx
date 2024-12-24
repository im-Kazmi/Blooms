'use client';
import { useOnboardingDialog } from '@/app/store/use-onboarding-dialog';
import { RedirectToSignIn, useUser } from '@repo/auth/client';
import { Button } from '@repo/design-system/components/ui/button';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { useGetStores } from '@repo/features/store/queries/use-get-stores';
import type { ReactNode } from 'react';
import { GlobalSidebar } from '../components/dashboard/sidebar';
import { OnBoardingDialog } from '../components/dialogs/onboarding-dialog';
type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProperties) => {
  const { user, isSignedIn } = useUser();

  const { onOpen } = useOnboardingDialog();

  const { data, isLoading } = useGetStores();

  if (!isSignedIn) {
    RedirectToSignIn({});
  }

  return (
    <SidebarProvider>
      <GlobalSidebar>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted/50">
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min p-5">
            <OnBoardingDialog />
            <Button onClick={onOpen}>open</Button>
            {children}
          </div>
        </div>
      </GlobalSidebar>
    </SidebarProvider>
  );
};

export default AppLayout;
