import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "sepolia",
  chainType: "l1",
});

async function main() {
  const Crowdfund = await ethers.getContractFactory("Crowdfund");
  console.log("Deploying Crowdfund contract...");
  const crowdfund = await Crowdfund.deploy(100, ethers.parseEther("10"));
  await crowdfund.waitForDeployment();
  console.log("Crowdfund deployed to:", crowdfund.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});