import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: ['http://localhost:3000', '*'],
  allowHeaders: ['*'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PUT', 'PATCH'],
  maxAge: 600,
  credentials: true,
});
