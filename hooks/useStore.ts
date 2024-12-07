import pb from "@/api/pocketbase";
import { IStoreProps } from "@/types/store";
import { useQuery } from "@tanstack/react-query";

export default function useStore(id: string | undefined) {
  return useQuery<IStoreProps | null>({
    queryKey: [`stores_${id}`],
    queryFn: async (): Promise<IStoreProps | null> => {
      if (id) {
        const store = await pb.collection("orderwrap").getOne<IStoreProps>(id);
        return store;
      } else {
        return null;
      }
    },
  });
}
