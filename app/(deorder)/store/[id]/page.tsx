"use client";
import pb from "@/api/pocketbase";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useStore from "@/hooks/useStore";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useAccount, useBalance, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { RequestNetwork } from "@requestnetwork/request-client.js";
import { providers } from "ethers";
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

export default function Home() {
  const minTokenAbi = [
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const params = useParams();
  const { id } = params as { id: string };
  const { address, isConnected } = useAccount();
  const { data: store } = useStore(id);
  const [count, setCount] = useState("1");
  const [tip, setTip] = useState("10");
  const { data: balance } = useBalance({
    chainId: sepolia.id,
    token: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
    address: address,
  });

  const provider = useEthersV5Provider();
  const signer = useEthersV5Signer();

  const { writeContract, isPending: isLoading } = useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        await pb.collection("order").create({
          store_id: store?.id,
          count,
          price: price().toString(),
          customer: address,
          hash,
        });
        alert("Order Success");
      },
      onError: (error) => {
        console.log(error);
      },
    },
  });

  const price = () => {
    if (!store) {
      return 0;
    }
    const price = +store.price;
    const cnt = +count;
    const percent = +tip;

    const amount = price * cnt + (price * cnt * percent) / 100;

    return amount;
  };

  const verifyProofClientSide = useCallback(
    async (verificationKey: any, proof: any) => {
      const zokratesProvider = await initialize();
      const isVerified = zokratesProvider.verify(verificationKey, proof);
      return isVerified;
    },
    []
  );

  const onSendTransaction = useCallback(async () => {
    console.log(verificationKey);

    if (!store || !isConnected) {
      return;
    }

    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
    });

    console.log(store.requestId);

    const request = await requestClient.fromRequestId(store.requestId);
    console.log(request);
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

    alert("Order Success");

    /* writeContract({
       abi: minTokenAbi,
       functionName: "transfer",
       args: [store.owner, (price() * 1000000).toString()],
       address: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
     });*/
  }, [writeContract, address, store, count, tip]);

  return (
    <>
      {store && (
        <div className="z-10 w-full max-w-md text-white">
          <h1 className="mt-10 text-lg font-bold">Store</h1>
          <h1>{store.name}</h1>
          <h1>{store.description}</h1>

          <h1 className="mt-5 text-lg font-bold">Menu</h1>
          <h1>{store.menu}</h1>
          <h1>${store.price} USDT</h1>
          <Image src={store.image} width={500} height={500} alt={""} />
          <div className="mt-5">
            <h1>Order Count</h1>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Count</SelectLabel>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <h1>Tip</h1>
            <Select value={tip} onValueChange={setTip}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tip</SelectLabel>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <h1 className="scroll-m-20 text-xl mt-2 mb-1 font-extrabold tracking-tight lg:text-3xl text-white">
              Total Price :{" "}
              {+store.price * +count + (+store.price * +count * +tip) / 100}{" "}
              USDC
            </h1>
            <Button onClick={onSendTransaction}>Order</Button> (My Balance:{" "}
            {balance?.formatted ?? 0})
          </div>
        </div>
      )}
      {!store && (
        <>
          <h1 className="scroll-m-20 text-4xl mt-10 font-extrabold tracking-tight lg:text-3xl text-white">
            Store Not Found.
          </h1>
        </>
      )}
    </>
  );
}
