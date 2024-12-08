"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQRCode } from "next-qrcode";
import { useAccount } from "wagmi";
import useMyStore from "@/hooks/useMyStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useOrders from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import useRequests from "@/hooks/useRequests";
import { ellipsisAddress } from "@/utils/strings";

export default function Home() {
  const router = useRouter();
  const { Canvas } = useQRCode();
  const { address } = useAccount();
  const { data: store } = useMyStore(address);
  const { data: orders } = useOrders();
  const { data, isLoading, error, refetch } = useRequests(address as string);
  function ellisisAddress(requestId: any): import("react").ReactNode {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      {store && (
        <Tabs defaultValue="store">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="order">Order</TabsTrigger>
            <TabsTrigger value="invoice">Invoice</TabsTrigger>
          </TabsList>

          <TabsContent value="store">
            <div>
              <h1 className="mt-10 text-lg font-bold">Store</h1>
              <h1>{store.name}</h1>
              <h1 className="mt-10 text-lg font-bold">Description</h1>
              <h1>{store.description}</h1>
              <h1 className="mt-10 text-lg font-bold">Link</h1>
              <small>https://deorder.vercel.app/store/{store.id}</small>
              <h1 className="mt-10 text-lg font-bold">
                QRCode(Please attach it on the table)
              </h1>
              <Canvas
                text={`deorder.vercel.app/store/${store.id}`}
                options={{
                  type: "image/jpeg",
                  quality: 0.3,
                  errorCorrectionLevel: "M",
                  margin: 3,
                  scale: 4,
                  width: 200,
                  color: {
                    dark: "#010599FF",
                    light: "#ffffff",
                  },
                }}
              />
            </div>
          </TabsContent>
          <TabsContent value="menu">
            <h1 className="mt-10 text-lg font-bold">Menu1</h1>
            <h1>Name: {store.menu}</h1>
            <h1>Price: ${store.price}</h1>
            <Image src={store.image} width={500} height={500} alt={""} />
            {store.menu2 && (
              <>
                <h1 className="mt-10 text-lg font-bold">Menu2</h1>
                <h1>Name: {store.menu2}</h1>
                <h1>Price: ${store.price2}</h1>
                <Image src={store.image2} width={500} height={500} alt={""} />
              </>
            )}
          </TabsContent>
          <TabsContent value="order">
            {orders &&
              orders
                .filter((order) => order.store_id == store.id)
                .map((order) => (
                  <div
                    key={order.id}
                    className="mt-5 flex border p-2  items-center justify-between space-x-2" // Flexbox 적용
                  >
                    <Badge variant="secondary">
                      {order.created.substring(5, 10)}
                    </Badge>
                    <h1>
                      ${order.price} <Badge className="ml-2">{order.state}</Badge>
                    </h1>
                    <Button
                      onClick={() => router.push(`/order/${order.id}`)}
                      size={"sm"}
                      className="mt-2"
                    >
                      Link
                    </Button>
                  </div>
                ))}
          </TabsContent>
          <TabsContent value="invoice">
            <div>
              {data && data.length > 0 ? (
                <>
                  {data.map((request: any, index: number) => (
                    <div className="mt-5 border p-2 text-sm space-y-1">
                      <div className="font-bold text-md">
                        <Badge variant="secondary">ID</Badge>
                        {ellipsisAddress(request.requestId)}
                        <Badge>{request.state.toUpperCase()}</Badge>
                      </div>

                      <div>
                        <Badge variant="secondary">CURRENCY</Badge>{" "}
                        {request.currency}
                      </div>
                      <div>
                        <Badge variant="secondary">AMOUNT</Badge> $
                        {request.expectedAmount}
                      </div>
                      <div>
                        <Badge variant="secondary">PAYER</Badge>{" "}
                        {ellipsisAddress(request.payer?.value)}
                      </div>
                      <div>
                        <Badge variant="secondary">PAYEE</Badge>{" "}
                        {ellipsisAddress(request.payee?.value)}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p>No requests found.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!store && (
        <>
          <h1 className="scroll-m-20 text-2xl mt-10 font-extrabold tracking-tight text-white">
            Make your store in seconds.
          </h1>
          <h1 className="scroll-m-20 text-xl mt-3 tracking-tight text-white">
            A Blockchain-Based Order and Payment Platform
          </h1>
          <Button
            onClick={() => router.push("/make-store")}
            size={"lg"}
            className="mt-10"
          >
            Make store
          </Button>
        </>
      )}
    </>
  );
}
