import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local" });

const rawKey = process.env.BOTCHAIN_PRIVATE_KEY?.trim();
const formattedKey = rawKey ? (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) : undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botchain: {
      url: process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.botchain.ai",
      chainId: 677,
      accounts: formattedKey ? [formattedKey] : [],
    },
    botchainMainnet: {
      url: process.env.BOTCHAIN_MAINNET_RPC_URL || "https://rpc.botchain.ai",
      chainId: 677,
      accounts: formattedKey ? [formattedKey] : [],
    },
  },
  etherscan: {
    apiKey: {
      botchain: "empty",
      botchainMainnet: "empty",
    },
    customChains: [
      {
        network: "botchain",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
      {
        network: "botchainMainnet",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
