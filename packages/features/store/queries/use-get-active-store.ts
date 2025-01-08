import { client } from "@repo/hono/client";
import { useQuery } from "@repo/react-query";

type ResponseType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string | null;
  url: string;
  active: boolean;
  userId: string;
  currency: string;
} | null;

export const useGetActiveStore = () => {
  const query = useQuery<ResponseType>({
    queryKey: ["get-active-stores"],
    queryFn: async () => {
      const res = await client.api.stores.active.$get({});

      if (!res.ok) {
        throw new Error("error getting store!");
      }

      const data = await res.json();

      return data;
    },
  });

  return query;
};
