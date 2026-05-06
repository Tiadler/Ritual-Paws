const hre = require('hardhat');

async function main() {
  if (!/^0x[0-9a-fA-F]{64}$/.test(process.env.PRIVATE_KEY || '')) {
    throw new Error('PRIVATE_KEY trong .env chưa đúng. Deploy cần private key đủ dạng 0x + 64 ký tự hex.');
  }
  const RitualTom = await hre.ethers.getContractFactory('RitualTom');
  const ritualTom = await RitualTom.deploy();
  await ritualTom.waitForDeployment();

  const address = await ritualTom.getAddress();
  console.log('RitualTom deployed to:', address);
  console.log('Set NEXT_PUBLIC_RITUALTOM_ADDRESS=' + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
