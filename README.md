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
SEPOLIA_PRIVATE_KEY=
ETHEREUM_RPC_PROVIDER=
GOERLI_RPC_PROVIDER=
SEPOLIA_RPC_PROVIDER=
ETHERSCAN_API_KEY=
```
You will also find a .env.template file that you can rename and use instead of creating a new one from scratch.

## Deploy Staking
In order to deploy the staking smart contract you have to update the staking parameters in the script scripts/deployStaking.js. 
Once done, you can just run
```
$ npx hardhat run scripts/deployStaking.js --network <network name>
```
If you are deploying on Sepolia or Goerli, it will automatically deploy two ERC20 tokens called RewardToken and StakingToken. The wallet that runs the deploy will also receive one million of both for testing.
Latest deploeyed smart contracts on Sepolia can be found here:
```
Staking Smart Contract (short term): 0xf36dC610A2CF10cac0C6A35C2d21C72539D18Ffd
Staking Smart Contract (mid term): 0x92cCB84A3D958335EFd602f0CDAF647d5429c6b9
Staking Smart Contract (long term): 0x81b628bEBfcab17e9A15ad1548d58283E8B8B4b0
Staking Token: 0x788F50B9b5b3Ec615cadF30De486CB567c592D33
Reward Token: 0x788F50B9b5b3Ec615cadF30De486CB567c592D33
```

Latest deployed smart contracts on Mainnet can be found here
```
Staking Smart Contract (short term): 0x440526b63561a6F3395a204BFe3a6544cb356B86
Staking Smart Contract (mid term): 0x2Cb0F3b5648c794D2943Cf1570d034c91d25bf0E
Staking Smart Contract (long term): 0x548cE6606d196a0aB460762A60636CBe40966944
Staking Token: 0xf97e2A78f1f3D1fD438ff7cC3BB7De01E5945B83 (RIDE)
Reward Token: 0xf97e2A78f1f3D1fD438ff7cC3BB7De01E5945B83 (RIDE)
```

## Deploy Farming
In order to deploy the farming smart contract you have to update the farming parameters in the script scripts/deployFarming.js. 
Once done, you can just run
```
$ npx hardhat run scripts/deployFarming.js --network <network name>
```
If you are deploying on Sepolia or Goerli, it will automatically deploy two ERC20 tokens called RewardToken and LPToken. The wallet that runs the deploy will also receive one million of both for testing.
Latest deploeyed smart contracts on Sepolia can be found here:
```
Farming Smart Contract: 0x483169E793ccA54e4fB0d5FdbD576172a1DD4598
LP Token: 0x823446c1Fdc1b3a00E914B9D65331159746C5743
Reward Token: 0xc6ac5F70C77174Ad10Cf53e6990A22d5f5043be6
```

Latest deployed smart contracts on Mainnet can be found here
```
Farming Smart Contract: 0xc5C54da87A56e4310C7efB4dfF4E411fb63f8EE7
LP Token: 0x49492de97028992a2d1f056A62ae98840Aa85306
Reward Token: 0xf97e2A78f1f3D1fD438ff7cC3BB7De01E5945B83
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