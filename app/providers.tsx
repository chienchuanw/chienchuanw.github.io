'use client';

import React from 'react';
import { SWRConfig } from '@/hooks/swr/swrConfig';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig>
      {children}
    </SWRConfig>
  );
}
