import { client } from "@repo/api/client";
import type { InferResponseType } from "@repo/api/index";
import { useQuery } from "@repo/react-query";
type ResponseType = InferResponseType<
  (typeof client.api.stores)[":id"]["$get"],
  200
>;

export const useGetStore = (id: string) => {
  const query = useQuery<ResponseType, Error>({
    enabled: !!id,
    queryKey: ["get-stores", { id }],
    queryFn: async () => {
      const res = await client.api.stores[":id"].$get({
        param: {
          id,
        },
      });

      if (!res.ok) {
        throw new Error("error getting store!");
      }

      const data = await res.json();

      return data;
    },
  });

  return query;
};
