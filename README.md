# Ride DeFi
RIDE staking and farming smart contracts for EVM blockchain (currently developed for Ethereum).

## Dependencies
First step is to download this repository:
```
$ git clone https://github.com/holoride/ride-defi.git
```
Then you have to install all the Node dependencies
```
$ npm i
```
Last step is to configure the .env file. The format is
```
ETHEREUM_PRIVATE_KEY=
GOERLI_PRIVATE_KEY=
ETHEREUM_RPC_PROVIDER=
GOERLI_RPC_PROVIDER=
ETHERSCAN_API_KEY=
```
You will also find a .env.template file that you can rename and use instead of creating a new one from scratch.

## Deploy Staking
In order to deploy the staking smart contract you have to update the staking parameters in the script scripts/deployStaking.js. 
Once done, you can just run
```
$ npx hardhat run scripts/deployStaking.js --network <network name>
```
If you are deploying on Goerli, it will automatically deploy two ERC20 tokens called RewardToken and StakingToken. The wallet that runs the deploy will also receive one million of both for testing.
Latest deploeyed smart contracts can be found here:
```
Staking Smart Contract (short term): 0xE440b4C6eEc9961F13B9904a8a647a62441a16aF
Staking Smart Contract (mid term): 0x846fE993Fa8F0ddfde34f43d372ceD6527BEe076
Staking Smart Contract (long term): 0x134d71DCbF5802CEa182BeE171c151CB9Eb87ac0
Staking Token: 0x75021b8FdE01A51D984D27f2a012F7eaA8453778
Reward Token: 0x0781cEC875cB76f6F76D47172195b69018f8C2Fd
```

## Deploy Farming
In order to deploy the farming smart contract you have to update the farming parameters in the script scripts/deployFarming.js. 
Once done, you can just run
```
$ npx hardhat run scripts/deployFarming.js --network <network name>
```
If you are deploying on Goerli, it will automatically deploy two ERC20 tokens called RewardToken and LPToken. The wallet that runs the deploy will also receive one million of both for testing.
Latest deploeyed smart contracts can be found here:
```
Farming Smart Contract: 0x81b628bEBfcab17e9A15ad1548d58283E8B8B4b0
LP Token: 0xf36dC610A2CF10cac0C6A35C2d21C72539D18Ffd
Reward Token: 0x92cCB84A3D958335EFd602f0CDAF647d5429c6b9
```

## Test
In order to run tests you just have to run
```
$ npx hardhat test
```

## Coverage
In order to generate the coverage report you have to run
```
$ npx hardhat coverage
```

This is the current status
File                   |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------------|----------|----------|----------|----------|----------------|
 contracts/            |    98.11 |    94.29 |      100 |       98 |                |
  Farming.sol          |    96.55 |     87.5 |      100 |     96.1 |    113,221,222 |
  Staking.sol          |      100 |      100 |      100 |      100 |                |
 contracts/interfaces/ |      100 |      100 |      100 |      100 |                |
  IFarming.sol         |      100 |      100 |      100 |      100 |                |
  IStaking.sol         |      100 |      100 |      100 |      100 |                |
 contracts/mocks/      |      100 |      100 |      100 |      100 |                |
  GenericERC20.sol     |      100 |      100 |      100 |      100 |                |
All files              |    98.13 |    94.29 |      100 |    98.01 |                |

## Documentation
You can find the updated documentation the [docs folder](./docs/). In order to generate it you have to run
```
$ npx hardhat docgen
```

## Other blockchains
You can easily add support for other EVM blockchains by adding a new network filed in the hardhat configuration file hardhat.config.js. The source code should not be changed.