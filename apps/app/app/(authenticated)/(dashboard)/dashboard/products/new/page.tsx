"use client";

import { CreateProductForm } from "@/app/(authenticated)/components/forms/create-product-form";
import { ShadowWrapper } from "@/app/(authenticated)/components/shadow-wrapper";
import {} from "@repo/design-system/components/ui/avatar";
import {} from "@repo/design-system/components/ui/tooltip";
import {} from "lucide-react";

export default function page() {
  return (
    // <ShadowWrapper>
    //   <CreateProductForm />
    // </ShadowWrapper>
    <div className="w-full h-full grid grid-cols-2 *:flex *:items-center *:justify-center  min-w-screen min-h-screen ">
      <div>
        <div className="flex flex-col bg-muted/50 rounded-t-xl p-0 border border- border-dotted border-2 ">
          <div className="flex flex-col  "></div>
          <CreateProductForm />
        </div>
      </div>
      <div className="bg-muted/50"></div>
    </div>
  );
}
