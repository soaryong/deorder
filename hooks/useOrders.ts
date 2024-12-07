import pb from "@/api/pocketbase";
import { IOrderProps } from "@/types/order";
import { useQuery } from "@tanstack/react-query";

export default function useOrders() {
  return useQuery<IOrderProps[]>({
    queryKey: [`orders`],
    queryFn: async (): Promise<IOrderProps[]> => {
      const { items } = await pb
        .collection("order")
        .getList<IOrderProps>(1, 100, {
          sort: "-created",
        });

      return items;
    },
  });
}
