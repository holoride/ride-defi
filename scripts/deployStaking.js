const { ethers, network, run } = require("hardhat");

async function main() {
  // TODO: Update parameters before deploy
  const rewardsPercentage = 1000; // 10'000 means 100% so 1'000 is 10%
  const stakingTerm1 = 60 * 60 * 24; // staking term expressed in seconds
  const stakingTerm2 = 60 * 60 * 24 * 2; // staking term expressed in seconds
  const stakingTerm3 = 60 * 60 * 24 * 3; // staking term expressed in seconds
  let tokenToStakeAddress = "0x..."; // Address of the token to stake 
  let rewardTokenAddress = "0x..."; // Address of the token used for the rewards

  // If on Goerli, deploy both test staking and reward token
  if (network.name === "goerli") {
    const TokenFactory = await ethers.getContractFactory("GenericERC20");

    console.log("Deploy staking token...");
    const StakingToken = await TokenFactory.deploy("StakingToken", "ST");
    await StakingToken.deployed();
    console.log("Staking token deployed at address:", StakingToken.address);

    console.log("Deploy reward token...");
    const RewardToken = await TokenFactory.deploy("RewardToken", "RT");
    await RewardToken.deployed();
    console.log("Reward token deployed at address:", RewardToken.address);

    tokenToStakeAddress = StakingToken.address;
    rewardTokenAddress = RewardToken.address;
  }
  
  // Deploy 
  console.log("Deploying Staking smart contract (short term) ...");
  const StakingFactory = await ethers.getContractFactory("Staking");
  const Staking1 = await StakingFactory.deploy(tokenToStakeAddress, rewardTokenAddress, rewardsPercentage, stakingTerm1);
  await Staking1.deployed();
  console.log("Deployed Staking smart contract (short term) at address:", Staking1.address);

  console.log("Deploying Staking smart contract (mid term) ...");
  const Staking2 = await StakingFactory.deploy(tokenToStakeAddress, rewardTokenAddress, rewardsPercentage, stakingTerm2);
  await Staking2.deployed();
  console.log("Deployed Staking smart contract (short term) at address:", Staking2.address);

  console.log("Deploying Staking smart contract (long term) ...");
  const Staking3 = await StakingFactory.deploy(tokenToStakeAddress, rewardTokenAddress, rewardsPercentage, stakingTerm3);
  await Staking3.deployed();
  console.log("Deployed Staking smart contract (short term) at address:", Staking3.address);

  // Verify on explorer
  if (network.name !== "hardhat" && network.name !== "localhost") {
    // await 10 seconds
    console.log("Wait 10 seconds before verification...")
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verify Staking
    try {
      await run("verify:verify", {
        address: Staking1.address,
        constructorArguments: [tokenToStakeAddress, rewardTokenAddress, rewardsPercentage, stakingTerm1]
      })
    } catch (error) {
      console.log("Staking smart contract already verified.")
    }

    // Verify test tokens
    if (network.name === "goerli") {
      try {
        await run("verify:verify", {
          address: tokenToStakeAddress,
          constructorArguments: ["StakingToken", "ST"]
        })
      } catch (error) {
        console.log("Staking token already verified.")
      }

      try {
        await run("verify:verify", {
          address: rewardTokenAddress,
          constructorArguments: ["RewardToken", "RT"]
        })
      } catch (error) {
        console.log("Reward token already verified.")
      }
    }
  }

  // Summary
  console.log("Deployed smart contracts:")
  console.log("Staking Smart Contract (short term):", Staking1.address);
  console.log("Staking Smart Contract (mid term):", Staking2.address);
  console.log("Staking Smart Contract (long term):", Staking3.address);
  console.log("Staking Token:", tokenToStakeAddress);
  console.log("Reward Token:", rewardTokenAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
