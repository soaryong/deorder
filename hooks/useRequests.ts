import { useQuery } from "@tanstack/react-query";
import { RequestNetwork, Types } from "@requestnetwork/request-client.js";

export interface IRequestData {
  // Define the structure of request data if known.
  // Replace `any` with specific types as needed.
  [key: string]: any;
}

export default function useRequests(identityAddress: string | undefined) {
  return useQuery<IRequestData[]>({
    queryKey: [`requests`],
    queryFn: async (): Promise<IRequestData[]> => {
      if (identityAddress === undefined) {
        return [];
      }
      const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: "https://sepolia.gateway.request.network/",
        },
      });

      const requests = await requestClient.fromIdentity({
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: identityAddress,
      });

      const requestDatas = await Promise.all(
        requests.map((request) => request.getData())
      );

      return requestDatas;
    },
    enabled: !!identityAddress, // Ensures the query runs only when identityAddress is available
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });
}
