export interface Listing {
  listingId: bigint;
  owner: `0x${string}`;
  nftContract: `0x${string}`;
  tokenId: bigint;
  price: bigint; // wei
  duration: bigint; // seconds
  active: boolean;
  createdAt: bigint;
}

export interface Rental {
  rentalId: bigint;
  listingId: bigint;
  renter: `0x${string}`;
  owner: `0x${string}`;
  nftContract: `0x${string}`;
  tokenId: bigint;
  amount: bigint;
  startedAt: bigint;
  expiresAt: bigint;
  active: boolean;
}

export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  collectionName?: string;
  symbol?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

export type RentalStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "ENDED";

export type TxStep =
  | "idle"
  | "preparing"
  | "confirming"
  | "pending"
  | "confirmed"
  | "failed";

export interface TxStatus {
  step: TxStep;
  title: string;
  message?: string;
  txHash?: `0x${string}`;
  error?: string;
}
