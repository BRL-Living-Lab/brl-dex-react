// Import dependencies

// import HDWalletProvider from '@truffle/hdwallet-provider';
// import fs from 'fs';
// import  homedir  from 'os';
const HDWalletProvider = require('@truffle/hdwallet-provider');

const { ConfigHelper } = require('@oceanprotocol/lib');
require('dotenv').config();

// Get configuration for the given network
let oceanConfig = new ConfigHelper().getConfig("goerli");

// If using local development environment, read the addresses from local file.
// The local deployment address file can be generated using barge.
// if (process.env.OCEAN_NETWORK === 'development') {
//   const addressData = JSON.parse(
//     fs.readFileSync(
//       process.env.ADDRESS_FILE
//         || `${homedir}/.ocean/ocean-contracts/artifacts/address.json`,
//       'utf8'
//     )
//   );
//   const addresses = addressData[process.env.OCEAN_NETWORK];

//   oceanConfig = {
//     ...oceanConfig,
//     oceanTokenAddress: addresses.Ocean,
//     poolTemplateAddress: addresses.poolTemplate,
//     fixedRateExchangeAddress: addresses.FixedPrice,
//     dispenserAddress: addresses.Dispenser,
//     erc721FactoryAddress: addresses.ERC721Factory,
//     sideStakingAddress: addresses.Staking,
//     opfCommunityFeeCollector: addresses.OPFCommunityFeeCollector
//   };
// }

oceanConfig = {
  ...oceanConfig,
  nodeUri: "https://eth-mainnet.g.alchemy.com/v2/EhZLivAIhUJP71-mGHaq6hndI3sx4A3H",
  // Set optional properties - Provider URL and Aquarius URL
  metadataCacheUri: process.env.AQUARIUS_URL || oceanConfig.metadataCacheUri,
  providerUri: process.env.PROVIDER_URL || oceanConfig.providerUri
};

console.log(oceanConfig);

// window.ethereum.request({ method: 'eth_requestAccounts' });

const web3Provider = new HDWalletProvider(
  "f2166e7f9373243ec52b3801c60b86dc5ef6c2dbb4c3a016f02cd3a8b9d35d5d",
  oceanConfig.nodeUri
);

module.exports = {
  web3Provider,
  oceanConfig
};