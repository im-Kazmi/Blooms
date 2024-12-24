'use client';

import type { ReactNode } from 'react';

export function ShadowWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 rounded-lg sm:rounded-xl md:rounded-[2rem] p-1 sm:p-1.5 md:p-2 shadow-md shadow-black/5">
      <div className="rounded-md sm:rounded-lg md:rounded-3xl p-2 sm:p-3 md:p-4 shadow-xl ring-1 ring-black/5 bg-white/40">
        <div className="w-full h-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
