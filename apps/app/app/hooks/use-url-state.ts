import { type Options, type UseQueryStateOptions, useQueryState } from 'nuqs';
import { useCallback } from 'react';
import type { URLStateConfig } from '../utils';

export function useUrlState<T extends keyof URLStateConfig>(
  key: T,
  options: Pick<UseQueryStateOptions<string>, keyof Options>
) {
  const [value, setValue] = useQueryState(key, options);

  const updateValue = useCallback(
    (newValue: string) => {
      setValue(newValue);
    },
    [setValue]
  );

  return [value, updateValue] as const;
}
