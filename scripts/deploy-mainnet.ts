import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("==================================================");
  console.log("DEPLOYING BOTRENT PROTOCOL TO MAINNET (LEAN GAS)");
  console.log("==================================================");
  console.log("Deployer Address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(balance), "BOT");
  console.log("Network Name:    ", network.name);
  console.log("Chain ID:        ", network.chainId.toString());

  // Get current network gas price
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
  console.log("Network GasPrice:", ethers.formatUnits(gasPrice, "gwei"), "Gwei");

  // Pre-flight check: ensure deployer has enough funds
  const BotRentFactory = await ethers.getContractFactory("BotRent");
  const deployTx = await BotRentFactory.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas(deployTx);
  const estimatedCost = estimatedGas * gasPrice;

  console.log("Estimated Gas:   ", estimatedGas.toString(), "units");
  console.log("Estimated Cost:  ", ethers.formatEther(estimatedCost), "BOT");

  if (balance < estimatedCost) {
    console.error("\n❌ INSUFFICIENT BALANCE FOR GAS!");
    console.error(`Required minimum: ~${ethers.formatEther(estimatedCost)} BOT`);
    console.error(`Current balance:   ${ethers.formatEther(balance)} BOT`);
    console.error(`Please fund deployer ${deployer.address} with at least 0.04 BOT on BOT Chain Mainnet (Chain ID 677).`);
    process.exit(1);
  }

  // 1. Deploy fresh BotRent with exact minimal gasPrice
  console.log("\nDeploying BotRent contract to BOT Chain Mainnet...");
  const botRent = await BotRentFactory.deploy({
    gasPrice: gasPrice,
  });
  console.log("Waiting for deployment confirmation...");
  await botRent.waitForDeployment();
  const botRentAddress = await botRent.getAddress();
  const receipt = await botRent.deploymentTransaction()?.wait();
  console.log("✓ BotRent deployed at:", botRentAddress);
  if (receipt) {
    console.log("  Gas Used: ", receipt.gasUsed.toString());
    console.log("  Total Fee:", ethers.formatEther(receipt.gasUsed * receipt.gasPrice), "BOT");
  }

  // 2. Update .env.local
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("NEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=${botRentAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_BOTRENT_CONTRACT_ADDRESS=${botRentAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("\n✓ Updated .env.local with deployed BotRent contract address");
  }

  // 3. Update src/config/contracts.ts
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
  console.log("MAINNET DEPLOYMENT COMPLETE");
  console.log("==================================================");
  console.log("Project Name:             BotRent");
  console.log("Contract:                 BotRent.sol");
  console.log("Network:                  BOT Chain Mainnet");
  console.log("Chain ID:                 677");
  console.log("BotRent Contract Address: ", botRentAddress);
  console.log("Explorer BotRent:         https://scan.botchain.ai/address/" + botRentAddress);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
