const { ethers, network, run } = require("hardhat");

async function main() {
  // TODO: Update parameters before deploy
  const rewardsPerBlock = ethers.utils.parseEther("2"); //TODO: Update
  const startingBlockNumber = 8738950; // Update
  const shouldFundFarming = true;
  const fundingAmount = ethers.utils.parseEther("10000000")

  let lpTokenAddress = "0x..."; // Address of the lp token
  let rewardTokenAddress = "0x..."; // Address of the token used for the reward
  let rewardToken = null;

  // If on Goerli, deploy both test lp and reward token
  if (network.name === "goerli") {
    const TokenFactory = await ethers.getContractFactory("GenericERC20");

    console.log("Deploy LP token...");
    const LPToken = await TokenFactory.deploy("LP Token", "LPT");
    await LPToken.deployed();
    console.log("LP token deployed at address:", LPToken.address);

    console.log("Deploy reward token...");
    rewardToken = await TokenFactory.deploy("RewardToken", "RT");
    await rewardToken.deployed();
    console.log("Reward token deployed at address:", rewardToken.address);

    lpTokenAddress = LPToken.address;
    rewardTokenAddress = rewardToken.address;
  }

  // Deploy 
  console.log("Deploying Farming smart contract...");
  const FarmingFactory = await ethers.getContractFactory("Farming");
  const Farming = await FarmingFactory.deploy(rewardTokenAddress, rewardsPerBlock, startingBlockNumber);
  await Farming.deployed();
  console.log("Deployed Farming smart contract at address:", Farming.address);

  // Fund it
  if (shouldFundFarming) {
    console.log("Approving funds for funding...")
    let tx = await rewardToken.approve(Farming.address, fundingAmount)
    await tx.wait()
    console.log("Funds approved.")
  
    console.log("Funding farming...")
    tx = await Farming.fund(fundingAmount)
    await tx.wait()
    console.log("Farming funded.")
  }

  // Verify on explorer
  if (network.name !== "hardhat" && network.name !== "localhost") {
    // await 10 seconds
    console.log("Wait 10 seconds before verification...")
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verify Staking
    try {
      await run("verify:verify", {
        address: Farming.address,
        constructorArguments: [rewardTokenAddress, rewardsPerBlock, startingBlockNumber]
      })
    } catch (error) {
      console.log("Farming smart contract already verified:", error.message)
    }

    // Verify test tokens
    if (network.name === "goerli") {
      try {
        await run("verify:verify", {
          address: tokenToStakeAddress,
          constructorArguments: ["LP Token", "LPT"]
        })
      } catch (error) {
        console.log("LP token already verified:", error.message)
      }

      try {
        await run("verify:verify", {
          address: rewardTokenAddress,
          constructorArguments: ["RewardToken", "RT"]
        })
      } catch (error) {
        console.log("Reward token already verified: ", error.message)
      }
    }
  }

  // Summary
  console.log("Deployed smart contracts:")
  console.log("Farming Smart Contract:", Farming.address);
  console.log("LP Token:", lpTokenAddress);
  console.log("Reward Token:", rewardTokenAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});