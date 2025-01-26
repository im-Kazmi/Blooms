import { client } from "@repo/api/client";
import type { InferRequestType, InferResponseType } from "@repo/api/index";
import { useMutation, useQueryClient } from "@repo/react-query";

type ResponseType = InferResponseType<typeof client.api.stores.$post, 200>;
type RequestType = InferRequestType<typeof client.api.stores.$post>["json"];

export const useCreateStore = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.stores.$post({
        json: json,
      });

      if (!res.ok) {
        throw new Error("cannot create store!");
      }

      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-stores"] });
    },
    onError: () => {},
  });

  return mutation;
};
