# BotRent — Decentralized NFT Rental Protocol

> **"Rent NFTs. Own the Experience."**  
> *Temporary NFT access powered by BOT Chain Mainnet (Chain ID: 677).*

---

## 1. Overview
**BotRent** is a production-grade, non-custodial decentralized NFT rental protocol deployed on the **BOT Chain Mainnet**. 

BotRent allows ERC-721 NFT owners to deposit tokens into protocol escrow and offer temporary rental rights for a custom fee in native **BOT** and specified durations. Renters gain verifiable on-chain rental rights without purchasing the underlying digital asset. The original owner maintains underlying economic ownership and can withdraw accumulated rental earnings at any time.

---

## 2. Escrow Rental Protocol Architecture

```
                       +------------------------+
                       |    NFT Owner (Alice)   |
                       +------------------------+
                                   |
                1. approve() & createListing()
                                   v
             +--------------------------------------------+
             |            BotRent Smart Contract          |
             |       (Holds NFT in Protocol Escrow)       |
             +--------------------------------------------+
                 |                                    |
  2. rent() & pay BOT                 3. endRental() (at expiry or early)
  credits owner pendingEarnings       returns NFT to owner
                 v                                    v
       +--------------------+               +--------------------+
       |   Renter (Bob)     |               |     NFT Owner      |
       | Temporary Rights   |               | Recovers NFT Asset |
       +--------------------+               +--------------------+
```

### Protocol Mechanics
1. **Escrow Custody**: When an NFT owner calls `createListing(nftContract, tokenId, price, duration)`, the NFT is transferred into the BotRent escrow contract via `safeTransferFrom`.
2. **Rental Rights**: Renters browse available listings and call `rent(listingId)` with exact `msg.value == listing.price`. The contract creates an on-chain `Rental` record setting `startedAt = block.timestamp` and `expiresAt = block.timestamp + duration`.
3. **Earnings Accounting**: The rental fee is credited immediately to `pendingEarnings[owner]`. The owner can call `withdrawEarnings()` at any time with reentrancy protection.
4. **Extensions**: Renters can call `extendRental(rentalId)` before the rental expires by paying the original listing price to add another duration cycle.
5. **Return & Settlement**: When the rental duration expires (or if the renter decides to end it early), calling `endRental(rentalId)` returns the NFT directly from escrow to the owner and marks the listing and rental inactive, preventing double-returns.

> [!IMPORTANT]
> **Protocol Disclaimer:** BotRent establishes temporary on-chain rental rights and holds the NFT in escrow during the rental period. External games or applications must integrate with BotRent to enforce those rental rights.

---

## 3. BOT Chain Mainnet Deployment

| Component | Address / Details | Official Link |
| :--- | :--- | :--- |
| **BOT Chain Website** | Official Portal | [https://botchain.ai](https://botchain.ai) |
| **BOT Chain Explorer** | BOT Scan Mainnet | [https://scan.botchain.ai](https://scan.botchain.ai) |
| **BotRent Protocol** | `0xd2a552F197B77607Bc4419C02E509db617a3F0a1` | [BOT Scan Contract](https://scan.botchain.ai/address/0xd2a552F197B77607Bc4419C02E509db617a3F0a1) |
| **Network Name** | BOT Chain Mainnet | - |
| **Chain ID** | `677` | - |
| **Native Currency** | `BOT` (18 Decimals) | - |
| **RPC Endpoint** | `https://rpc.botchain.ai` | - |

---

## 4. Smart Contract Architecture (`contracts/BotRent.sol`)

### Core Structs
```solidity
struct Listing {
    uint256 listingId;
    address owner;
    address nftContract;
    uint256 tokenId;
    uint256 price;       // in wei (BOT)
    uint256 duration;    // in seconds
    bool active;
    uint256 createdAt;
}

struct Rental {
    uint256 rentalId;
    uint256 listingId;
    address renter;
    address owner;
    address nftContract;
    uint256 tokenId;
    uint256 amount;
    uint256 startedAt;
    uint256 expiresAt;
    bool active;
}
```

### Key Functions
- `createListing(address nftContract, uint256 tokenId, uint256 price, uint256 duration)`: Locks NFT in escrow and creates listing.
- `cancelListing(uint256 listingId)`: Reclaims NFT from escrow if not currently rented.
- `rent(uint256 listingId) payable`: Secures on-chain rental rights and credits owner.
- `extendRental(uint256 rentalId) payable`: Extends active rental before expiration.
- `endRental(uint256 rentalId)`: Returns NFT to owner upon expiration or by renter.
- `withdrawEarnings()`: Pulls accumulated owner earnings (Checks-Effects-Interactions + `nonReentrant`).
- `isRentalExpired(uint256 rentalId) view`: Authoritative block timestamp verification.
- `getAvailableListings() view`: Returns IDs of currently rentable items in escrow.

---

## 5. Tech Stack

- **Smart Contracts**: Solidity `^0.8.24`, OpenZeppelin Contracts v5.1.0, Hardhat 2.22, TypeChain.
- **Frontend Framework**: Next.js 14 (App Router), React 18, TypeScript 5.
- **Web3 Layer**: wagmi v2, viem, TanStack React Query v5.
- **Styling & UI**: Tailwind CSS, Lucide React icons, Cyberpunk glassmorphism design system.

---

## 6. Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/liljhnxn/botrent.git
cd botrent

# Install dependencies (using legacy peer deps)
npm install --legacy-peer-deps
```

### Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure `.env.local` has:
```env
NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=677
NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.botchain.ai
NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL=https://scan.botchain.ai

NEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=0xd2a552F197B77607Bc4419C02E509db617a3F0a1

# Deployer key for contract deployments (never commit secrets)
BOTCHAIN_PRIVATE_KEY=
```

### Running the Application
```bash
# Start development server
npm run dev

# Compile smart contracts
npm run compile

# Run test suite
npm run test:contracts

# Deploy to BOT Chain Mainnet
npm run deploy:mainnet

# Build production bundle
npm run build
```

---

## 7. Testing & Verification

Comprehensive test suite in `test/BotRent.test.ts` covers:
- Listing creation, validations, and escrow transfer.
- Cancellation restrictions and NFT returns.
- Rental exact payment check and owner restriction.
- Expiration calculations and countdown authority.
- Rental extension restrictions (rejecting expired rentals).
- Return authorizations (renter early return vs third-party expiration return).
- Double-return prevention and state ordering.
- Reentrancy protection on withdrawals and balance zeroing.

Run all tests:
```bash
npx hardhat test
```
Result: **15 passing tests** with full gas reporting.

---

## 8. BotNS-Ready Architecture
BotRent includes the `resolveIdentity(address)` abstraction (`src/utils/botns.ts`). Currently, addresses are securely formatted (`0x1234...5678`), with plug-and-play readiness to resolve `.bot` domain names once the BotNS registry expands to BOT Chain Mainnet.

---

## 9. Security Considerations
- **Non-Custodial Escrow**: Only the original owner or valid protocol functions can trigger asset returns.
- **Reentrancy Protection**: All payment-sensitive and transfer functions utilize OpenZeppelin `ReentrancyGuard`.
- **Checks-Effects-Interactions**: State deactivations (`rental.active = false`) occur prior to external token transfers.
- **Authoritative Timing**: Real-time countdowns are for user experience; expiration is strictly validated using on-chain `block.timestamp`.
- **Zero-Admin Backdoors**: There are no hidden admin drains or unilateral asset seizure capabilities.

---

## 10. Future Roadmap
- ERC-4907 standard dual-role (owner/user) rental support without token escrow.
- Native ERC-20 rental fee payments (e.g. USDT, BUSD on Botchain).
- BotNS `.bot` name resolution integration.
- Automated rental expiration bot / keeper services.
- Multi-day rental bundle discounts and collateralized rentals.
- Verified Game & Metaverse SDK integrations.
