const hre = require('hardhat')
require('dotenv').config()

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_RITUALTOM_ADDRESS

  if (!contractAddress) {
    throw new Error('Missing NEXT_PUBLIC_RITUALTOM_ADDRESS in .env')
  }

  const [signer] = await hre.ethers.getSigners()
  const signerAddress = await signer.getAddress()

  console.log('Withdrawing with wallet:', signerAddress)
  console.log('Contract:', contractAddress)

  const RitualTom = await hre.ethers.getContractAt('RitualTom', contractAddress)

  const balanceBefore = await hre.ethers.provider.getBalance(contractAddress)
  console.log('Contract balance:', hre.ethers.formatEther(balanceBefore), 'RITUAL')

  if (balanceBefore === 0n) {
    console.log('No RITUAL to withdraw.')
    return
  }

  const tx = await RitualTom.withdraw()
  console.log('Withdraw tx:', tx.hash)

  await tx.wait()

  const balanceAfter = await hre.ethers.provider.getBalance(contractAddress)
  console.log('Contract balance after:', hre.ethers.formatEther(balanceAfter), 'RITUAL')
  console.log('Withdraw complete.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})