"use client";

import React, { useState, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { BOTRENT_CONTRACT_ADDRESS, BOTRENT_ABI } from "@/config/contracts";
import { Listing } from "@/types";
import { ListingCard } from "@/components/ListingCard";
import { RentModal } from "@/components/RentModal";
import { 
  Compass, 
  Search, 
  Filter, 
  RefreshCw, 
  Sparkles, 
  Coins, 
  ShieldCheck,
  PlusCircle
} from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const { address } = useAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);

  // Read available listings IDs
  const { data: availableIds, refetch: refetchAvailable, isLoading: loadingIds } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getAvailableListings",
  });

  // Read total listing count to allow browsing all or available
  const { data: totalListingCount, refetch: refetchCount } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getListingCount",
  });

  // Helper to fetch individual listings
  const listingIds = useMemo(() => {
    if (!availableIds) return [];
    return [...(availableIds as bigint[])];
  }, [availableIds]);

  const handleRentClick = (listing: Listing) => {
    setSelectedListing(listing);
    setIsRentModalOpen(true);
  };

  const handleRefresh = () => {
    refetchAvailable();
    refetchCount();
  };

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-cyan/10 text-brand-cyan text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            Live Marketplace
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Explore NFT Rentals
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Browse verified ERC-721 NFTs held in protocol escrow. Rent temporary rights with native BOT.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-white/10 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Refresh on-chain listings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/create"
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-brand-cyan to-brand-purple text-black hover:opacity-95 transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            List My NFT
          </Link>
        </div>
      </div>

      {/* Protocol Custody Notice */}
      <div className="rounded-xl bg-surface-100/60 border border-brand-cyan/20 p-4 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Escrow Guarantee:</strong> All listed NFTs are securely locked in the BotRent contract on Botchain Testnet. Rentals grant temporary verifiable on-chain rights.
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Token ID or Contract..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-100 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-cyan/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-100 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-brand-cyan/50"
          >
            <option value="all">All Durations</option>
            <option value="short">Short (&le; 3 Days)</option>
            <option value="medium">Medium (4 - 7 Days)</option>
            <option value="long">Long (&gt; 7 Days)</option>
          </select>
        </div>
      </div>

      {/* Grid of Listings */}
      {loadingIds ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading live on-chain listings from Botchain Testnet...</p>
        </div>
      ) : listingIds.length === 0 ? (
        <div className="rounded-2xl bg-surface-100/50 border border-white/10 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <Coins className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-white">No Active Rentals Available</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            There are currently no active rental listings in escrow, or all listed items are currently rented.
          </p>
          <div className="pt-2">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-cyan text-black hover:bg-brand-cyan/90 transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              Be the First to List an NFT
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listingIds.map((id) => (
            <ListingCardFetcher
              key={id.toString()}
              listingId={id}
              searchQuery={searchQuery}
              durationFilter={durationFilter}
              currentUserAddress={address}
              onRentClick={handleRentClick}
            />
          ))}
        </div>
      )}

      {/* Rental Confirmation Modal */}
      <RentModal
        listing={selectedListing}
        isOpen={isRentModalOpen}
        onClose={() => {
          setIsRentModalOpen(false);
          setSelectedListing(null);
        }}
        onSuccess={() => {
          handleRefresh();
        }}
      />
    </div>
  );
}

function ListingCardFetcher({
  listingId,
  searchQuery,
  durationFilter,
  currentUserAddress,
  onRentClick,
}: {
  listingId: bigint;
  searchQuery: string;
  durationFilter: string;
  currentUserAddress?: `0x${string}`;
  onRentClick: (listing: Listing) => void;
}) {
  const { data: listingData } = useReadContract({
    address: BOTRENT_CONTRACT_ADDRESS,
    abi: BOTRENT_ABI,
    functionName: "getListing",
    args: [listingId],
  });

  if (!listingData) return null;

  const listing: Listing = {
    listingId: (listingData as any).listingId,
    owner: (listingData as any).owner,
    nftContract: (listingData as any).nftContract,
    tokenId: (listingData as any).tokenId,
    price: (listingData as any).price,
    duration: (listingData as any).duration,
    active: (listingData as any).active,
    createdAt: (listingData as any).createdAt,
  };

  // Filter Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    const tokenMatch = listing.tokenId.toString().includes(q);
    const contractMatch = listing.nftContract.toLowerCase().includes(q);
    if (!tokenMatch && !contractMatch) return null;
  }

  // Filter Duration
  const days = Math.round(Number(listing.duration) / 86400);
  if (durationFilter === "short" && days > 3) return null;
  if (durationFilter === "medium" && (days < 4 || days > 7)) return null;
  if (durationFilter === "long" && days <= 7) return null;

  const isOwner = currentUserAddress?.toLowerCase() === listing.owner.toLowerCase();

  return (
    <ListingCard
      listing={listing}
      onRentClick={onRentClick}
      isOwner={isOwner}
    />
  );
}
