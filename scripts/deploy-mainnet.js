const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

async function main() {
  const rpcUrl = process.env.BOTCHAIN_MAINNET_RPC_URL || "https://rpc.botchain.ai";
  const chainId = 677;

  console.log("==================================================");
  console.log("BOTRENT PROTOCOL MAINNET DEPLOYMENT (LOW GAS)");
  console.log("==================================================");
  console.log("Network Name:     BOT Chain Mainnet");
  console.log("Chain ID:         " + chainId);
  console.log("RPC Endpoint:     " + rpcUrl);

  const rawKey = (process.env.BOTCHAIN_PRIVATE_KEY || "").trim();
  if (!rawKey) {
    console.error("❌ Error: BOTCHAIN_PRIVATE_KEY is missing in .env.local!");
    process.exit(1);
  }
  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

  // Use staticNetwork to prevent hanging or duplicate network queries
  const network = new ethers.Network("botchainMainnet", chainId);
  const provider = new ethers.JsonRpcProvider(rpcUrl, network, { staticNetwork: network });
  const wallet = new ethers.Wallet(formattedKey, provider);

  console.log("Deployer Address: " + wallet.address);

  // Fetch balance and gas price in parallel
  const [balance, feeData] = await Promise.all([
    provider.getBalance(wallet.address),
    provider.getFeeData(),
  ]);

  const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
  console.log("Deployer Balance: " + ethers.formatEther(balance) + " BOT");
  console.log("Current Gas Price:" + ethers.formatUnits(gasPrice, "gwei") + " Gwei");

  // Load contract artifact
  const artifactPath = path.join(__dirname, "../artifacts/contracts/BotRent.sol/BotRent.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Contract artifact not found at: " + artifactPath);
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  // Pre-calculate gas estimation and deployment cost
  const deployTx = await factory.getDeployTransaction();
  const estimatedGas = await provider.estimateGas(deployTx);
  // Add 5% buffer on gas limit to prevent out-of-gas while maintaining exact lowest gas fee
  const gasLimit = (estimatedGas * 105n) / 100n;
  const estimatedCost = gasLimit * gasPrice;

  console.log("Estimated Gas:    " + estimatedGas.toString() + " units");
  console.log("Gas Limit:        " + gasLimit.toString() + " units");
  console.log("Total Est. Cost:  " + ethers.formatEther(estimatedCost) + " BOT");

  if (balance < estimatedCost) {
    console.log("==================================================");
    console.error("❌ INSUFFICIENT BALANCE FOR GAS!");
    console.error("Required minimum: ~" + ethers.formatEther(estimatedCost) + " BOT");
    console.error("Current balance:   " + ethers.formatEther(balance) + " BOT");
    console.error("Shortfall:         " + ethers.formatEther(estimatedCost - balance) + " BOT");
    console.log("--------------------------------------------------");
    console.log("Please transfer at least " + ethers.formatEther(estimatedCost) + " BOT to deployer address:");
    console.log(">>> " + wallet.address + " <<<");
    console.log("Then re-run: npm run deploy:mainnet");
    console.log("==================================================");
    process.exit(1);
  }

  console.log("\n🚀 Sending deployment transaction with minimal gas price...");
  const contract = await factory.deploy({
    gasPrice: gasPrice,
    gasLimit: gasLimit,
  });

  const txHash = contract.deploymentTransaction().hash;
  console.log("Transaction Hash: " + txHash);
  console.log("Explorer Tx:       https://scan.botchain.ai/tx/" + txHash);
  console.log("Waiting for confirmation on BOT Chain Mainnet...");

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  const receipt = await contract.deploymentTransaction().wait();

  console.log("\n✓ Contract successfully deployed!");
  console.log("✓ BotRent Address: " + contractAddress);
  if (receipt) {
    console.log("✓ Actual Gas Used: " + receipt.gasUsed.toString());
    console.log("✓ Actual Gas Fee:  " + ethers.formatEther(receipt.gasUsed * receipt.gasPrice) + " BOT");
  }

  // Update .env.local
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("NEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    if (envContent.includes("NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=.*/,
        `NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=677`
      );
    }
    if (envContent.includes("NEXT_PUBLIC_BOTCHAIN_RPC_URL=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_BOTCHAIN_RPC_URL=.*/,
        `NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.botchain.ai`
      );
    }
    if (envContent.includes("NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL=.*/,
        `NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL=https://scan.botchain.ai`
      );
    }
    fs.writeFileSync(envPath, envContent);
    console.log("✓ Updated .env.local with deployed contract address & Mainnet config");
  }

  // Update src/config/contracts.ts
  const contractsConfigPath = path.join(process.cwd(), "src", "config", "contracts.ts");
  if (fs.existsSync(contractsConfigPath)) {
    let contractsContent = fs.readFileSync(contractsConfigPath, "utf-8");
    contractsContent = contractsContent.replace(
      /"0x[a-fA-F0-9]{40}"\) as `0x\$\{string\}`/,
      `"${contractAddress}") as \`0x\${string}\``
    );
    fs.writeFileSync(contractsConfigPath, contractsContent);
    console.log("✓ Updated src/config/contracts.ts with new BotRent address");
  }

  console.log("\n==================================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("==================================================");
  console.log("Protocol:         BotRent");
  console.log("Network:          BOT Chain Mainnet (Chain ID 677)");
  console.log("Contract Address: " + contractAddress);
  console.log("Explorer:         https://scan.botchain.ai/address/" + contractAddress);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Unhandled deployment error:", err);
  process.exit(1);
});
