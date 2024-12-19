import { client } from "@/api/client";
import { InferResponseType } from "@/api/index";
import { useQuery } from "@repo/react-query";
type ResponseType = InferResponseType<typeof client.api.products.$get, 200>;

export const useGetBoards = () => {
  const query = useQuery<ResponseType>({
    queryKey: ["get-products"],
    queryFn: async () => {
      const res = await client.api.products.$get();

      if (!res.ok) {
        throw new Error("error getting boards!");
      }

      const data = await res.json();

      return data;
    },
  });
};
