// config/index.tsx
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { cookieStorage, createStorage } from "wagmi";
import { sepolia } from "wagmi/chains";

export const projectId = "03d89941cd7005de1b58e2719454a8d0";

const metadata = {
  name: "De-Order",
  description: "De-Order",
  url: "https://deorder.vercel.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Create wagmiConfig
const chains = [sepolia] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  auth: {
    email: false,
    socials: ["google", "x", "facebook"],
    showWallets: false,
    walletFeatures: true,
  },
});
