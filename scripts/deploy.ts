import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("==================================================");
  console.log("DEPLOYING BOTRENT PROTOCOL");
  console.log("==================================================");
  console.log("Deployer Address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(balance), "BOT");
  console.log("Network Name:    ", network.name);
  console.log("Chain ID:        ", network.chainId.toString());

  // 1. Deploy fresh BotRent
  console.log("\nDeploying BotRent contract to Botchain Testnet...");
  const BotRentFactory = await ethers.getContractFactory("BotRent");
  const botRent = await BotRentFactory.deploy();
  await botRent.waitForDeployment();
  const botRentAddress = await botRent.getAddress();
  console.log("✓ BotRent deployed at:", botRentAddress);

  // 2. Reuse or Deploy MockNFT
  let mockNFTAddress = process.env.NEXT_PUBLIC_MOCK_NFT_CONTRACT_ADDRESS;
  let mockNFT: any;

  if (mockNFTAddress && (await ethers.provider.getCode(mockNFTAddress)).length > 2) {
    console.log("\n✓ Reusing existing MockNFT at:", mockNFTAddress);
    mockNFT = await ethers.getContractAt("MockNFT", mockNFTAddress);
  } else {
    console.log("\nDeploying MockNFT (Bohr Cyber Relics)...");
    const MockNFTFactory = await ethers.getContractFactory("MockNFT");
    mockNFT = await MockNFTFactory.deploy("Bohr Cyber Relics", "BCR");
    await mockNFT.waitForDeployment();
    mockNFTAddress = await mockNFT.getAddress();
    console.log("✓ MockNFT deployed at:", mockNFTAddress);
  }

  // 3. Mint demo NFT & create initial listing on the new BotRent contract
  try {
    console.log("\nMinting and listing demo NFT in protocol escrow...");
    const mintTx = await mockNFT.mint(
      deployer.address,
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    );
    const receipt = await mintTx.wait();
    console.log("✓ Minted demo NFT to deployer");

    // Approve new BotRent contract
    // Find minted tokenId or use recent
    const tokenId = 1n; // or newly minted
    try {
      const approveTx = await mockNFT.approve(botRentAddress, tokenId);
      await approveTx.wait();
      console.log("✓ Approved BotRent for Token ID", tokenId.toString());

      // Create initial listing
      const listTx = await botRent.createListing(
        mockNFTAddress,
        tokenId,
        ethers.parseEther("0.05"),
        BigInt(7 * 24 * 3600)
      );
      await listTx.wait();
      console.log("✓ Created initial listing on new BotRent contract (Token ID 1, 0.05 BOT, 7 days)");
    } catch (listErr) {
      console.warn("Could not create initial listing on Token ID 1:", (listErr as any).message);
    }
  } catch (err) {
    console.warn("Notice during initial mint/listing:", err);
  }

  // 4. Update .env.local
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    envContent = envContent.replace(
      /NEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=${botRentAddress}`
    );
    if (mockNFTAddress) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_MOCK_NFT_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_MOCK_NFT_CONTRACT_ADDRESS=${mockNFTAddress}`
      );
    }
    fs.writeFileSync(envPath, envContent);
    console.log("\n✓ Updated .env.local with deployed contract addresses");
  }

  // 5. Update src/config/contracts.ts
  const contractsConfigPath = path.join(process.cwd(), "src", "config", "contracts.ts");
  if (fs.existsSync(contractsConfigPath)) {
    let contractsContent = fs.readFileSync(contractsConfigPath, "utf-8");
    contractsContent = contractsContent.replace(
      /"0x[a-fA-F0-9]{40}"\) as `0x\$\{string\}`/,
      `"${botRentAddress}") as \`0x\${string}\``
    );
    fs.writeFileSync(contractsConfigPath, contractsContent);
    console.log("✓ Updated src/config/contracts.ts with new BotRent address");
  }

  console.log("\n==================================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("==================================================");
  console.log("Project Name:             BotRent");
  console.log("Contract:                 BotRent.sol");
  console.log("Network:                  Botchain Testnet");
  console.log("Chain ID:                 968");
  console.log("BotRent Contract Address: ", botRentAddress);
  console.log("MockNFT Contract Address: ", mockNFTAddress);
  console.log("Explorer BotRent:         https://scan.bohr.life/address/" + botRentAddress);
  console.log("Explorer MockNFT:         https://scan.bohr.life/address/" + mockNFTAddress);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
