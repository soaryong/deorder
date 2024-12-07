import pb from "@/api/pocketbase";
import { IStoreProps } from "@/types/store";
import { useQuery } from "@tanstack/react-query";

export default function useMyStore(id: string | undefined) {
  return useQuery<IStoreProps | null>({
    queryKey: [`stores_${id}`],
    queryFn: async (): Promise<IStoreProps | null> => {
      if (id) {
        const store = await pb
          .collection("orderwrap")
          .getFirstListItem<IStoreProps>(`owner="${id}"`);

        return store;
      } else {
        return null;
      }
    },
  });
}
