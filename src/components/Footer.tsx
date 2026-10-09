import React from "react";
import Link from "next/link";
import Image from "next/image";
import { KeyRound, ShieldAlert, ExternalLink } from "lucide-react";
import { BOTRENT_CONTRACT_ADDRESS } from "@/config/contracts";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#060813] text-slate-400 text-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Column 1: Brand & Concept */}
          <div className="md:col-span-5 space-y-4">
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
              Temporary NFT access powered by BOT Chain. BotRent lets NFT owners list digital assets for temporary rental while users access on-chain utility without purchasing the underlying token.
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
          <div className="md:col-span-3 space-y-3">
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

          {/* Column 3: BOT Chain Ecosystem & Network Links */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/botchain-logo.png"
                alt="BOT Chain Logo"
                width={28}
                height={28}
                className="w-7 h-7 rounded-lg object-contain border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)] bg-black"
              />
              <h4 className="text-white font-bold text-sm tracking-wide">
                BOT Chain Ecosystem
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              BotRent is deployed on BOT Chain Mainnet (Chain ID 677). Explore the official ecosystem links below:
            </p>

            <div className="space-y-2.5 pt-1">
              {/* BOT Chain Website Link with Logo in front */}
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-100/80 hover:bg-surface-200 border border-white/10 hover:border-emerald-500/40 text-xs transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-black border border-emerald-500/30 flex items-center justify-center p-1 shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  <Image
                    src="/botchain-logo.png"
                    alt="BOT Chain Logo"
                    width={22}
                    height={22}
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    BOT Chain Website
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block truncate">
                    https://botchain.ai
                  </span>
                </div>
              </a>

              {/* BOT Chain Explorer Link with Logo in front */}
              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-100/80 hover:bg-surface-200 border border-white/10 hover:border-emerald-500/40 text-xs transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-black border border-emerald-500/30 flex items-center justify-center p-1 shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  <Image
                    src="/botchain-logo.png"
                    alt="BOT Chain Logo"
                    width={22}
                    height={22}
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    BOT Chain Explorer
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block truncate">
                    https://scan.botchain.ai
                  </span>
                </div>
              </a>

              {/* BotRent Contract on Explorer */}
              <a
                href={`https://scan.botchain.ai/address/${BOTRENT_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-brand-cyan hover:underline transition-colors"
              >
                <span>View BotRent Verified Contract on Explorer</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Image
              src="/botchain-logo.png"
              alt="BOT Chain Logo"
              width={16}
              height={16}
              className="w-4 h-4 rounded object-contain"
            />
            <p>© 2026 BotRent Protocol. Built for BOT Chain Mainnet.</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              botchain.ai
            </a>
            <span>•</span>
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              scan.botchain.ai
            </a>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              RPC Operational (677)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
