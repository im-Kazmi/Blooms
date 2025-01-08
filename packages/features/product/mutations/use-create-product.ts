import { client } from "@repo/hono/client";
import type { InferRequestType, InferResponseType } from "@repo/hono";
import { useMutation, useQueryClient } from "@repo/react-query";

type ResponseType = InferResponseType<typeof client.api.products.$post, 200>;
type RequestType = InferRequestType<typeof client.api.products.$post>["json"];

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.products.$post({
        json: json,
      });

      if (!res.ok) {
        throw new Error("cannot create product!");
      }

      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {},
  });

  return mutation;
};
