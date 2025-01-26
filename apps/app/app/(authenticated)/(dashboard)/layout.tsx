"use client";
import { useOnboardingDialog } from "@/app/store/use-onboarding-dialog";
import { RedirectToSignIn, useUser } from "@repo/auth/client";
import { Button } from "@repo/design-system/components/ui/button";
import { SidebarProvider } from "@repo/design-system/components/ui/sidebar";
import { useGetStores } from "@repo/features/store/queries/use-get-stores";
import { type ReactNode, useEffect } from "react";
import { GlobalSidebar } from "../components/dashboard/sidebar";
import { OnBoardingDialog } from "../components/dialogs/onboarding-dialog";
import { usePathname } from "next/navigation";
type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProperties) => {
  const { user, isSignedIn } = useUser();

  const pathname = usePathname();

  const { onOpen } = useOnboardingDialog();

  const { data, isLoading } = useGetStores();

  if (!isSignedIn) {
    RedirectToSignIn({});
  }

  useEffect(() => {
    if (!isLoading && !data?.data) {
      onOpen();
    }
  }, [isLoading]);

  // we are hiding sidebar of new prod page
  if (pathname.includes("/products/new")) {
    return children;
  }
  return (
    <SidebarProvider>
      <GlobalSidebar>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted/50">
          <div className="min-h-[100vh]  flex-1 rounded-xl md:min-h-min p-5">
            {children}
          </div>
        </div>
      </GlobalSidebar>
    </SidebarProvider>
  );
};

export default AppLayout;
