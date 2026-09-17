"use client";

import React, { useState } from "react";
import { Rental, RentalStatus } from "@/types";
import { formatAddress } from "@/utils/botns";
import { formatEther } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import { ERC721_ABI, BOTRENT_CONTRACT_ADDRESS, BOTRENT_ABI } from "@/config/contracts";
import { Countdown } from "./Countdown";
import { botchainTestnet } from "@/config/chains";
import { 
  Shield, 
  ExternalLink, 
  Sparkles, 
  RotateCw, 
  LogOut, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";

interface RentalCardProps {
  rental: Rental;
  onActionComplete?: () => void;
}

export function RentalCard({ rental, onActionComplete }: RentalCardProps) {
  const { writeContractAsync } = useWriteContract();

  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Read NFT metadata
  const { data: nftName } = useReadContract({
    address: rental.nftContract,
    abi: ERC721_ABI,
    functionName: "name",
  });

  const { data: nftSymbol } = useReadContract({
    address: rental.nftContract,
    abi: ERC721_ABI,
    functionName: "symbol",
  });

  const { data: tokenURI } = useReadContract({
    address: rental.nftContract,
    abi: ERC721_ABI,
    functionName: "tokenURI",
    args: [rental.tokenId],
  });

  // Calculate Status
  const now = Math.floor(Date.now() / 1000);
  const isExpired = now >= Number(rental.expiresAt);
  const isExpiringSoon = !isExpired && Number(rental.expiresAt) - now < 24 * 3600;

  let status: RentalStatus = "ACTIVE";
  if (!rental.active) {
    status = "ENDED";
  } else if (isExpired) {
    status = "EXPIRED";
  } else if (isExpiringSoon) {
    status = "EXPIRING_SOON";
  }

  const statusBadgeMap = {
    ACTIVE: {
      label: "Active Rental",
      bg: "bg-brand-emerald/15 border-brand-emerald/30 text-brand-emerald",
    },
    EXPIRING_SOON: {
      label: "Expiring Soon",
      bg: "bg-brand-amber/15 border-brand-amber/30 text-brand-amber animate-pulse",
    },
    EXPIRED: {
      label: "Rental Expired",
      bg: "bg-brand-rose/15 border-brand-rose/30 text-brand-rose",
    },
    ENDED: {
      label: "Returned to Owner",
      bg: "bg-slate-800/60 border-white/10 text-slate-400",
    },
  };

  const currentBadge = statusBadgeMap[status];

  // End Rental
  const handleEndRental = async () => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await writeContractAsync({
        address: BOTRENT_CONTRACT_ADDRESS,
        abi: BOTRENT_ABI,
        functionName: "endRental",
        args: [rental.rentalId],
      });
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      console.error("End rental error:", err);
      setActionError(err?.shortMessage || err?.message || "Failed to end rental.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Extend Rental
  const handleExtendRental = async () => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await writeContractAsync({
        address: BOTRENT_CONTRACT_ADDRESS,
        abi: BOTRENT_ABI,
        functionName: "extendRental",
        args: [rental.rentalId],
        value: rental.amount,
      });
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      console.error("Extend rental error:", err);
      setActionError(err?.shortMessage || err?.message || "Failed to extend rental.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startDate = new Date(Number(rental.startedAt) * 1000);
  const expirationDate = new Date(Number(rental.expiresAt) * 1000);

  const hashVal = Number(rental.tokenId) % 4;
  const gradientStyles = [
    "from-indigo-900 via-purple-900 to-pink-900",
    "from-cyan-900 via-blue-900 to-indigo-950",
    "from-emerald-900 via-teal-950 to-slate-900",
    "from-fuchsia-950 via-rose-900 to-indigo-950",
  ];

  return (
    <div className="rounded-2xl bg-surface-100/85 border border-white/10 p-5 shadow-xl hover:border-brand-cyan/30 transition-all flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientStyles[hashVal]} flex items-center justify-center shrink-0 border border-white/10`}
          >
            <Sparkles className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              {nftName ? `${String(nftName)} #${rental.tokenId}` : `Item #${rental.tokenId}`}
            </h4>
            <p className="text-xs text-slate-400">
              {nftSymbol ? String(nftSymbol) : "NFT"} • Token #{rental.tokenId.toString()}
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${currentBadge.bg}`}
        >
          {currentBadge.label}
        </span>
      </div>

      {/* Details Table */}
      <div className="rounded-xl bg-surface-200/50 border border-white/5 p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Owner:</span>
          <span className="font-mono text-slate-300">{formatAddress(rental.owner)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Rental Fee:</span>
          <span className="font-semibold text-white">{formatEther(rental.amount)} BOT</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Started:</span>
          <span className="text-slate-300">
            {startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Expires:</span>
          <span className="text-slate-300">
            {expirationDate.toLocaleDateString()} {expirationDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Countdown Timer */}
      {rental.active && (
        <div>
          <Countdown expiresAt={rental.expiresAt} />
        </div>
      )}

      {actionError && (
        <div className="text-xs text-brand-rose bg-brand-rose/10 border border-brand-rose/20 rounded-lg p-2.5">
          {actionError}
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
        {rental.active && !isExpired && (
          <button
            onClick={handleExtendRental}
            disabled={isProcessing}
            className="flex-1 py-2 px-3 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 border border-brand-cyan/30 text-brand-cyan font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCw className="w-3.5 h-3.5" />
            )}
            Extend (+{formatEther(rental.amount)} BOT)
          </button>
        )}

        {rental.active && (
          <button
            onClick={handleEndRental}
            disabled={isProcessing}
            className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5 text-brand-rose" />
            )}
            {isExpired ? "End & Return NFT" : "Return Early"}
          </button>
        )}

        <a
          href={`${botchainTestnet.blockExplorers.default.url}/token/${rental.nftContract}?a=${rental.tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
          title="View on Bohr Scan"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
