// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BotRent
 * @notice Decentralized Escrow-Based NFT Rental Protocol for Botchain.
 * @dev Establishes temporary on-chain rental rights and holds the NFT in escrow during the rental period.
 * External games or applications must integrate with BotRent to enforce those rental rights.
 */
contract BotRent is IERC721Receiver, ReentrancyGuard {
    struct Listing {
        uint256 listingId;
        address owner;
        address nftContract;
        uint256 tokenId;
        uint256 price; // in wei / BOT
        uint256 duration; // in seconds
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

    // Counters
    uint256 public nextListingId = 1;
    uint256 public nextRentalId = 1;

    // Storage mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Rental) public rentals;
    mapping(address => uint256) public pendingEarnings;
    mapping(uint256 => uint256) public listingActiveRental; // listingId => rentalId

    // Index tracking
    uint256[] private _allListingIds;
    mapping(address => uint256[]) private _ownerListings;
    mapping(address => uint256[]) private _renterRentals;

    // Events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed owner,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 duration
    );

    event ListingCanceled(
        uint256 indexed listingId,
        address indexed owner
    );

    event RentalCreated(
        uint256 indexed rentalId,
        uint256 indexed listingId,
        address indexed renter,
        address owner,
        uint256 amount,
        uint256 expiresAt
    );

    event RentalExtended(
        uint256 indexed rentalId,
        uint256 newExpiresAt
    );

    event RentalEnded(
        uint256 indexed rentalId,
        address indexed renter,
        address indexed owner
    );

    event EarningsWithdrawn(
        address indexed owner,
        uint256 amount
    );

    /**
     * @notice Lists an NFT for temporary rental and deposits it into protocol escrow.
     * @param nftContract Address of the ERC-721 contract.
     * @param tokenId Token ID of the NFT.
     * @param price Rental fee in wei / BOT.
     * @param duration Rental duration in seconds.
     * @return listingId The newly generated listing ID.
     */
    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(price > 0, "Price must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        IERC721 token = IERC721(nftContract);
        require(token.ownerOf(tokenId) == msg.sender, "Caller does not own NFT");
        require(
            token.isApprovedForAll(msg.sender, address(this)) ||
            token.getApproved(tokenId) == address(this),
            "Contract not approved for NFT"
        );

        // Transfer NFT into protocol escrow
        token.safeTransferFrom(msg.sender, address(this), tokenId);

        uint256 listingId = nextListingId++;
        listings[listingId] = Listing({
            listingId: listingId,
            owner: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            duration: duration,
            active: true,
            createdAt: block.timestamp
        });

        _allListingIds.push(listingId);
        _ownerListings[msg.sender].push(listingId);

        emit ListingCreated(
            listingId,
            msg.sender,
            nftContract,
            tokenId,
            price,
            duration
        );

        return listingId;
    }

    /**
     * @notice Cancels an active listing and returns the NFT from escrow to the owner.
     * @param listingId The ID of the listing to cancel.
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.listingId != 0, "Listing does not exist");
        require(listing.active, "Listing is not active");
        require(listing.owner == msg.sender, "Caller is not listing owner");

        uint256 activeRentalId = listingActiveRental[listingId];
        if (activeRentalId != 0) {
            require(!rentals[activeRentalId].active, "NFT is currently rented");
        }

        listing.active = false;

        // Return NFT from escrow to owner
        IERC721(listing.nftContract).safeTransferFrom(address(this), msg.sender, listing.tokenId);

        emit ListingCanceled(listingId, msg.sender);
    }

    /**
     * @notice Rents an available NFT by paying the exact rental price in BOT.
     * @param listingId The ID of the listing to rent.
     * @return rentalId The newly generated rental ID.
     */
    function rent(uint256 listingId) external payable nonReentrant returns (uint256) {
        Listing storage listing = listings[listingId];
        require(listing.listingId != 0, "Listing does not exist");
        require(listing.active, "Listing is not active");
        require(msg.sender != listing.owner, "Owner cannot rent own NFT");
        require(msg.value == listing.price, "Incorrect rental payment");

        uint256 activeRentalId = listingActiveRental[listingId];
        if (activeRentalId != 0) {
            require(!rentals[activeRentalId].active, "NFT is currently rented");
        }

        uint256 rentalId = nextRentalId++;
        uint256 expiresAt = block.timestamp + listing.duration;

        rentals[rentalId] = Rental({
            rentalId: rentalId,
            listingId: listingId,
            renter: msg.sender,
            owner: listing.owner,
            nftContract: listing.nftContract,
            tokenId: listing.tokenId,
            amount: msg.value,
            startedAt: block.timestamp,
            expiresAt: expiresAt,
            active: true
        });

        listingActiveRental[listingId] = rentalId;
        _renterRentals[msg.sender].push(rentalId);

        // Credit owner earnings
        pendingEarnings[listing.owner] += msg.value;

        emit RentalCreated(
            rentalId,
            listingId,
            msg.sender,
            listing.owner,
            msg.value,
            expiresAt
        );

        return rentalId;
    }

    /**
     * @notice Returns whether a rental has expired based on block.timestamp.
     * @param rentalId The ID of the rental.
     */
    function isRentalExpired(uint256 rentalId) public view returns (bool) {
        Rental storage rental = rentals[rentalId];
        require(rental.rentalId != 0, "Rental does not exist");
        return block.timestamp >= rental.expiresAt;
    }

    /**
     * @notice Extends an active rental by paying an additional listing duration fee.
     * @dev Rejects extension if the rental has already expired.
     * @param rentalId The ID of the rental.
     */
    function extendRental(uint256 rentalId) external payable nonReentrant {
        Rental storage rental = rentals[rentalId];
        require(rental.rentalId != 0, "Rental does not exist");
        require(rental.active, "Rental is not active");
        require(msg.sender == rental.renter, "Caller is not renter");
        require(!isRentalExpired(rentalId), "Rental already expired");

        Listing storage listing = listings[rental.listingId];
        require(msg.value == listing.price, "Incorrect extension payment");

        rental.expiresAt += listing.duration;
        pendingEarnings[rental.owner] += msg.value;

        emit RentalExtended(rentalId, rental.expiresAt);
    }

    /**
     * @notice Ends an active rental and returns the NFT from escrow to the owner.
     * @dev Authorized if the caller is the renter OR if the rental has expired.
     * Double-return is prevented by deactivating the rental before the transfer.
     * @param rentalId The ID of the rental.
     */
    function endRental(uint256 rentalId) external nonReentrant {
        Rental storage rental = rentals[rentalId];
        require(rental.rentalId != 0, "Rental does not exist");
        require(rental.active, "Rental is not active");
        require(
            msg.sender == rental.renter || block.timestamp >= rental.expiresAt,
            "Caller not authorized to end active rental"
        );

        // Effects before interactions to prevent double return and reentrancy
        rental.active = false;
        listings[rental.listingId].active = false;
        delete listingActiveRental[rental.listingId];

        // Transfer NFT back to the economic owner
        IERC721(rental.nftContract).safeTransferFrom(address(this), rental.owner, rental.tokenId);

        emit RentalEnded(rentalId, rental.renter, rental.owner);
    }

    /**
     * @notice Allows an NFT owner to withdraw their accumulated rental earnings.
     * @dev Follows Checks-Effects-Interactions pattern and uses nonReentrant.
     */
    function withdrawEarnings() external nonReentrant {
        uint256 amount = pendingEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");

        pendingEarnings[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Earnings transfer failed");

        emit EarningsWithdrawn(msg.sender, amount);
    }

    // --- Read Functions ---

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function getRental(uint256 rentalId) external view returns (Rental memory) {
        return rentals[rentalId];
    }

    function getListingCount() external view returns (uint256) {
        return nextListingId - 1;
    }

    function getRentalCount() external view returns (uint256) {
        return nextRentalId - 1;
    }

    function getOwnerEarnings(address owner) external view returns (uint256) {
        return pendingEarnings[owner];
    }

    function getOwnerListings(address owner) external view returns (uint256[] memory) {
        return _ownerListings[owner];
    }

    function getRenterRentals(address renter) external view returns (uint256[] memory) {
        return _renterRentals[renter];
    }

    function getAvailableListings() external view returns (uint256[] memory) {
        uint256 total = _allListingIds.length;
        uint256 count = 0;

        for (uint256 i = 0; i < total; i++) {
            uint256 id = _allListingIds[i];
            if (listings[id].active) {
                uint256 activeRentalId = listingActiveRental[id];
                if (activeRentalId == 0 || !rentals[activeRentalId].active) {
                    count++;
                }
            }
        }

        uint256[] memory available = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < total; i++) {
            uint256 id = _allListingIds[i];
            if (listings[id].active) {
                uint256 activeRentalId = listingActiveRental[id];
                if (activeRentalId == 0 || !rentals[activeRentalId].active) {
                    available[index] = id;
                    index++;
                }
            }
        }

        return available;
    }

    /**
     * @notice ERC721 Receiver hook to accept safe transfers.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
