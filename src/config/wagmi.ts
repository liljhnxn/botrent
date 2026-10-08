import { http, createConfig } from "wagmi";
import { botchain } from "./chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [botchain],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [botchain.id]: http(process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.botchain.ai"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}


