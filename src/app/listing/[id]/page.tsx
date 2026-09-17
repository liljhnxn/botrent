"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { 
  BOTRENT_CONTRACT_ADDRESS, 
  BOTRENT_ABI, 
  ERC721_ABI 
} from "@/config/contracts";
import { Listing } from "@/types";
import { formatAddress } from "@/utils/botns";
import { formatEther } from "viem";
import { RentModal } from "@/components/RentModal";
import { botchainTestnet } from "@/config/chains";
import { 
  ArrowLeft, 
  Clock, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  ExternalLink, 
  XCircle, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import Link from "next/link";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const listingId = BigInt(params.id as string);

  const { writeContractAsync } = useWriteContract();
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Fetch listing data
  const { data: rawListing, refetch: refetchListing, isLoading } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getListing",
    args: [listingId],
  });

  // Check active rental if any
  const { data: activeRentalId } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "listingActiveRental",
    args: [listingId],
  });

  const listing: Listing | null = rawListing
    ? {
        listingId: (rawListing as any).listingId,
        owner: (rawListing as any).owner,
        nftContract: (rawListing as any).nftContract,
        tokenId: (rawListing as any).tokenId,
        price: (rawListing as any).price,
        duration: (rawListing as any).duration,
        active: (rawListing as any).active,
        createdAt: (rawListing as any).createdAt,
      }
    : null;

  // Read NFT Metadata from ERC-721
  const { data: nftName } = useReadContract({
    address: listing?.nftContract,
    abi: ERC721_ABI,
    functionName: "name",
  });

  const { data: nftSymbol } = useReadContract({
    address: listing?.nftContract,
    abi: ERC721_ABI,
    functionName: "symbol",
  });

  const { data: tokenURI } = useReadContract({
    address: listing?.nftContract,
    abi: ERC721_ABI,
    functionName: "tokenURI",
    args: listing ? [listing.tokenId] : undefined,
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

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-cyan animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading on-chain listing details...</p>
      </div>
    );
  }

  if (!listing || listing.listingId === 0n) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Listing Not Found</h2>
        <p className="text-xs text-slate-400">This listing ID does not exist on Botchain Testnet.</p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
      </div>
    );
  }

  const isOwner = address?.toLowerCase() === listing.owner.toLowerCase();
  const durationDays = Math.round(Number(listing.duration) / 86400);
  const durationDisplay =
    durationDays > 0 ? `${durationDays} Days` : `${Math.round(Number(listing.duration) / 3600)} Hours`;

  const createdDate = new Date(Number(listing.createdAt) * 1000);

  // Cancel listing flow
  const handleCancelListing = async () => {
    try {
      setCancelling(true);
      setCancelError(null);
      await writeContractAsync({
        address: BOTRENT_CONTRACT_ADDRESS,
        abi: BOTRENT_ABI,
        functionName: "cancelListing",
        args: [listing.listingId],
      });
      await refetchListing();
      router.push("/dashboard/owner");
    } catch (err: any) {
      console.error("Cancel listing error:", err);
      setCancelError(err?.shortMessage || err?.message || "Failed to cancel listing.");
    } finally {
      setCancelling(false);
    }
  };

  const hashVal = Number(listing.tokenId) % 4;
  const gradientStyles = [
    "from-indigo-900 via-purple-900 to-pink-900",
    "from-cyan-900 via-blue-900 to-indigo-950",
    "from-emerald-900 via-teal-950 to-slate-900",
    "from-fuchsia-950 via-rose-900 to-indigo-950",
  ];

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore Listings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Image Card */}
        <div className="rounded-3xl bg-surface-100 border border-white/10 overflow-hidden shadow-2xl flex flex-col">
          <div className="relative aspect-square w-full bg-surface-200">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={`Token #${listing.tokenId}`}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${gradientStyles[hashVal]} flex flex-col items-center justify-center p-8 text-center`}
              >
                <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md mb-4 shadow-xl">
                  <Sparkles className="w-10 h-10 text-brand-cyan" />
                </div>
                <span className="font-extrabold text-white text-2xl tracking-wide">
                  {nftName ? String(nftName) : "Cyber Relic"}
                </span>
                <span className="text-sm font-mono text-brand-cyan mt-1">
                  Token ID #{listing.tokenId.toString()}
                </span>
              </div>
            )}

            {/* Escrow badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md border border-white/10 text-brand-cyan flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-cyan" />
                Protocol Escrow Custody
              </span>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 bg-surface-200/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contract Verification
            </h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">ERC-721 Contract:</span>
              <a
                href={`${botchainTestnet.blockExplorers.default.url}/token/${listing.nftContract}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-brand-cyan hover:underline flex items-center gap-1"
              >
                {formatAddress(listing.nftContract)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Escrow Address:</span>
              <a
                href={`${botchainTestnet.blockExplorers.default.url}/address/${BOTRENT_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-slate-300 hover:text-white flex items-center gap-1"
              >
                {formatAddress(BOTRENT_CONTRACT_ADDRESS)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Details & Action */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                  Listing #{listing.listingId.toString()}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                    listing.active
                      ? "bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30"
                      : "bg-brand-rose/15 text-brand-rose border border-brand-rose/30"
                  }`}
                >
                  {listing.active ? "Available for Rent" : "Inactive / Rented"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
                {nftName ? `${String(nftName)} #${listing.tokenId}` : `NFT #${listing.tokenId}`}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {nftSymbol ? String(nftSymbol) : "Collection"} • Token ID #{listing.tokenId.toString()}
              </p>
            </div>

            {/* Price Card */}
            <div className="rounded-2xl bg-surface-100/90 border border-white/10 p-6 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Rental Fee
                  </span>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    {formatEther(listing.price)}{" "}
                    <span className="text-brand-cyan text-lg">BOT</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Duration
                  </span>
                  <div className="text-xl font-bold text-slate-200 mt-1 flex items-center gap-1.5 justify-end">
                    <Clock className="w-4 h-4 text-brand-purple" />
                    {durationDisplay}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Listed By:</span>
                  <p className="font-mono font-medium text-slate-200 mt-0.5">
                    {isOwner ? "You (Owner)" : formatAddress(listing.owner)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Listed On:</span>
                  <p className="font-medium text-slate-200 mt-0.5">
                    {createdDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Escrow Disclaimer Notice */}
            <div className="rounded-2xl bg-surface-100/60 border border-brand-cyan/20 p-5 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Escrow Rental Guarantee:</strong> BotRent establishes temporary on-chain rental rights and holds the NFT in escrow during the rental period. External games or applications must integrate with BotRent to enforce those rental rights.
              </p>
            </div>

            {cancelError && (
              <div className="text-xs text-brand-rose bg-brand-rose/10 border border-brand-rose/20 rounded-xl p-3">
                {cancelError}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-white/10">
            {isOwner ? (
              <div className="space-y-3">
                <button
                  onClick={handleCancelListing}
                  disabled={cancelling || !listing.active}
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-brand-rose/20 hover:bg-brand-rose/30 border border-brand-rose/40 text-brand-rose transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancelling Listing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Cancel Listing & Withdraw NFT
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  You own this listing. Cancelling returns the NFT immediately from escrow to your wallet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setIsRentModalOpen(true)}
                  disabled={!listing.active}
                  className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-purple text-black hover:opacity-95 transition-all shadow-[0_0_25px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Coins className="w-4 h-4" />
                  {listing.active ? `Rent Now for ${formatEther(listing.price)} BOT` : "Currently Unavailable"}
                </button>
                {!isConnected && (
                  <p className="text-[11px] text-slate-400 text-center">
                    Connect your Web3 wallet to rent this NFT on Botchain Testnet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <RentModal
        listing={listing}
        isOpen={isRentModalOpen}
        onClose={() => setIsRentModalOpen(false)}
        onSuccess={() => {
          refetchListing();
        }}
      />
    </div>
  );
}
