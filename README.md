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
Staking Smart Contract: 0x67e946fc4Ab6c06857eab8daFACb7bEC4Fdf527a
Staking Token: 0x10c6bAbA37A37e0f2240d826423D8B54100c0507
Reward Token: 0x6b16b4cb8C2C49fa030deea5B4A6bf1a62E0DAB4
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
Farming Smart Contract: 0x085Ae02A818d94f5f36236b6929BEB9E7f289ac5
LP Token: 0x731AA50791CFe7D86b1A6c537BF216807305C954
Reward Token: 0x4193d112f60fDC4f17b56a8d82Db127330980200
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