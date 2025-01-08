import "@repo/design-system/styles/globals.css";
import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";
import { QueryProvider } from "@repo/react-query/providers/query-provider";
import type { ReactNode } from "react";
import DialogProvider from "./providers/dialog-provider";
type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html lang="en" className={fonts} suppressHydrationWarning>
    <QueryProvider>
      <body>
        <DesignSystemProvider>
          <DialogProvider />
          {children}
        </DesignSystemProvider>
      </body>
    </QueryProvider>
  </html>
);

export default RootLayout;
