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
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAccount, useBalance, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { providers } from "ethers";
import { useEthersV5Provider } from "@/hooks/use-ethers-v5-provider";
import { useEthersV5Signer } from "@/hooks/use-ethers-v5-signer";

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
  const router = useRouter();
  const { id } = params as { id: string };
  const { address, isConnected } = useAccount();
  const { data: store } = useStore(id);
  const [count, setCount] = useState("0");
  const [count2, setCount2] = useState("0");
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
    const price2 = +store.price2;
    const cnt2 = +count2;

    const amount =
      price * cnt +
      price2 * cnt2 +
      ((price * cnt + price2 * cnt2) * percent) / 100;

    return amount;
  };

  const order = useCallback(async () => {
    await pb
      .collection("order")
      .create({
        store_id: store?.id,
        price: price().toString(),
        customer: address,
        state: "pending",
        menus: {
          menu: store?.menu,
          price: store?.price,
          count: count,
          menu2: store?.menu2,
          price2: store?.price2,
          count2: count2,
          tip: tip,
        },
      })
      .then((order) => {
        router.push(`/order/${order.id}`);
      });
    alert("Order Success");
  }, [writeContract, address, store, count, tip]);

  return (
    <>
      {store && (
        <div className="z-10 w-full max-w-md text-white">
          <h1 className="text-lg font-bold">Store</h1>
          <h1>{store.name}</h1>
          <h1>{store.description}</h1>

          <h1 className="mt-5 text-lg font-bold">Menu</h1>
          <div>
            <h1>
              {store.menu} / ${store.price}
            </h1>
            <Image src={store.image} width={500} height={500} alt={""} />
            <div className="mt-2">
              <h1>Order Count</h1>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Count</SelectLabel>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-5">
            <h1>
              {store.menu2} / ${store.price2}
            </h1>
            <Image src={store.image2} width={500} height={500} alt={""} />
            <div className="mt-2">
              <h1>Order Count</h1>
              <Select value={count2} onValueChange={setCount2}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Count</SelectLabel>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
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
          <div className="mt-5">
            <h1 className="scroll-m-20 text-xl mt-2 mb-1 font-extrabold tracking-tight lg:text-3xl text-white">
              Total Price : $
              {+store.price * +count +
                +store.price2 * +count2 +
                ((+store.price * +count + +store.price2 * +count2) * +tip) /
                  100}{" "}
            </h1>
            <Button onClick={order}>
              Order (Available: ${balance?.formatted ?? 0})
            </Button>
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
