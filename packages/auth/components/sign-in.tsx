import { SignIn as ClerkSignIn } from '@clerk/nextjs';

export const SignIn = ({
  fallbackRedirectUrl,
}: { fallbackRedirectUrl?: string }) => (
  <ClerkSignIn
    forceRedirectUrl={fallbackRedirectUrl || undefined}
    appearance={{
      elements: {
        header: 'hidden',
      },
    }}
  />
);
