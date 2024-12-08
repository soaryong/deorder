import pb from "@/api/pocketbase";
import { IOrderProps } from "@/types/order";
import { useQuery } from "@tanstack/react-query";

export default function useOrder(id: string | undefined) {
  return useQuery<IOrderProps | null>({
    queryKey: [`orders_${id}`],
    queryFn: async (): Promise<IOrderProps | null> => {
      if (id) {
        const order = await pb.collection("order").getOne<IOrderProps>(id);
        return order;
      } else {
        return null;
      }
    },
  });
}
