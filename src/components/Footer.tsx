import React from "react";
import Link from "next/link";
import { KeyRound, ShieldAlert, ExternalLink, Cpu } from "lucide-react";
import { BOTRENT_CONTRACT_ADDRESS, MOCK_NFT_CONTRACT_ADDRESS } from "@/config/contracts";
import { botchainTestnet } from "@/config/chains";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#060813] text-slate-400 text-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Brand & Concept */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan p-0.5 shadow-md">
                <div className="w-full h-full bg-[#080a18] rounded-[10px] flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-brand-cyan" />
                </div>
              </div>
              <span className="font-extrabold text-xl text-white">
                Bot<span className="text-brand-cyan">Rent</span>
              </span>
            </div>
            <p className="text-slate-300 font-medium text-base">
              Rent NFTs. Own the Experience.
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Temporary NFT access powered by Botchain. BotRent lets NFT owners list digital assets for temporary rental while users access on-chain utility without purchasing the underlying token.
            </p>

            {/* Protocol Disclaimer Alert */}
            <div className="rounded-xl bg-surface-100/70 border border-brand-cyan/20 p-4 space-y-2 mt-4 max-w-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan">
                <ShieldAlert className="w-4 h-4 text-brand-cyan shrink-0" />
                <span>Protocol Custody & Utility Notice</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                BotRent establishes temporary on-chain rental rights and holds the NFT in escrow during the rental period. External games or applications must integrate with BotRent to enforce those rental rights.
              </p>
            </div>
          </div>

          {/* Column 2: Protocol Pages */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide">Protocol</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore" className="hover:text-brand-cyan transition-colors">
                  Explore Rentals
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-brand-cyan transition-colors">
                  List an NFT
                </Link>
              </li>
              <li>
                <Link href="/dashboard/rentals" className="hover:text-brand-cyan transition-colors">
                  Active Rentals Portal
                </Link>
              </li>
              <li>
                <Link href="/dashboard/owner" className="hover:text-brand-cyan transition-colors">
                  Owner Earnings & Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Smart Contracts & Network */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand-purple" />
              Botchain Testnet
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Chain ID:</span>
                <span className="font-mono text-slate-200">968</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Native Token:</span>
                <span className="font-mono text-slate-200">BOT</span>
              </li>
              <li>
                <a
                  href={`${botchainTestnet.blockExplorers.default.url}/address/${BOTRENT_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand-cyan hover:underline"
                >
                  BotRent Contract <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={`${botchainTestnet.blockExplorers.default.url}/address/${MOCK_NFT_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
                >
                  Demo NFT Faucet <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 BotRent Protocol. Built for Botchain Testnet.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-emerald shadow-[0_0_6px_#10b981]" />
              RPC Operational (https://rpc.bohr.life)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
