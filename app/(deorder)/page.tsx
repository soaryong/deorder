"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQRCode } from "next-qrcode";
import { useAccount } from "wagmi";
import useMyStore from "@/hooks/useMyStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const router = useRouter();
  const { Canvas } = useQRCode();
  const { address } = useAccount();
  const { data: store } = useMyStore(address);
  return (
    <>
      {store && (
        <Tabs defaultValue="store">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="order">Order</TabsTrigger>
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
            <h1>Price: ${store.price} USDT</h1>
            <Image src={store.image} width={500} height={500} alt={""} />
            {store.menu2 && (
              <>
                <h1 className="mt-10 text-lg font-bold">Menu2</h1>
                <h1>Name: {store.menu2}</h1>
                <h1>Price: ${store.price2} USDT</h1>
                <Image src={store.image2} width={500} height={500} alt={""} />
              </>
            )}
          </TabsContent>
          <TabsContent value="order">
            <Button
              onClick={() => router.push("/order")}
              size={"lg"}
              className="mt-10"
            >
              Show Orders
            </Button>
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
