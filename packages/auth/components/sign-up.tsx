import { SignUp as ClerkSignUp } from '@clerk/nextjs';

export const SignUp = () => (
  <ClerkSignUp
    forceRedirectUrl="/onboarding"
    appearance={{
      elements: {
        header: 'hidden',
      },
    }}
  />
);
