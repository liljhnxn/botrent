"use client";

import React from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { botchainTestnet } from "@/config/chains";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function NetworkBanner() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === botchainTestnet.id) {
    return null;
  }

  return (
    <div className="w-full bg-brand-amber/15 border-b border-brand-amber/30 px-4 py-2.5 text-brand-amber text-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-brand-amber animate-pulse" />
          <span>
            You are connected to an unsupported network. Please switch to{" "}
            <strong>Botchain Testnet (Chain ID 968)</strong> to rent or list NFTs.
          </span>
        </div>
        <button
          onClick={() => switchChain({ chainId: botchainTestnet.id })}
          disabled={isPending}
          className="px-3.5 py-1 text-xs font-semibold bg-brand-amber text-black rounded-lg hover:bg-brand-amber/90 transition-all flex items-center gap-1.5 shadow-sm shrink-0 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Switching...
            </>
          ) : (
            "Switch Network"
          )}
        </button>
      </div>
    </div>
  );
}
