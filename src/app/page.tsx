"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useReadContract } from "wagmi";
import { BOTRENT_CONTRACT_ADDRESS, BOTRENT_ABI, MOCK_NFT_CONTRACT_ADDRESS } from "@/config/contracts";
import { botchain } from "@/config/chains";
import { 
  KeyRound, 
  ShieldCheck, 
  Coins, 
  Clock, 
  Lock, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  HelpCircle, 
  ChevronRight,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { StatCard } from "@/components/StatCard";

export default function HomePage() {
  const { data: listingCount } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getListingCount",
  });

  const { data: rentalCount } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getRentalCount",
  });

  const faqs = [
    {
      q: "How does the BotRent escrow rental model work?",
      a: "When an owner lists an NFT, the contract transfers the NFT into BotRent protocol escrow. When a renter pays the rental fee in native BOT, an on-chain rental record is created with a verifiable expiration timestamp. During this time, the renter holds rental rights while the owner retains underlying economic ownership. Once expired or ended, the NFT is returned directly from escrow to the owner.",
    },
    {
      q: "Does renting an NFT automatically grant access to external games?",
      a: "BotRent establishes temporary on-chain rental rights and holds the NFT in escrow during the rental period. External games or applications must integrate with BotRent's on-chain protocol functions (such as getRental or isRentalExpired) to enforce those rental rights.",
    },
    {
      q: "Can the NFT owner withdraw earnings while the rental is active?",
      a: "Yes! Rental payments are credited immediately to the owner's pendingEarnings on-chain when the rental starts or when extended. Owners can withdraw their accumulated earnings at any time using the Owner Dashboard.",
    },
    {
      q: "Can a renter extend their rental before it expires?",
      a: "Yes. Renters can call extendRental() on an active rental before expiration by paying the original listing fee. This extends the rental duration by the exact duration specified in the listing.",
    },
    {
      q: "What network is BotRent running on?",
      a: "BotRent runs natively on BOT Chain Mainnet (Chain ID: 677) with sub-second block times and minimal gas fees denominated in native BOT.",
    },
  ];

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto pt-8 pb-12">
        <a
          href={`${botchain.blockExplorers.default.url}/address/${BOTRENT_CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-100/90 hover:bg-surface-200 border border-brand-cyan/30 hover:border-brand-cyan/60 text-xs font-semibold text-brand-cyan mb-6 shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all group"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>BOT Chain Mainnet Protocol Live (Chain ID 677)</span>
          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand-cyan transition-colors" />
        </a>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
          Rent NFTs. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-purple">
            Own the Experience.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          BotRent lets NFT owners list digital assets for temporary rental while users access on-chain utility for a defined period without purchasing the underlying NFT.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/explore"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-purple text-black hover:opacity-95 transition-all shadow-[0_0_30px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 active:scale-95"
          >
            Explore Rentals
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/create"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-surface-100/80 hover:bg-surface-200 border border-white/10 hover:border-brand-cyan/40 text-white transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            List an NFT
          </Link>

          <a
            href="https://scan.botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2.5 group"
          >
            <Image
              src="/botchain-logo.png"
              alt="BOT Chain Logo"
              width={20}
              height={20}
              className="w-5 h-5 rounded object-contain"
            />
            <span>BOT Scan Explorer</span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Protocol Custody Highlight Banner */}
        <div className="mt-12 rounded-2xl bg-surface-100/60 border border-brand-cyan/20 p-4 text-left flex items-start gap-4 max-w-2xl mx-auto backdrop-blur-md">
          <ShieldCheck className="w-6 h-6 text-brand-cyan shrink-0 mt-1" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Trustless Smart Contract Escrow</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              BotRent establishes temporary on-chain rental rights and holds the NFT in escrow during the rental period. External games or applications must integrate with BotRent to enforce those rental rights.
            </p>
          </div>
        </div>
      </section>

      {/* Protocol Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Listings"
          value={listingCount ? listingCount.toString() : "0"}
          subtitle="On-chain rental inventory"
          icon={Layers}
          color="cyan"
        />
        <StatCard
          title="Total Rentals"
          value={rentalCount ? rentalCount.toString() : "0"}
          subtitle="Historical protocol rentals"
          icon={KeyRound}
          color="purple"
        />
        <StatCard
          title="Escrow Security"
          value="100%"
          subtitle="Non-custodial smart contracts"
          icon={Lock}
          color="emerald"
        />
        <StatCard
          title="Network Fee"
          value="< 0.001 BOT"
          subtitle="Ultra-fast Bohr execution"
          icon={Cpu}
          color="amber"
        />
      </section>

      {/* How It Works Section */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            How BotRent Works
          </h2>
          <p className="text-slate-400 text-sm">
            A frictionless, 3-step escrow rental protocol designed for Web3 gaming and digital utility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl bg-surface-100/70 border border-white/10 p-8 space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan font-black text-lg">
              01
            </div>
            <h3 className="text-xl font-bold text-white">1. Owner Lists in Escrow</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              NFT owners approve BotRent and deposit their ERC-721 token into protocol escrow. Owners set custom rental fees in BOT and durations.
            </p>
          </div>

          <div className="rounded-2xl bg-surface-100/70 border border-white/10 p-8 space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-brand-purple/15 border border-brand-purple/30 flex items-center justify-center text-brand-purple font-black text-lg">
              02
            </div>
            <h3 className="text-xl font-bold text-white">2. Renter Pays BOT</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Users browse available rentals, pay the exact fee in native BOT, and receive an authoritative on-chain rental record with expiration tracking.
            </p>
          </div>

          <div className="rounded-2xl bg-surface-100/70 border border-white/10 p-8 space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald font-black text-lg">
              03
            </div>
            <h3 className="text-xl font-bold text-white">3. Return & Withdraw</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When the rental expires or is returned, the NFT is automatically returned to the owner. The owner withdraws earnings at any time with reentrancy protection.
            </p>
          </div>
        </div>
      </section>

      {/* For Owners & Renters Side-by-Side */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* For Owners */}
        <div className="rounded-2xl bg-gradient-to-b from-surface-100 to-surface-200 border border-brand-purple/30 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand-purple/15 text-brand-purple">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">For NFT Owners</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Monetize idle digital collectibles and gaming assets without giving up underlying ownership.
          </p>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>Retain 100% economic ownership while NFT is held in protocol escrow.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>Instant earnings crediting with direct BOT withdrawals.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>Cancel inactive listings anytime to instantly reclaim your NFT.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>Double-return prevention and non-reentrant security patterns.</span>
            </li>
          </ul>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-purple hover:text-white transition-colors"
          >
            Start Listing NFTs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* For Renters */}
        <div className="rounded-2xl bg-gradient-to-b from-surface-100 to-surface-200 border border-brand-cyan/30 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand-cyan/15 text-brand-cyan">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">For Renters</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Gain temporary utility and trial rare in-game items, metaverse assets, or passes at a fraction of purchase cost.
          </p>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>No huge capital commitment—pay only for the exact duration you need.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>Verifiable on-chain rental status with real-time countdown timer.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>Extend active rentals before expiration seamlessly in 1-click.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>Return early whenever finished to complete the rental lifecycle.</span>
            </li>
          </ul>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-cyan hover:text-white transition-colors"
          >
            Browse Available Rentals <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* BOT Chain Ecosystem Section */}
      <section id="ecosystem" className="rounded-3xl bg-surface-100/80 border border-white/10 p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Image
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded object-contain"
                />
                <span>Official Ecosystem Protocol</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
                BOT Chain Ecosystem
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                BotRent is natively powered by BOT Chain infrastructure. Explore the official chain website and block explorer below.
              </p>
            </div>

            {/* Quick Network Spec Capsule */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-white/10 shrink-0">
              <Image
                src="/botchain-logo.png"
                alt="BOT Chain Logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-contain border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-black p-1"
              />
              <div className="text-xs font-mono">
                <div className="text-white font-bold flex items-center gap-2">
                  BOT Chain Mainnet
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-slate-400">Chain ID: <span className="text-brand-cyan font-bold">677</span> | BOT</div>
              </div>
            </div>
          </div>

          {/* Links Grid with Logo in front of each link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BOT Chain Website Card */}
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-2xl bg-surface-200/90 hover:bg-surface-200 border border-white/10 hover:border-emerald-500/50 transition-all group flex items-start gap-4 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
            >
              <div className="w-12 h-12 rounded-xl bg-black border border-emerald-500/40 flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <Image
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  width={32}
                  height={32}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    BOT Chain Website
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Official
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Access the official BOT Chain portal, documentation, and ecosystem directory.
                </p>
                <p className="text-xs font-mono text-emerald-400/90 group-hover:underline pt-1">
                  https://botchain.ai
                </p>
              </div>
            </a>

            {/* BOT Chain Explorer Card */}
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-2xl bg-surface-200/90 hover:bg-surface-200 border border-white/10 hover:border-emerald-500/50 transition-all group flex items-start gap-4 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
            >
              <div className="w-12 h-12 rounded-xl bg-black border border-emerald-500/40 flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <Image
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  width={32}
                  height={32}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    BOT Chain Explorer
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    BOT Scan
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Verify real-time transactions, contracts, blocks, and on-chain NFT rental state.
                </p>
                <p className="text-xs font-mono text-emerald-400/90 group-hover:underline pt-1">
                  https://scan.botchain.ai
                </p>
              </div>
            </a>
          </div>

          {/* Verified Contract Footer Bar inside Ecosystem Section */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300">
                Verified Protocol Contract on BOT Scan:
              </span>
              <span className="font-mono text-brand-cyan truncate max-w-xs sm:max-w-md">
                {BOTRENT_CONTRACT_ADDRESS}
              </span>
            </div>
            <a
              href={`https://scan.botchain.ai/address/${BOTRENT_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-2 transition-colors shrink-0"
            >
              <Image
                src="/botchain-logo.png"
                alt="BOT Chain"
                width={14}
                height={14}
                className="w-3.5 h-3.5 object-contain"
              />
              <span>Inspect on BOT Scan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-brand-cyan" />
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400">
            Everything you need to know about decentralized NFT rentals on BotRent.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-surface-100/80 border border-white/10 p-6 space-y-2"
            >
              <h4 className="text-sm font-bold text-white">{faq.q}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
