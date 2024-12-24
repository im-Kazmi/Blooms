import { Input } from '@repo/design-system/components/ui/input';
import type React from 'react';

type Props = React.ComponentProps<typeof Input>;

export function PriceInput(props: Props) {
  return (
    <div className="space-y-2">
      <div className="relative flex rounded-lg shadow-sm shadow-black/5">
        <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground">
          $
        </span>
        <Input {...props} />
        <span className="-z-10 inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-sm text-muted-foreground">
          USD
        </span>
      </div>
    </div>
  );
}
