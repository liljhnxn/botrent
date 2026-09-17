"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Listing } from "@/types";
import { formatAddress } from "@/utils/botns";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { ERC721_ABI } from "@/config/contracts";
import { Sparkles, Clock, Coins, Shield, ExternalLink, ArrowUpRight } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
  onRentClick?: (listing: Listing) => void;
  isOwner?: boolean;
}

export function ListingCard({ listing, onRentClick, isOwner = false }: ListingCardProps) {
  // Read NFT metadata dynamically from contract
  const { data: nftName } = useReadContract({
    address: listing.nftContract,
    abi: ERC721_ABI,
    functionName: "name",
  });

  const { data: nftSymbol } = useReadContract({
    address: listing.nftContract,
    abi: ERC721_ABI,
    functionName: "symbol",
  });

  const { data: tokenURI } = useReadContract({
    address: listing.nftContract,
    abi: ERC721_ABI,
    functionName: "tokenURI",
    args: [listing.tokenId],
  });

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!tokenURI) return;
    const uri = tokenURI as string;
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      setImageUrl(uri);
    } else if (uri.startsWith("ipfs://")) {
      setImageUrl(`https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`);
    } else {
      setImageUrl(null);
    }
  }, [tokenURI]);

  const durationDays = Math.round(Number(listing.duration) / 86400);
  const durationDisplay =
    durationDays > 0 ? `${durationDays} Days` : `${Math.round(Number(listing.duration) / 3600)} Hours`;

  // Deterministic fallback visual gradient based on tokenId and address
  const hashVal = Number(listing.tokenId) % 4;
  const gradientStyles = [
    "from-indigo-900 via-purple-900 to-pink-900",
    "from-cyan-900 via-blue-900 to-indigo-950",
    "from-emerald-900 via-teal-950 to-slate-900",
    "from-fuchsia-950 via-rose-900 to-indigo-950",
  ];

  return (
    <div className="group relative rounded-2xl bg-surface-100/90 border border-white/10 hover:border-brand-cyan/40 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-[0_0_25px_rgba(0,240,255,0.15)]">
      {/* Image / Visual Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-surface-200">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`NFT #${listing.tokenId}`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradientStyles[hashVal]} flex flex-col items-center justify-center p-6 text-center`}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md mb-3 shadow-lg">
              <Sparkles className="w-8 h-8 text-brand-cyan" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-wide">
              {nftName ? String(nftName) : "Cyber Relic"}
            </span>
            <span className="text-xs font-mono text-brand-cyan mt-1">
              Token ID #{listing.tokenId.toString()}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-1">
            <Shield className="w-3 h-3 text-brand-cyan" />
            In Escrow
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-cyan/20 backdrop-blur-md border border-brand-cyan/40 text-brand-cyan">
            {listing.active ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-base truncate group-hover:text-brand-cyan transition-colors">
                {nftName ? `${String(nftName)} #${listing.tokenId}` : `Item #${listing.tokenId}`}
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {nftSymbol ? String(nftSymbol) : "Collection"} • Token #{listing.tokenId.toString()}
              </p>
            </div>
            <Link
              href={`/listing/${listing.listingId.toString()}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
              title="View Details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Owner info */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-2.5">
            <span>Owner</span>
            <span className="font-mono text-slate-300">
              {isOwner ? "You (Owner)" : formatAddress(listing.owner)}
            </span>
          </div>
        </div>

        {/* Pricing & Duration Matrix */}
        <div className="rounded-xl bg-surface-200/60 p-3 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-brand-cyan" />
              Rental Fee:
            </span>
            <span className="text-sm font-extrabold text-white">
              {formatEther(listing.price)} <span className="text-brand-cyan text-xs">BOT</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-purple" />
              Duration:
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {durationDisplay}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isOwner ? (
            <Link
              href={`/listing/${listing.listingId.toString()}`}
              className="w-full block text-center py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              Manage Listing
            </Link>
          ) : (
            <button
              onClick={() => onRentClick && onRentClick(listing)}
              disabled={!listing.active}
              className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-brand-cyan to-brand-purple text-black hover:opacity-95 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              Rent NFT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
