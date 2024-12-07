"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQRCode } from "next-qrcode";
import { useAccount } from "wagmi";
import useMyStore from "@/hooks/useMyStore";
import useOrders from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { ellipsisAddress } from "@/utils/strings";
import useRequests from "@/hooks/useRequests";

export default function Home() {
  const { address } = useAccount();
  const { data: store } = useMyStore(address);
  const { data: orders } = useOrders();
  const { data: requests } = useRequests(address as string);
  return (
    <>
      {store && (
        <div className="z-10 w-full max-w-md mt-10 text-white">
          <div>
            <h1 className="scroll-m-20 text-xl mb-3 font-extrabold tracking-tight lg:text-3xl text-white">
              Recent Orders
            </h1>
          </div>
          {orders &&
            orders
              .filter((order) => order.store_id == store.id)
              .map((order) => (
                <div key={order.id} className="mt-5">
                  <Badge>{ellipsisAddress(order.customer)}</Badge>
                  <h1>{order.created}</h1>
                  <h1>
                    x{order.count}, ${order.price} USDT
                  </h1>
                </div>
              ))}
        </div>
      )}
    </>
  );
}
