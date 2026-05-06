require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const RAW_PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const PRIVATE_KEY = /^0x[0-9a-fA-F]{64}$/.test(RAW_PRIVATE_KEY) ? RAW_PRIVATE_KEY : '';
const RITUAL_RPC = process.env.RITUAL_RPC || 'https://rpc.ritualfoundation.org';

module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    ritual: {
      url: RITUAL_RPC,
      chainId: 1979,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
