import { client } from '@/client';
import type { InferResponseType } from '@repo/hono';
import { useQuery } from '@repo/react-query';
type ResponseType = InferResponseType<
  (typeof client.api.products)[':id']['$get'],
  200
>;

export const useGetProduct = (id: string) => {
  const query = useQuery<ResponseType, Error>({
    enabled: !!id,
    queryKey: ['get-products', { id }],
    queryFn: async () => {
      const res = await client.api.products[':id'].$get({
        param: {
          id,
        },
      });

      if (!res.ok) {
        throw new Error('error getting product!');
      }

      const data = await res.json();

      return data;
    },
  });

  return query;
};
