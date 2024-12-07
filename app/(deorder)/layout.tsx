import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "De-Order",
  description: "De-Order",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-20 bg-stone-800 font-sans text-white">
        <div className="z-10 w-full max-w-md space-y-2">
          <h1 className="font-extrabold text-2xl">De-Order</h1>
          <w3m-button />
        </div>

        <div className="z-10 w-full max-w-md mt-10">{children}</div>
      </main>
    </>
  );
}
