"use client";

import React, { useState, useMemo } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { BOTRENT_CONTRACT_ADDRESS, BOTRENT_ABI } from "@/config/contracts";
import { Listing } from "@/types";
import { ListingCard } from "@/components/ListingCard";
import { StatCard } from "@/components/StatCard";
import { formatEther } from "viem";
import { 
  Coins, 
  Layers, 
  KeyRound, 
  ArrowDownToLine, 
  PlusCircle, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import Link from "next/link";

export default function OwnerDashboardPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // 1. Read owner listings
  const { data: ownerListingIds, refetch: refetchListings, isLoading: loadingListings } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getOwnerListings",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // 2. Read owner earnings
  const { data: pendingEarnings, refetch: refetchEarnings } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getOwnerEarnings",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const ids = useMemo(() => {
    if (!ownerListingIds) return [];
    return [...(ownerListingIds as bigint[])];
  }, [ownerListingIds]);

  const earningsWei = (pendingEarnings as bigint) || 0n;
  const hasEarnings = earningsWei > 0n;

  // Withdraw flow
  const handleWithdraw = async () => {
    if (!hasEarnings) return;
    try {
      setIsWithdrawing(true);
      setWithdrawError(null);
      setWithdrawSuccess(false);

      await writeContractAsync({
        address: BOTRENT_CONTRACT_ADDRESS,
        abi: BOTRENT_ABI,
        functionName: "withdrawEarnings",
      });

      setWithdrawSuccess(true);
      await refetchEarnings();
    } catch (err: any) {
      console.error("Withdraw error:", err);
      setWithdrawError(err?.shortMessage || err?.message || "Withdrawal failed.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleRefresh = () => {
    refetchListings();
    refetchEarnings();
  };

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-purple/10 text-brand-purple text-xs font-semibold mb-2">
            <Coins className="w-3.5 h-3.5" />
            Owner Earnings & Assets
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            NFT Owner Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your escrow rental listings, monitor active renter subscriptions, and claim accumulated rental earnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-white/10 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/create"
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-brand-cyan to-brand-purple text-black hover:opacity-95 transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Create Listing
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-surface-100/90 border border-brand-cyan/20 p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Earnings
              </span>
              <div className="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">
              {formatEther(earningsWei)} <span className="text-brand-cyan text-sm">BOT</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Accumulated from rental payments and extensions.
            </p>
          </div>

          <div>
            <button
              onClick={handleWithdraw}
              disabled={!hasEarnings || isWithdrawing}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-brand-cyan text-black hover:bg-brand-cyan/90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing Withdrawal...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  Withdraw Earnings
                </>
              )}
            </button>
          </div>
        </div>

        <StatCard
          title="Total Listed Items"
          value={ids.length.toString()}
          subtitle="NFTs registered in protocol escrow"
          icon={Layers}
          color="purple"
        />

        <StatCard
          title="Escrow Protocol"
          value="Non-Custodial"
          subtitle="Only owner can cancel or withdraw"
          icon={KeyRound}
          color="emerald"
        />
      </div>

      {/* Feedback Messages */}
      {withdrawSuccess && (
        <div className="rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 p-4 text-xs text-brand-emerald flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Earnings successfully transferred to your wallet on Botchain Testnet!</span>
        </div>
      )}

      {withdrawError && (
        <div className="rounded-xl bg-brand-rose/10 border border-brand-rose/30 p-4 text-xs text-brand-rose">
          {withdrawError}
        </div>
      )}

      {/* Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">My Rental Listings</h2>
          <span className="text-xs text-slate-400">Total: {ids.length}</span>
        </div>

        {!isConnected ? (
          <div className="rounded-2xl bg-surface-100/50 border border-white/10 p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-brand-amber mx-auto" />
            <h3 className="text-lg font-bold text-white">Wallet Not Connected</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please connect your wallet to view your escrow listings and manage rental rights.
            </p>
          </div>
        ) : loadingListings ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading your listings from Botchain...</p>
          </div>
        ) : ids.length === 0 ? (
          <div className="rounded-2xl bg-surface-100/50 border border-white/10 p-12 text-center space-y-4">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Listings Created Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You have not listed any NFTs for rent. Deposit an ERC-721 token into escrow to start earning BOT.
            </p>
            <div className="pt-2">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-cyan to-brand-purple text-black"
              >
                <PlusCircle className="w-4 h-4" />
                List an NFT
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ids.map((id) => (
              <OwnerListingCardFetcher
                key={id.toString()}
                listingId={id}
                onCancelComplete={handleRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OwnerListingCardFetcher({
  listingId,
  onCancelComplete,
}: {
  listingId: bigint;
  onCancelComplete: () => void;
}) {
  const { data: rawListing } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getListing",
    args: [listingId],
  });

  if (!rawListing) return null;

  const listing: Listing = {
    listingId: (rawListing as any).listingId,
    owner: (rawListing as any).owner,
    nftContract: (rawListing as any).nftContract,
    tokenId: (rawListing as any).tokenId,
    price: (rawListing as any).price,
    duration: (rawListing as any).duration,
    active: (rawListing as any).active,
    createdAt: (rawListing as any).createdAt,
  };

  return (
    <ListingCard
      listing={listing}
      isOwner={true}
    />
  );
}
