import { http, createConfig } from "wagmi";
import { botchainTestnet } from "./chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [botchainTestnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [botchainTestnet.id]: http(process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.bohr.life"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
