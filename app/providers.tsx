"use client";

import React from "react";
import { SWRConfig } from "@/hooks/swr/swrConfig";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig>
      <TooltipProvider delayDuration={50}>{children}</TooltipProvider>
    </SWRConfig>
  );
}
