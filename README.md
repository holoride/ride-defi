# Ride Staking
RIDE staking smart contracts for EVM blockchain (currently developed for Ethereum).

## Dependencies
First step is to download this repository:
```
$ git clone https://github.com/holoride/ride-staking.git
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

## Deploy
In order to deploy the smart contract you have to update the staking parameters in the script scripts/deploy.js. 
Once done, you can just run
```
$ npx hardhat run scripts/deploy.js --network <network name>
```
If you are deploying on Goerli, it will automatically deploy two ERC20 tokens called RewardToken and StakingToken. The wallet that runs the deploy will also receive one million of both for testing.

## Test
In order to run tests you just have to run
```
$ npx hardhat test
```

## Coverage
Updated code coverage
File                   |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------------|----------|----------|----------|----------|----------------|
 contracts/            |      100 |      100 |      100 |      100 |                |
  Staking.sol          |      100 |      100 |      100 |      100 |                |
 contracts/interfaces/ |      100 |      100 |      100 |      100 |                |
  IStaking.sol         |      100 |      100 |      100 |      100 |                |
 contracts/mocks/      |      100 |      100 |      100 |      100 |                |
  GenericERC20.sol     |      100 |      100 |      100 |      100 |                |
All files              |      100 |      100 |      100 |      100 |                |

## Other blockchains
You can easily add support for other EVM blockchains by adding a new network filed in the hardhat configuration file hardhat.config.js. The source code should not be changed.