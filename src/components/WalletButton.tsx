"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { formatAddress } from "@/utils/botns";
import { Wallet, LogOut, Copy, Check, ChevronDown, ExternalLink } from "lucide-react";
import { botchainTestnet } from "@/config/chains";

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address,
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    const connector = connectors[0];
    return (
      <button
        onClick={() => connector && connect({ connector })}
        disabled={isPending}
        className="relative group px-5 py-2.5 rounded-xl font-medium text-sm text-white overflow-hidden transition-all duration-300 shadow-lg hover:shadow-brand-cyan/20 border border-brand-cyan/40 bg-gradient-to-r from-surface-100 to-surface-200 hover:border-brand-cyan active:scale-95 disabled:opacity-50"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand-cyan/10 via-brand-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="relative flex items-center gap-2">
          <Wallet className="w-4 h-4 text-brand-cyan group-hover:rotate-12 transition-transform" />
          {isPending ? "Connecting..." : "Connect Wallet"}
        </span>
      </button>
    );
  }

  const isCorrectNetwork = chainId === botchainTestnet.id;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-100/90 border border-white/10 hover:border-brand-cyan/50 transition-all text-sm font-medium text-slate-200 shadow-md backdrop-blur-md"
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isCorrectNetwork ? "bg-brand-emerald shadow-[0_0_8px_#10b981]" : "bg-brand-amber animate-pulse"
          }`}
        />
        {balanceData && (
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline border-r border-white/10 pr-2.5">
            {Number(balanceData.formatted).toFixed(3)} {balanceData.symbol}
          </span>
        )}
        <span className="font-mono text-xs sm:text-sm text-white">
          {formatAddress(address)}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f142b]/95 border border-white/10 shadow-2xl backdrop-blur-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-white/5 mb-2">
            <div className="text-xs text-slate-400">Connected Account</div>
            <div className="font-mono text-sm text-white font-medium break-all mt-0.5">
              {address}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
              <span>{isCorrectNetwork ? "Botchain Testnet" : "Wrong Network"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-2">
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-brand-emerald" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied!" : "Copy Address"}
              </span>
            </button>

            <a
              href={`${botchainTestnet.blockExplorers.default.url}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                View on Bohr Scan
              </span>
            </a>

            <button
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-brand-rose hover:bg-brand-rose/10 rounded-xl transition-colors mt-1 border-t border-white/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
