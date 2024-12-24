import { parseAsBoolean, parseAsInteger, parseAsString } from 'nuqs';

export const URLStateConfig = {
  page: {
    parser: parseAsInteger,
  },
  search: {
    parser: parseAsString,
  },
  isActive: {
    parser: parseAsBoolean,
  },
} as const;

export type URLStateConfig = typeof URLStateConfig;
