const { ethers, network, run } = require("hardhat");

async function main() {
  const deployer = await ethers.getSigner()

  // TODO: Update parameters before deploy
  const rewardsPercentage1 = 300; // 10'000 means 100% so 1'000 is 10%
  const rewardsPercentage2 = 750; // 10'000 means 100% so 1'000 is 10%
  const rewardsPercentage3 = 1800; // 10'000 means 100% so 1'000 is 10%
  const stakingTerm1 = 60 * 60 * 24 * 90; // staking term expressed in seconds
  const stakingTerm2 = 60 * 60 * 24 * 180; // staking term expressed in seconds
  const stakingTerm3 = 60 * 60 * 24 * 365; // staking term expressed in seconds
  const fundAmount1 = ethers.utils.parseEther("1000000")
  const fundAmount2 = ethers.utils.parseEther("1000000")
  const fundAmount3 = ethers.utils.parseEther("1000000")
  const shouldFund = true; // If true, funds the contract
  let tokenToStakeAddress = "0xf97e2A78f1f3D1fD438ff7cC3BB7De01E5945B83"; // Address of the token to stake 
  let rewardTokenAddress = "0xf97e2A78f1f3D1fD438ff7cC3BB7De01E5945B83"; // Address of the token used for the rewards
  let RewardToken = null;
  let StakingToken = null;

  // If on Goerli, deploy both test staking and reward token
  if (network.name === "sepolia" || network.name === "goerli") {
    const TokenFactory = await ethers.getContractFactory("GenericERC20");

    console.log("Deploy staking token...");
    StakingToken = await TokenFactory.deploy("StakingToken", "ST");
    await StakingToken.deployed();
    console.log("Staking token deployed at address:", StakingToken.address);

    console.log("Deploy reward token...");
    RewardToken = await TokenFactory.deploy("RewardToken", "RT");
    await RewardToken.deployed();
    console.log("Reward token deployed at address:", RewardToken.address);

    tokenToStakeAddress = StakingToken.address;
    rewardTokenAddress = RewardToken.address;
  } else {
    const Erc20Factory = await ethers.getContractFactory("GenericERC20")
    StakingToken = Erc20Factory.attach(tokenToStakeAddress)
    RewardToken = Erc20Factory.attach(rewardTokenAddress)
  }

  console.log("Configuration:")
  console.log("Deployer wallet:", deployer.address)
  console.log("Staking Token:", await StakingToken.symbol(), StakingToken.address, tokenToStakeAddress)
  console.log("Reward Token:", await RewardToken.symbol(), RewardToken.address, rewardTokenAddress)
  console.log("Term 1:", stakingTerm1 / 86400, "days")
  console.log("Term 2:", stakingTerm2 / 86400, "days")
  console.log("Term 3:", stakingTerm3 / 86400, "days")
  console.log("Amount 1:", ethers.utils.formatEther(fundAmount1))
  console.log("Amount 2:", ethers.utils.formatEther(fundAmount2))
  console.log("Amount 3:", ethers.utils.formatEther(fundAmount3))
  console.log("Return 1:", rewardsPercentage1 / 10000 * 100, "%")
  console.log("Return 2:", rewardsPercentage2 / 10000 * 100, "%")
  console.log("Return 3:", rewardsPercentage3 / 10000 * 100, "%")
  console.log("APR 1:", rewardsPercentage1 / 10000 * 100 * 4, "%")
  console.log("APR 2:", rewardsPercentage2 / 10000 * 100 * 2, "%")
  console.log("APR 3:", rewardsPercentage3 / 10000 * 100 * 1, "%")
  console.log("Should fund?", shouldFund ? "YES" : "NO")
  
  console.log("Waiting 10 seconds...")
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log("Starting deploy...")
  
  // Deploy 
  console.log("Deploying Staking smart contract (short term) ...");
  const StakingFactory = await ethers.getContractFactory("Staking");
  const Staking1 = await StakingFactory.deploy(tokenToStakeAddress, rewardTokenAddress, rewardsPercentage1, stakingTerm1);
  await Staking1.deployed();
  console.log("Deployed Staking smart contract (short term) at address:", Staking1.address);

  console.log("Deploying Staking smart contract (mid term) ...");
  const Staking2 = await StakingFactory.deploy(tokenToStakeAddress, rewardTokenAddress, rewardsPercentage2, stakingTerm2);
  await Staking2.deployed();
  console.log("Deployed Staking smart contract (short term) at address:", Staking2.address);

  console.log("Deploying Staking smart contract (long term) ...");
  const Staking3 = await StakingFactory.deploy(tokenToStakeAddress, rewardTokenAddress, rewardsPercentage3, stakingTerm3);
  await Staking3.deployed();
  console.log("Deployed Staking smart contract (short term) at address:", Staking3.address);

  // Fund
  if (shouldFund) {
    // Short term
    console.log("Approving funds for short term staking...")
    let tx = await RewardToken.approve(Staking1.address, fundAmount1)
    await tx.wait()
    console.log("Funds approved. Now funding short term staking...")
    tx = await Staking1.addRewards(fundAmount1)
    await tx.wait()
    console.log("Short term staking funded.")

    // Mid term
    console.log("Approving funds for mid term staking...")
    tx = await RewardToken.approve(Staking2.address, fundAmount2)
    await tx.wait()
    console.log("Funds approved. Now funding mid term staking...")
    tx = await Staking2.addRewards(fundAmount2)
    await tx.wait()
    console.log("Mid term staking funded.")

    // Long term
    console.log("Approving funds for long term staking...")
    tx = await RewardToken.approve(Staking3.address, fundAmount3)
    await tx.wait()
    console.log("Funds approved. Now funding long term staking...")
    tx = await Staking3.addRewards(fundAmount3)
    await tx.wait()
    console.log("Long term staking funded.")
  }

  // Verify on explorer
  if (network.name !== "hardhat" && network.name !== "localhost") {
    // await 10 seconds
    console.log("Wait 10 seconds before verification...")
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verify Staking
    try {
      await run("verify:verify", {
        address: Staking1.address,
        constructorArguments: [tokenToStakeAddress, rewardTokenAddress, rewardsPercentage1, stakingTerm1]
      })
    } catch (error) {
      console.log("Staking smart contract already verified.")
    }

    // await 10 seconds
    console.log("Wait 10 seconds before verification...")
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verify test tokens
    try {
      await run("verify:verify", {
        address: tokenToStakeAddress,
        constructorArguments: ["StakingToken", "ST"]
      })
    } catch (error) {
      console.log("Staking token already verified.")
    }

    // await 10 seconds
    console.log("Wait 10 seconds before verification...")
    await new Promise(resolve => setTimeout(resolve, 10000));

    try {
      await run("verify:verify", {
        address: rewardTokenAddress,
        constructorArguments: ["RewardToken", "RT"]
      })
    } catch (error) {
      console.log("Reward token already verified.")
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
