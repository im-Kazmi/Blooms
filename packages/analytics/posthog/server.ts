import 'server-only';
import { env } from '@repo/env';
import { PostHog } from 'posthog-node';

export const analytics = new PostHog('ADFASDFSADF', {
  host: 'https://adfkjsadf.com',

  // Don't batch events and flush immediately - we're running in a serverless environment
  flushAt: 1,
  flushInterval: 0,
});
