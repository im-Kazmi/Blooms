"use client";

import { CreateProductForm } from "@/app/(authenticated)/components/forms/create-product-form";
import { ShadowWrapper } from "@/app/(authenticated)/components/shadow-wrapper";
import {} from "@repo/design-system/components/ui/avatar";
import {} from "@repo/design-system/components/ui/tooltip";
import {} from "lucide-react";

export default function page() {
  return (
    <ShadowWrapper>
      <CreateProductForm />
    </ShadowWrapper>
  );
}
