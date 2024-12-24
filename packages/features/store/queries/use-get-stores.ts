import { client } from '@/client';
import type { InferResponseType } from '@repo/hono';
import { useQuery } from '@repo/react-query';
type ResponseType = InferResponseType<typeof client.api.stores.$get, 200>;

export const useGetStores = () => {
  const query = useQuery<ResponseType>({
    queryKey: ['get-stores'],
    queryFn: async () => {
      const res = await client.api.stores.$get({ query: {} });

      if (!res.ok) {
        throw new Error('error getting boards!');
      }

      const data = await res.json();

      return data;
    },
  });

  return query;
};
