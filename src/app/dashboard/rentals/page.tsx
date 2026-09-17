"use client";

import React, { useState, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { BOTRENT_CONTRACT_ADDRESS, BOTRENT_ABI } from "@/config/contracts";
import { Rental } from "@/types";
import { RentalCard } from "@/components/RentalCard";
import { 
  Layers, 
  Clock, 
  AlertCircle, 
  History, 
  RefreshCw, 
  Compass, 
  ShieldCheck 
} from "lucide-react";
import Link from "next/link";

export default function RentalsDashboardPage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<"all" | "active" | "expired" | "ended">("active");

  // Read rentals for connected user
  const { data: rentalIds, refetch, isLoading } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getRenterRentals",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const ids = useMemo(() => {
    if (!rentalIds) return [];
    return [...(rentalIds as bigint[])];
  }, [rentalIds]);

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-cyan/10 text-brand-cyan text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            Renter Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My NFT Rentals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your temporary on-chain rental rights, extend active durations, or return assets to escrow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Refresh rentals"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/explore"
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-brand-cyan text-black hover:bg-brand-cyan/90 transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Explore More
          </Link>
        </div>
      </div>

      {/* Escrow Utility Notice */}
      <div className="rounded-xl bg-surface-100/60 border border-brand-cyan/20 p-4 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Escrow Notice:</strong> You hold valid on-chain rental rights for these NFTs. External games or decentralized applications can verify your active status directly from BotRent contract.
        </p>
      </div>

      {!isConnected ? (
        <div className="rounded-2xl bg-surface-100/50 border border-white/10 p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-brand-amber mx-auto" />
          <h3 className="text-lg font-bold text-white">Wallet Not Connected</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Please connect your Web3 wallet to view your active rentals and rental history on Botchain Testnet.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your rentals from Botchain...</p>
        </div>
      ) : ids.length === 0 ? (
        <div className="rounded-2xl bg-surface-100/50 border border-white/10 p-12 text-center space-y-4">
          <History className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Rentals Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You have not rented any NFTs yet on Botchain Testnet. Discover available rentals in the marketplace.
          </p>
          <div className="pt-2">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-cyan to-brand-purple text-black"
            >
              <Compass className="w-4 h-4" />
              Explore Rentals
            </Link>
          </div>
        </div>
      ) : (
        /* Rental Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ids.map((id) => (
            <RentalCardFetcher
              key={id.toString()}
              rentalId={id}
              tabFilter={tab}
              onActionComplete={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RentalCardFetcher({
  rentalId,
  tabFilter,
  onActionComplete,
}: {
  rentalId: bigint;
  tabFilter: string;
  onActionComplete: () => void;
}) {
  const { data: rawRental } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getRental",
    args: [rentalId],
  });

  if (!rawRental) return null;

  const rental: Rental = {
    rentalId: (rawRental as any).rentalId,
    listingId: (rawRental as any).listingId,
    renter: (rawRental as any).renter,
    owner: (rawRental as any).owner,
    nftContract: (rawRental as any).nftContract,
    tokenId: (rawRental as any).tokenId,
    amount: (rawRental as any).amount,
    startedAt: (rawRental as any).startedAt,
    expiresAt: (rawRental as any).expiresAt,
    active: (rawRental as any).active,
  };

  const now = Math.floor(Date.now() / 1000);
  const isExpired = now >= Number(rental.expiresAt);

  if (tabFilter === "active" && (!rental.active || isExpired)) return null;
  if (tabFilter === "expired" && (!rental.active || !isExpired)) return null;
  if (tabFilter === "ended" && rental.active) return null;

  return (
    <RentalCard
      rental={rental}
      onActionComplete={onActionComplete}
    />
  );
}
