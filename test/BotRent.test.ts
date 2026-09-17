import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { BotRent, MockNFT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BotRent Protocol", function () {
  let botRent: BotRent;
  let mockNFT: MockNFT;
  let owner: HardhatEthersSigner;
  let renter: HardhatEthersSigner;
  let otherUser: HardhatEthersSigner;

  const RENTAL_PRICE = ethers.parseEther("1.0"); // 1 BOT
  const RENTAL_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
  let tokenId: bigint;

  beforeEach(async function () {
    [owner, renter, otherUser] = await ethers.getSigners();

    const BotRentFactory = await ethers.getContractFactory("BotRent");
    botRent = (await BotRentFactory.deploy()) as BotRent;
    await botRent.waitForDeployment();

    const MockNFTFactory = await ethers.getContractFactory("MockNFT");
    mockNFT = (await MockNFTFactory.deploy("Dragon Sword", "DSWD")) as MockNFT;
    await mockNFT.waitForDeployment();

    // Mint NFT to owner
    const tx = await mockNFT.mint(owner.address, "ipfs://QmDragonSword102");
    await tx.wait();
    tokenId = 1n;
  });

  describe("Listing Management", function () {
    it("should allow owner to list NFT and transfer it to escrow", async function () {
      await mockNFT.connect(owner).approve(await botRent.getAddress(), tokenId);

      await expect(
        botRent
          .connect(owner)
          .createListing(await mockNFT.getAddress(), tokenId, RENTAL_PRICE, RENTAL_DURATION)
      )
        .to.emit(botRent, "ListingCreated")
        .withArgs(
          1n,
          owner.address,
          await mockNFT.getAddress(),
          tokenId,
          RENTAL_PRICE,
          BigInt(RENTAL_DURATION)
        );

      // Contract now holds NFT
      expect(await mockNFT.ownerOf(tokenId)).to.equal(await botRent.getAddress());

      const listing = await botRent.getListing(1n);
      expect(listing.owner).to.equal(owner.address);
      expect(listing.price).to.equal(RENTAL_PRICE);
      expect(listing.duration).to.equal(BigInt(RENTAL_DURATION));
      expect(listing.active).to.be.true;

      const available = await botRent.getAvailableListings();
      expect(available.length).to.equal(1);
      expect(available[0]).to.equal(1n);
    });

    it("should reject listing if price is 0 or duration is 0", async function () {
      await mockNFT.connect(owner).approve(await botRent.getAddress(), tokenId);

      await expect(
        botRent.connect(owner).createListing(await mockNFT.getAddress(), tokenId, 0, RENTAL_DURATION)
      ).to.be.revertedWith("Price must be greater than 0");

      await expect(
        botRent.connect(owner).createListing(await mockNFT.getAddress(), tokenId, RENTAL_PRICE, 0)
      ).to.be.revertedWith("Duration must be greater than 0");
    });

    it("should reject listing if caller does not own the NFT", async function () {
      await expect(
        botRent.connect(renter).createListing(await mockNFT.getAddress(), tokenId, RENTAL_PRICE, RENTAL_DURATION)
      ).to.be.revertedWith("Caller does not own NFT");
    });

    it("should allow owner to cancel listing and return NFT from escrow", async function () {
      await mockNFT.connect(owner).approve(await botRent.getAddress(), tokenId);
      await botRent.connect(owner).createListing(await mockNFT.getAddress(), tokenId, RENTAL_PRICE, RENTAL_DURATION);

      await expect(botRent.connect(owner).cancelListing(1n))
        .to.emit(botRent, "ListingCanceled")
        .withArgs(1n, owner.address);

      expect(await mockNFT.ownerOf(tokenId)).to.equal(owner.address);
      const listing = await botRent.getListing(1n);
      expect(listing.active).to.be.false;

      const available = await botRent.getAvailableListings();
      expect(available.length).to.equal(0);
    });

    it("should reject cancellation by non-owner", async function () {
      await mockNFT.connect(owner).approve(await botRent.getAddress(), tokenId);
      await botRent.connect(owner).createListing(await mockNFT.getAddress(), tokenId, RENTAL_PRICE, RENTAL_DURATION);

      await expect(botRent.connect(renter).cancelListing(1n)).to.be.revertedWith(
        "Caller is not listing owner"
      );
    });
  });

  describe("Rental Flow", function () {
    beforeEach(async function () {
      await mockNFT.connect(owner).approve(await botRent.getAddress(), tokenId);
      await botRent.connect(owner).createListing(await mockNFT.getAddress(), tokenId, RENTAL_PRICE, RENTAL_DURATION);
    });

    it("should allow a user to rent an available listing with exact payment", async function () {
      const tx = await botRent.connect(renter).rent(1n, { value: RENTAL_PRICE });
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      const expectedExpiresAt = BigInt(block!.timestamp + RENTAL_DURATION);

      await expect(tx)
        .to.emit(botRent, "RentalCreated")
        .withArgs(1n, 1n, renter.address, owner.address, RENTAL_PRICE, expectedExpiresAt);

      const rental = await botRent.getRental(1n);
      expect(rental.renter).to.equal(renter.address);
      expect(rental.owner).to.equal(owner.address);
      expect(rental.active).to.be.true;
      expect(rental.expiresAt).to.equal(expectedExpiresAt);

      // Pending earnings credited to owner
      expect(await botRent.getOwnerEarnings(owner.address)).to.equal(RENTAL_PRICE);

      // Listing no longer available for rent
      const available = await botRent.getAvailableListings();
      expect(available.length).to.equal(0);
    });

    it("should reject renting with incorrect payment", async function () {
      await expect(
        botRent.connect(renter).rent(1n, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Incorrect rental payment");

      await expect(
        botRent.connect(renter).rent(1n, { value: ethers.parseEther("1.5") })
      ).to.be.revertedWith("Incorrect rental payment");
    });

    it("should reject owner renting own NFT", async function () {
      await expect(
        botRent.connect(owner).rent(1n, { value: RENTAL_PRICE })
      ).to.be.revertedWith("Owner cannot rent own NFT");
    });

    it("should allow renter to extend rental before expiration", async function () {
      await botRent.connect(renter).rent(1n, { value: RENTAL_PRICE });
      const rentalBefore = await botRent.getRental(1n);

      // Advance time by 2 days (less than 7 days)
      await time.increase(2 * 24 * 60 * 60);

      const newExpectedExpires = rentalBefore.expiresAt + BigInt(RENTAL_DURATION);

      await expect(botRent.connect(renter).extendRental(1n, { value: RENTAL_PRICE }))
        .to.emit(botRent, "RentalExtended")
        .withArgs(1n, newExpectedExpires);

      const rentalAfter = await botRent.getRental(1n);
      expect(rentalAfter.expiresAt).to.equal(newExpectedExpires);
      expect(await botRent.getOwnerEarnings(owner.address)).to.equal(RENTAL_PRICE * 2n);
    });

    it("should reject extension by non-renter or if rental expired", async function () {
      await botRent.connect(renter).rent(1n, { value: RENTAL_PRICE });

      // Non-renter
      await expect(
        botRent.connect(otherUser).extendRental(1n, { value: RENTAL_PRICE })
      ).to.be.revertedWith("Caller is not renter");

      // Advance time past expiration
      await time.increase(RENTAL_DURATION + 10);
      expect(await botRent.isRentalExpired(1n)).to.be.true;

      // Reject expired extension
      await expect(
        botRent.connect(renter).extendRental(1n, { value: RENTAL_PRICE })
      ).to.be.revertedWith("Rental already expired");
    });

    it("should allow renter to end rental early and return NFT to owner", async function () {
      await botRent.connect(renter).rent(1n, { value: RENTAL_PRICE });

      await expect(botRent.connect(renter).endRental(1n))
        .to.emit(botRent, "RentalEnded")
        .withArgs(1n, renter.address, owner.address);

      // NFT returned to owner
      expect(await mockNFT.ownerOf(tokenId)).to.equal(owner.address);

      const rental = await botRent.getRental(1n);
      expect(rental.active).to.be.false;

      // Double-return fails
      await expect(botRent.connect(renter).endRental(1n)).to.be.revertedWith(
        "Rental is not active"
      );
    });

    it("should allow anyone to end rental once expired and return NFT to owner", async function () {
      await botRent.connect(renter).rent(1n, { value: RENTAL_PRICE });

      // Before expiration, unauthorized user cannot end rental
      await expect(botRent.connect(otherUser).endRental(1n)).to.be.revertedWith(
        "Caller not authorized to end active rental"
      );

      // Fast forward past expiration
      await time.increase(RENTAL_DURATION + 1);

      // Now otherUser can end rental
      await expect(botRent.connect(otherUser).endRental(1n))
        .to.emit(botRent, "RentalEnded")
        .withArgs(1n, renter.address, owner.address);

      expect(await mockNFT.ownerOf(tokenId)).to.equal(owner.address);
    });

    it("should prevent cancelling listing while rented", async function () {
      await botRent.connect(renter).rent(1n, { value: RENTAL_PRICE });

      await expect(botRent.connect(owner).cancelListing(1n)).to.be.revertedWith(
        "NFT is currently rented"
      );
    });
  });

  describe("Earnings and Withdrawals", function () {
    beforeEach(async function () {
      await mockNFT.connect(owner).approve(await botRent.getAddress(), tokenId);
      await botRent.connect(owner).createListing(await mockNFT.getAddress(), tokenId, RENTAL_PRICE, RENTAL_DURATION);
      await botRent.connect(renter).rent(1n, { value: RENTAL_PRICE });
    });

    it("should allow owner to withdraw earnings and reset pending earnings to 0", async function () {
      expect(await botRent.getOwnerEarnings(owner.address)).to.equal(RENTAL_PRICE);

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

      const tx = await botRent.connect(owner).withdrawEarnings();
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      await expect(tx)
        .to.emit(botRent, "EarningsWithdrawn")
        .withArgs(owner.address, RENTAL_PRICE);

      expect(await botRent.getOwnerEarnings(owner.address)).to.equal(0n);

      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + RENTAL_PRICE - gasCost);
    });

    it("should reject withdrawal if caller has no earnings", async function () {
      await expect(botRent.connect(otherUser).withdrawEarnings()).to.be.revertedWith(
        "No earnings to withdraw"
      );
    });
  });
});
