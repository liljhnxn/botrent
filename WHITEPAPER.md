# BotRent Protocol: Whitepaper & Pitch Deck

> **"Rent NFTs. Own the Experience."**  
> *A Non-Custodial Decentralized NFT Rental Protocol Built for Botchain & EVM Ecosystems.*

---

## Executive Summary

**BotRent** is a production-grade, non-custodial decentralized NFT rental protocol deployed on the **Botchain / Bohr Network** (Chain ID: `968`). 

The current Web3 asset economy faces a fundamental liquidity and accessibility paradox: valuable NFTs (game assets, metaverse plots, community passes, and domain handles) sit idle in cold wallets, while prospective participants face exorbitant capital barriers to access utility.

BotRent solves this friction by providing a trustless, smart-contract-enforced escrow marketplace. Token owners deposit ERC-721 digital assets into protocol escrow and define customized rental fees (in native `BOT`) and durations. Renters obtain verifiable on-chain utility rights without purchasing the underlying digital asset. The protocol enforces automated returns, reentrancy-guarded earnings distribution, and dual-authorization lifecycle terminations with zero administrative backdoors.

---

## 1. Problem Statement

### 1.1 Capital Lockup & Idle Assets
Over $15 billion in utility-bearing NFTs remain dormant in private wallets. Owners have no native, risk-free mechanism to generate passive yield on their collections without risking total asset forfeiture in unsecured lending pools.

### 1.2 Prohibitive Barriers to Entry in GameFi & Metaverse
Top-tier gaming items and virtual real estate cost hundreds or thousands of dollars. New players are priced out of competitive Web3 gaming, creating a high churn rate and stunting ecosystem adoption.

### 1.3 Custody Risk & Under-Collateralization in Traditional Rentals
Existing rental approaches either require heavy collateralization (defeating the purpose of affordable access) or rely on off-chain trust arrangements vulnerable to defaults and fraud.

---

## 2. The BotRent Solution

BotRent introduces an **escrow-backed, duration-based rental architecture**:

```
+-------------------+                          +--------------------+
|  NFT Owner        |                          |  Prospective User  |
|  (Yield Earner)   |                          |  (Utility Renter)  |
+-------------------+                          +--------------------+
          |                                               |
 1. Deposit & createListing()                   2. rent() with native BOT
          |                                               |
          v                                               v
+--------------------------------------------------------------------+
|                       BotRent Escrow Contract                      |
|                     (Chain ID: 968 / Botchain)                     |
|                                                                    |
|  - Escrow Token Vault (IERC721Receiver)                            |
|  - Timestamp Validity Engine (startedAt -> expiresAt)             |
|  - ReentrancyGuarded Pull-Payment Balance (pendingEarnings)        |
+--------------------------------------------------------------------+
          |                                               |
 4. withdrawEarnings()                          3. Verified On-Chain Rights
    & reclaim expired asset                        + extendRental() option
```

* **Zero Collateral Required**: Renters only pay the specified duration fee in native `BOT`.
* **Guaranteed Asset Preservation**: Assets are locked in non-custodial smart contracts and returned directly to the owner once expired.
* **Instant Earnings Crediting**: Rental payments immediately accrue to the owner's `pendingEarnings` balance with pull-pattern safety (`nonReentrant`).
* **Authoritative On-Chain State**: Games, DAOs, and dApps can query `isRentalExpired()` and `getRental()` directly on-chain to gate features in real time.

---

## 3. Protocol Architecture & Technical Specifications

### 3.1 Smart Contract Layer
* **Language & Standard**: Solidity `^0.8.24` / ERC-721 standard compliant.
* **Escrow Mechanism**: Safe ERC-721 deposit via `safeTransferFrom` and `IERC721Receiver`.
* **State Structs**:
  * `Listing`: Tracking `listingId`, `owner`, `nftContract`, `tokenId`, `price`, `duration`, `active`, and `createdAt`.
  * `Rental`: Tracking `rentalId`, `renter`, `owner`, `amount`, `startedAt`, `expiresAt`, and status flags.
* **Security Primitives**: OpenZeppelin v5.1.0 `ReentrancyGuard`, Checks-Effects-Interactions pattern, and strict caller validation (`onlyOwner` / `onlyRenter` / third-party expiry return).

### 3.2 Key Protocol Functions
* `createListing(address nftContract, uint256 tokenId, uint256 price, uint256 duration)`: Locks asset in escrow.
* `cancelListing(uint256 listingId)`: Returns asset if unrented.
* `rent(uint256 listingId) payable`: Atomically initiates rental, starts duration clock, and credits owner fee.
* `extendRental(uint256 rentalId) payable`: Adds duration cycles seamlessly before expiry.
* `endRental(uint256 rentalId)`: Triggers automatic escrow release to the original owner.
* `withdrawEarnings()`: Pull-payment model prevents reentrancy or DoS attacks.

### 3.3 Deployed Infrastructure
* **Network**: Botchain / Bohr Testnet (Chain ID `968`)
* **RPC Endpoint**: `https://rpc.bohr.life`
* **BotRent Protocol Address**: `0x71fa5827144aAd0Af7B3C85873c4BF7741fCc10A`
* **Mock NFT (Bohr Cyber Relics)**: `0xCCcbB597A4dD701E77F9427cf2a0907EDD35A640`
* **Block Explorer**: `https://scan.bohr.life`

---

## 4. Market Categories & Use Cases

1. **Web3 Gaming & GameFi**: Renting competitive weapons, level boosts, and avatars for e-sports tournaments or seasonal quests.
2. **Metaverse Real Estate**: Temporary leasing of 3D parcels, event spaces, and exhibition booths.
3. **Utility & Membership Passes**: Accessing token-gated DAO voting, alpha clubs, discord roles, or software licenses for fixed durations.
4. **Decentralized Domains (BotNS)**: Short-term branding or marketing campaigns utilizing specialized `.bot` identity handles.

---

## 5. Pitch Deck Slides Outline (10-Slide Pitch)

* **Slide 1: Title & Vision** — *BotRent: Rent NFTs. Own the Experience.*
* **Slide 2: The Problem** — Idle NFT capital, priced-out gamers, and unsecured rental attempts.
* **Slide 3: The Solution** — Trustless, non-custodial escrow rental powered by high-speed, low-fee Botchain.
* **Slide 4: Product & Live Demo** — Fully functional Next.js 14 frontend, wagmi v2 wallet integration, dynamic countdowns.
* **Slide 5: Protocol Architecture** — Visual flow of escrow custody, rental rights issuance, and automated asset recovery.
* **Slide 6: Business Model & Monetization** — Sustainable protocol fee (0.5%–2%) on rental transaction volume + featured listing promotions.
* **Slide 7: Market Opportunity** — $15B+ total NFT market cap expanding into $30B+ Web3 gaming and metaverse rental economy.
* **Slide 8: Security & Testing** — 100% automated test coverage (15 Hardhat unit tests), zero-admin backdoor policy, pull-payment safety.
* **Slide 9: Roadmap** — ERC-4907 integration, ERC-20 payment support, BotNS resolution, automated keeper bot settlement.
* **Slide 10: Call to Action & Links** — Try the live testnet deployment, explore verified smart contracts, and join our developer ecosystem.

---

## 6. Official Links & Resources

* **Live dApp & Explorer**: Deployed on Botchain Testnet (https://scan.bohr.life/address/0x71fa5827144aAd0Af7B3C85873c4BF7741fCc10A)
* **GitHub Repository**: https://github.com/liljhnxn/botrent
* **Whitepaper & Specs**: https://github.com/liljhnxn/botrent/blob/main/WHITEPAPER.md
