// 'use client';

// import DashboardHeader from '@/app/(authenticated)/components/dashboard-header';

// export default function page() {
//   return (
//     <div>
//       <DashboardHeader title="Create Product"></DashboardHeader>
//     </div>
//   );
// }

'use client';

import {} from 'framer-motion';
import {} from 'lucide-react';

import { CreatePriceForm } from '@/app/(authenticated)/components/forms/create-price-form';
import { ShadowWrapper } from '@/app/(authenticated)/components/shadow-wrapper';
import {} from '@repo/design-system/components/ui/avatar';
import {} from '@repo/design-system/components/ui/tooltip';
import {} from '../../../../components/expandable-card';

export default function page() {
  return (
    <ShadowWrapper>
      <CreatePriceForm />
    </ShadowWrapper>
  );
}
