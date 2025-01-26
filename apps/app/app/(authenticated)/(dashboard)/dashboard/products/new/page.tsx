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
        <div className="flex flex-col bg-muted/50 rounded-t-xl ">
          <div className="flex flex-col px-5 py-3 ">
            <h1 className="text-md ">let's create a product</h1>
          </div>
          <CreateProductForm />
        </div>
      </div>
      <div className="bg-[#fafafb]"></div>
    </div>
  );
}
