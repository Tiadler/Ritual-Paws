const hre = require("hardhat");

async function main() {
  const RitualPawsCardNFT = await hre.ethers.getContractFactory("RitualPawsCardNFT");
  const nft = await RitualPawsCardNFT.deploy();

  await nft.waitForDeployment();

  console.log("RitualPawsCardNFT deployed to:", await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});