"use client";

import React, { useState } from "react";
import { Listing } from "@/types";
import { formatEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { BOTRENT_CONTRACT_ADDRESS, BOTRENT_ABI } from "@/config/contracts";
import { formatAddress } from "@/utils/botns";
import { 
  X, 
  Coins, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  ExternalLink 
} from "lucide-react";
import { botchainTestnet } from "@/config/chains";

interface RentModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RentModal({ listing, isOpen, onClose, onSuccess }: RentModalProps) {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [txStep, setTxStep] = useState<"idle" | "preparing" | "pending" | "confirmed" | "failed">("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const durationDays = Math.round(Number(listing.duration) / 86400);
  const durationDisplay =
    durationDays > 0 ? `${durationDays} Days` : `${Math.round(Number(listing.duration) / 3600)} Hours`;

  const startDate = new Date();
  const endDate = new Date(Date.now() + Number(listing.duration) * 1000);

  const handleConfirmRent = async () => {
    if (!isConnected) return;
    try {
      setErrorMessage(null);
      setTxStep("preparing");

      const hash = await writeContractAsync({
        address: BOTRENT_CONTRACT_ADDRESS,
        abi: BOTRENT_ABI,
        functionName: "rent",
        args: [listing.listingId],
        value: listing.price,
      });

      setTxHash(hash);
      setTxStep("confirmed");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Rent error:", err);
      setTxStep("failed");
      setErrorMessage(err?.shortMessage || err?.message || "Failed to confirm rental transaction.");
    }
  };

  const handleClose = () => {
    setTxStep("idle");
    setTxHash(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-100 border border-white/10 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Confirm NFT Rental</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Listing #{listing.listingId.toString()} • Token ID #{listing.tokenId.toString()}
            </p>
          </div>
          {txStep !== "preparing" && txStep !== "pending" && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* State: Confirmed */}
        {txStep === "confirmed" ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-emerald/15 border border-brand-emerald/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-brand-emerald" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Rental Successfully Activated!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Your rental rights have been registered on Botchain Testnet. The NFT is held in protocol escrow for the duration.
              </p>
            </div>

            {txHash && (
              <div className="pt-2">
                <a
                  href={`${botchainTestnet.blockExplorers.default.url}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-cyan hover:underline"
                >
                  View Transaction on Bohr Scan <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-cyan to-brand-purple text-black hover:opacity-95 transition-all shadow-lg active:scale-95"
              >
                Go to My Rentals
              </button>
            </div>
          </div>
        ) : (
          /* Normal confirmation view */
          <div className="space-y-5">
            {/* Rental Summary Card */}
            <div className="rounded-xl bg-surface-200/70 border border-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">NFT Contract:</span>
                <span className="font-mono text-slate-200">{formatAddress(listing.nftContract)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Token ID:</span>
                <span className="font-mono font-bold text-white">#{listing.tokenId.toString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">NFT Owner:</span>
                <span className="font-mono text-slate-200">{formatAddress(listing.owner)}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-purple" />
                  Rental Duration:
                </span>
                <span className="font-semibold text-white">{durationDisplay}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                  Expected Expiration:
                </span>
                <span className="text-slate-300 font-medium">
                  {endDate.toLocaleDateString()} {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
                <span className="font-semibold text-white flex items-center gap-1">
                  <Coins className="w-4 h-4 text-brand-cyan" />
                  Total Rental Payment:
                </span>
                <span className="text-base font-extrabold text-brand-cyan">
                  {formatEther(listing.price)} BOT
                </span>
              </div>
            </div>

            {/* Protocol Notice */}
            <div className="rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 p-3.5 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Escrow Rental Guarantee:</strong> The original owner remains the economic owner while BotRent holds the NFT in escrow. External applications query BotRent on-chain to verify your active rental.
              </div>
            </div>

            {errorMessage && (
              <div className="text-xs text-brand-rose bg-brand-rose/10 border border-brand-rose/20 rounded-lg p-3">
                {errorMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={txStep === "preparing"}
                className="w-1/3 py-3 rounded-xl font-medium text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRent}
                disabled={txStep === "preparing"}
                className="w-2/3 py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-brand-cyan to-brand-purple text-black hover:opacity-95 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {txStep === "preparing" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirm in Wallet...
                  </>
                ) : (
                  `Pay ${formatEther(listing.price)} BOT & Rent`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
