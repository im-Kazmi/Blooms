import { client } from "@repo/api/client";
import type { InferRequestType } from "@repo/api/index";
import { useQuery } from "@repo/react-query";
import type { $Enums } from "../../../database";
// type ResponseType = InferResponseType<
//   typeof client.api.products.list.$get,
//   200
// >;

// i just couldnt get typesafety with that approach on app

type ResponseType = {
  prices: {
    id: string;
    amountType: $Enums.ProductPriceAmountType;
  }[];
  storeId: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  stripeProductId: string | null;
}[];

type RequestType = InferRequestType<typeof client.api.products.list.$get>;

export const useGetProducts = (values: RequestType) => {
  const query = useQuery<ResponseType, Error>({
    queryKey: ["get-products", {}],
    queryFn: async () => {
      const res = await client.api.products.list.$get({
        query: values?.query,
      });

      if (!res.ok) {
        throw new Error("error getting products!");
      }

      const data = await res.json();

      return data;
    },
  });

  return query;
};
