"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { parseEther, isAddress } from "viem";
import { 
  BOTRENT_CONTRACT_ADDRESS, 
  BOTRENT_ABI, 
  MOCK_NFT_CONTRACT_ADDRESS, 
  ERC721_ABI 
} from "@/config/contracts";
import { 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  ExternalLink,
  Coins,
  Clock,
  Wand2
} from "lucide-react";
import { botchainTestnet } from "@/config/chains";

export default function CreateListingPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Form State
  const [nftContract, setNftContract] = useState<string>(MOCK_NFT_CONTRACT_ADDRESS);
  const [tokenId, setTokenId] = useState<string>("");
  const [price, setPrice] = useState<string>("0.05");
  const [durationDays, setDurationDays] = useState<string>("7");

  // Interaction State
  const [isApproving, setIsApproving] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [isMintingTestNFT, setIsMintingTestNFT] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [listingSuccess, setListingSuccess] = useState<boolean>(false);

  // Validate Contract Address
  const isValidContract = isAddress(nftContract);
  const parsedTokenId = tokenId.trim() !== "" ? BigInt(tokenId) : undefined;

  // 1. Read ownerOf(tokenId)
  const { data: ownerOfToken, refetch: refetchOwner, isLoading: checkingOwner } = useReadContract({
    address: isValidContract ? (nftContract as `0x${string}`) : undefined,
    abi: ERC721_ABI,
    functionName: "ownerOf",
    args: parsedTokenId !== undefined ? [parsedTokenId] : undefined,
    query: {
      enabled: isValidContract && parsedTokenId !== undefined,
    },
  });

  // 2. Read approval status
  const { data: approvedAddress, refetch: refetchApproval } = useReadContract({
    address: isValidContract ? (nftContract as `0x${string}`) : undefined,
    abi: ERC721_ABI,
    functionName: "getApproved",
    args: parsedTokenId !== undefined ? [parsedTokenId] : undefined,
    query: {
      enabled: isValidContract && parsedTokenId !== undefined,
    },
  });

  const { data: isApprovedForAll, refetch: refetchApprovedAll } = useReadContract({
    address: isValidContract ? (nftContract as `0x${string}`) : undefined,
    abi: ERC721_ABI,
    functionName: "isApprovedForAll",
    args: address && isValidContract ? [address, BOTRENT_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address && isValidContract,
    },
  });

  const isOwner =
    address && ownerOfToken
      ? (ownerOfToken as string).toLowerCase() === address.toLowerCase()
      : false;

  const isApproved =
    isApprovedForAll === true ||
    (approvedAddress &&
      (approvedAddress as string).toLowerCase() ===
        BOTRENT_CONTRACT_ADDRESS.toLowerCase());

  const publicClient = usePublicClient();
  const [mintedInfo, setMintedInfo] = useState<{ tokenId: string; txHash: string } | null>(null);

  // Mint Test NFT Helper
  const handleMintTestNFT = async () => {
    if (!address) return;
    try {
      setIsMintingTestNFT(true);
      setErrorMessage(null);
      setMintedInfo(null);
      const randomSeed = Math.floor(Math.random() * 10000);
      const hash = await writeContractAsync({
        address: MOCK_NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: "mint",
        args: [
          address,
          `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`,
        ],
      });

      // Wait for receipt and extract minted Token ID from Transfer event
      let detectedTokenId: string | null = null;
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.logs && receipt.logs.length > 0) {
          // Transfer event topic: Transfer(from, to, tokenId) -> topic[3] is tokenId
          const transferLog = receipt.logs[receipt.logs.length - 1];
          if (transferLog.topics && transferLog.topics[3]) {
            detectedTokenId = BigInt(transferLog.topics[3]).toString();
          }
        }
      }

      setNftContract(MOCK_NFT_CONTRACT_ADDRESS);
      if (detectedTokenId) {
        setTokenId(detectedTokenId);
        setMintedInfo({ tokenId: detectedTokenId, txHash: hash });
      } else {
        setMintedInfo({ tokenId: "Confirmed", txHash: hash });
      }
    } catch (err: any) {
      console.error("Mint error:", err);
      setErrorMessage(err?.shortMessage || err?.message || "Failed to mint test NFT.");
    } finally {
      setIsMintingTestNFT(false);
    }
  };

  // Step 1: Approve
  const handleApprove = async () => {
    if (!isValidContract || parsedTokenId === undefined) return;
    try {
      setIsApproving(true);
      setErrorMessage(null);
      const hash = await writeContractAsync({
        address: nftContract as `0x${string}`,
        abi: ERC721_ABI,
        functionName: "approve",
        args: [BOTRENT_CONTRACT_ADDRESS, parsedTokenId],
      });
      setTxHash(hash);
      await refetchApproval();
      await refetchApprovedAll();
    } catch (err: any) {
      console.error("Approve error:", err);
      setErrorMessage(err?.shortMessage || err?.message || "Approval transaction rejected.");
    } finally {
      setIsApproving(false);
    }
  };

  // Step 2: Create Listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidContract || parsedTokenId === undefined) return;
    try {
      setIsListing(true);
      setErrorMessage(null);
      const priceWei = parseEther(price);
      const durationSeconds = BigInt(Math.max(1, Number(durationDays)) * 86400);

      const hash = await writeContractAsync({
        address: BOTRENT_CONTRACT_ADDRESS,
        abi: BOTRENT_ABI,
        functionName: "createListing",
        args: [nftContract as `0x${string}`, parsedTokenId, priceWei, durationSeconds],
      });

      setTxHash(hash);
      setListingSuccess(true);
    } catch (err: any) {
      console.error("Listing error:", err);
      setErrorMessage(err?.shortMessage || err?.message || "Failed to create rental listing.");
    } finally {
      setIsListing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-purple/10 text-brand-purple text-xs font-semibold">
          <PlusCircle className="w-3.5 h-3.5" />
          Escrow Rental Deposit
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          List an NFT for Rent
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Lock your ERC-721 token into protocol escrow and define rental fees in native BOT.
        </p>
      </div>

      {/* Testnet Faucet Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-violet/20 via-surface-100 to-surface-100 border border-brand-violet/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-violet/20 border border-brand-violet/40 flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Need a Test NFT on Botchain?</h4>
            <p className="text-xs text-slate-400">
              Mint a demo token from our verified testnet contract in 1-click.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleMintTestNFT}
          disabled={isMintingTestNFT || !isConnected}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isMintingTestNFT ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Minting Demo NFT...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              Mint Demo NFT
            </>
          )}
        </button>
      </div>

      {/* Minted Token ID Notification */}
      {mintedInfo && (
        <div className="rounded-2xl bg-brand-emerald/15 border border-brand-emerald/40 p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-emerald shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">
                Success! Minted Token ID: <span className="font-mono text-brand-cyan text-sm underline">#{mintedInfo.tokenId}</span>
              </p>
              <p className="text-[11px] text-slate-300">
                This token has been automatically filled into the form below for you.
              </p>
            </div>
          </div>
          <a
            href={`${botchainTestnet.blockExplorers.default.url}/tx/${mintedInfo.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-brand-cyan hover:underline flex items-center gap-1 shrink-0"
          >
            Bohr Scan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {listingSuccess ? (
        <div className="rounded-3xl bg-surface-100 border border-brand-emerald/30 p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-8 h-8 text-brand-emerald" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">NFT Successfully Listed!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Your NFT has been transferred into BotRent protocol escrow. Renters on Botchain Testnet can now discover and rent your asset.
            </p>
          </div>

          {txHash && (
            <div className="pt-1">
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

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push("/explore")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-brand-cyan to-brand-purple text-black hover:opacity-95 transition-all shadow-md"
            >
              View on Explore
            </button>
            <button
              onClick={() => router.push("/dashboard/owner")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all"
            >
              My Listings Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Listing Form */
        <form onSubmit={handleCreateListing} className="rounded-3xl bg-surface-100 border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* NFT Contract Address */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              NFT Contract Address (ERC-721)
            </label>
            <input
              type="text"
              value={nftContract}
              onChange={(e) => setNftContract(e.target.value.trim())}
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-brand-cyan"
              required
            />
            <p className="text-[11px] text-slate-400">
              Supports standard ERC-721 collections on Botchain Testnet. Default is the verified MockNFT contract.
            </p>
          </div>

          {/* Token ID */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Token ID
            </label>
            <input
              type="number"
              min="0"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="e.g. 1"
              className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-brand-cyan"
              required
            />

            {/* Ownership validation badge */}
            {parsedTokenId !== undefined && isValidContract && (
              <div className="pt-1">
                {checkingOwner ? (
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking ownership on Botchain...
                  </span>
                ) : isOwner ? (
                  <span className="text-xs text-brand-emerald flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    You own this token!
                  </span>
                ) : ownerOfToken ? (
                  <span className="text-xs text-brand-rose flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    You do not own this token (Owned by {String(ownerOfToken).slice(0, 8)}...)
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Token not found or query failed.</span>
                )}
              </div>
            )}
          </div>

          {/* Rental Price & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-brand-cyan" />
                Rental Price (in BOT)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.05"
                className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-brand-cyan"
                required
              />
              <p className="text-[11px] text-slate-400">Total fee paid by renter upfront.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-purple" />
                Rental Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="7"
                className="w-full px-4 py-3 rounded-xl bg-surface-200 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-brand-cyan"
                required
              />
              <p className="text-[11px] text-slate-400">Number of days rental remains active.</p>
            </div>
          </div>

          {/* Escrow Custody Notice */}
          <div className="rounded-xl bg-surface-200/60 border border-brand-cyan/20 p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Escrow Rental Guarantee:</strong> BotRent establishes temporary on-chain rental rights and holds the NFT in escrow during the rental period. External games or applications must integrate with BotRent to enforce those rental rights.
            </p>
          </div>

          {errorMessage && (
            <div className="text-xs text-brand-rose bg-brand-rose/10 border border-brand-rose/20 rounded-xl p-3 leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Step 1 & Step 2 Buttons */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            {!isApproved ? (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving || !isOwner || checkingOwner}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-brand-cyan text-black hover:bg-brand-cyan/90 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Approving BotRent Protocol...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Step 1: Approve BotRent Escrow
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-brand-emerald font-semibold bg-brand-emerald/10 border border-brand-emerald/20 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>BotRent contract is approved to transfer this token into escrow.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isApproved || isListing || !isOwner}
              className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-purple text-black hover:opacity-95 transition-all shadow-[0_0_25px_rgba(0,240,255,0.2)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isListing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Listing & Depositing NFT...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Step 2: Create Listing
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
