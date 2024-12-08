"use client";
import pb from "@/api/pocketbase";
import { Button } from "@/components/ui/button";
import useStore from "@/hooks/useStore";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import {
  useAccount,
  useBalance,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  RequestNetwork,
  Types,
  Utils,
} from "@requestnetwork/request-client.js";
import {
  approveErc20,
  hasErc20Approval,
  hasSufficientFunds,
  payRequest,
} from "@requestnetwork/payment-processor";
import { useEthersV5Provider } from "@/hooks/use-ethers-v5-provider";
import { useEthersV5Signer } from "@/hooks/use-ethers-v5-signer";
import { initialize } from "zokrates-js";
import verificationKey from "@/zkp/verificationKey.json";
import useOrder from "@/hooks/useOrder";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { useRouter } from "next/navigation";
import { ellipsisAddress } from "@/utils/strings";
import useRequest from "@/hooks/useRequest";
export default function Home() {
  const router = useRouter();
  const FEE_ADDRSS = "0x2FCCba2f198066c5Ea3e414dD50F78E25c3aF552";
  const params = useParams();
  const { id } = params as { id: string };
  const { address, isConnected } = useAccount();
  const { data: order } = useOrder(id);
  const { data: store } = useStore(order?.store_id);
  const { data: balance } = useBalance({
    chainId: sepolia.id,
    token: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
    address: address,
  });
  const { data: walletClient } = useWalletClient();

  const provider = useEthersV5Provider();
  const signer = useEthersV5Signer();
  const { data: existRequest } = useRequest(order?.requestId);

  const { writeContract, isPending: isLoading } = useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        await pb.collection("order").update(order!.id, { state: "request" });
        alert("Request Success");
      },
      onError: (error) => {
        console.log(error);
      },
    },
  });

  const verifyProofClientSide = useCallback(
    async (verificationKey: any, proof: any) => {
      const zokratesProvider = await initialize();
      const isVerified = zokratesProvider.verify(verificationKey, proof);
      return isVerified;
    },
    []
  );

  const pay = useCallback(async () => {
    if (!order || !isConnected) {
      return;
    }

    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
    });

    const request = await requestClient.fromRequestId(order.requestId);

    let requestData = request.getData();
    const zkProof = requestData.contentData.zkProof;
    if (zkProof) {
      const result = await verifyProofClientSide(verificationKey, zkProof);
      if (!result) {
        alert("Proof Verification Failed");
        return;
      }
    }

    const _hasSufficientFunds = await hasSufficientFunds({
      request: requestData,
      address: address as string,
      providerOptions: {
        provider: provider,
      },
    });
    if (!_hasSufficientFunds) {
      alert("Insufficient Funds");
    }

    const _hasErc20Approval = await hasErc20Approval(
      requestData,
      address as string,
      provider
    );
    console.log(_hasErc20Approval);

    if (!_hasErc20Approval) {
      const approvalTx = await approveErc20(requestData, signer);
      await approvalTx.wait(2);
    }

    const paymentTx = await payRequest(requestData, signer);
    await paymentTx.wait(2);
    console.log(requestData);

    while ((requestData?.balance?.balance ?? 0) < requestData.expectedAmount) {
      requestData = await request.refresh();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await pb.collection("order").update(order!.id, { state: "complete" });
    alert("Pay Success");
  }, [writeContract, address, store]);

  const request = async () => {
    try {
      const web3SignatureProvider = new Web3SignatureProvider(walletClient);
      const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: "https://sepolia.gateway.request.network/",
        },
        signatureProvider: web3SignatureProvider,
      });

      const requestCreateParameters: Types.ICreateRequestParameters = {
        requestInfo: {
          currency: {
            type: Types.RequestLogic.CURRENCY.ERC20,
            value: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
            network: "sepolia" as Types.RequestLogic.ICurrency["network"],
          },
          expectedAmount: Number(order?.price).toFixed() || "0",
          payee: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: address || "",
          },
          payer: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: address || "",
          },
          timestamp: Utils.getCurrentTimestampInSecond(),
        },
        paymentNetwork: {
          id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
          parameters: {
            paymentNetworkName: "sepolia",
            paymentAddress: address,
            feeAddress: FEE_ADDRSS,
            feeAmount: "0",
          },
        },
        contentData: {
          name: store?.name,
          time: Date.now().toString(),
          price: order?.price,
          zkProof: JSON.parse(store?.zkProof ?? "{}"),
        },
        signer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: address as string,
        },
      };

      const request = await requestClient.createRequest(
        requestCreateParameters
      );
      await request.waitForConfirmation();

      console.log(request);

      await pb
        .collection("order")
        .update(order!.id, { state: "request", requestId: request.requestId });
      alert("Request Success");
      router.replace("/order/" + order?.id);
      router.refresh();
    } catch (error: any) {
      console.error(error);
    } finally {
    }
  };

  return (
    <>
      {order ? (
        <>
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Invoice</h1>
            <h1>Store: {store?.name}</h1>
            <h1>Price: ${order?.price}</h1>
            <h1>Customer: {ellipsisAddress(order?.customer)}</h1>
            <h1>Verified: {ellipsisAddress(order?.requestId)}</h1>

            {address !== store?.owner && order?.state === "request" && (
              <Button className="mt-3" onClick={pay}>
                Pay (Available: ${balance?.formatted ?? 0})
              </Button>
            )}

            {address === store?.owner && order?.state !== "request" && (
              <Button className="mt-3" onClick={request}>
                Request
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold mt-10">Menu</h1>
            <h1>Menu: {order?.menus.menu}</h1>
            <h1>Count: {order?.menus.count}</h1>
            <h1>Price: ${order?.menus.price}</h1>
            {order?.menus.menu2 && (
              <>
                <h1>Menu: {order?.menus.menu2}</h1>
                <h1>Count: {order?.menus.count2}</h1>
                <h1>Price: ${order?.menus.price2}</h1>
              </>
            )}
            <h1>Tip: {order?.menus.tip}</h1>
            <h1 className="font-bold">Total: ${order?.price}</h1>
          </div>
          {existRequest && (
            <div className="space-y-2">
              <h1 className="text-xl font-bold mt-10">Verify Info(Request)</h1>
              <div key={existRequest.id}>
                <h1>Request ID: {ellipsisAddress(existRequest.requestId)}</h1>
                <h1>Amount: {existRequest.requestData.expectedAmount}</h1>
                <h1>State: {existRequest.requestData.state}</h1>
                <h1>
                  Payer: {ellipsisAddress(existRequest.requestData.payer.value)}
                </h1>
                <h1>
                  Payee: {ellipsisAddress(existRequest.requestData.payee.value)}
                </h1>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h1 className="scroll-m-20 text-4xl mt-10 font-extrabold tracking-tight lg:text-3xl text-white">
            Order Not Found.
          </h1>
        </>
      )}
    </>
  );
}
