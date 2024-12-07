import pb from "@/api/pocketbase";
import { IStoreProps } from "@/types/store";
import { useQuery } from "@tanstack/react-query";

export default function useStores() {
  return useQuery<IStoreProps[]>({
    queryKey: ["stores"],
    queryFn: async (): Promise<IStoreProps[]> => {
      const { items } = await pb
        .collection("deorder")
        .getList<IStoreProps>(1, 100, {
          sort: "-created",
        });

      return items;
    },
  });
}
