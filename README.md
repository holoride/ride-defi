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
Staking Smart Contract (short term): 0x10186c1dE1720022E19cfab17564b012B72239dD
Staking Smart Contract (mid term): 0xBb28edd29a6F53854515fA38E5cf4EAE4157C3F9
Staking Smart Contract (long term): 0x0DA6896D4F9b448734FFf3BEA9a0A8c0B0DC59f9
Staking Token: 0x67e946fc4Ab6c06857eab8daFACb7bEC4Fdf527a
Reward Token: 0x0D1b572bE912ef877a974E404Bf84A85d15D8032
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