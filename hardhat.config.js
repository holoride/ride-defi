require("dotenv").config();

require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-web3");
require('hardhat-abi-exporter');
require('solidity-docgen');

module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },

  networks: {
    ethereum: {
      url: process.env.ETHEREUM_RPC_PROVIDER,
      accounts: [process.env.ETHEREUM_PRIVATE_KEY]
    },
    goerli: {
      url: process.env.GOERLI_RPC_PROVIDER,
      accounts: [process.env.GOERLI_PRIVATE_KEY]
    }
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },

  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    spacing: 2,
  },

  docgen: {
    outputDir: "./docs",
    pages: "files",
    exclude: [
      "interfaces/IStaking.sol",
      "interfaces/IFarming.sol",
      "mocks/GenericERC20.sol"
    ]
  }
};
