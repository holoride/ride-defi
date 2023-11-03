const { ethers, network, run } = require("hardhat");

async function main() {
  const deployer = await ethers.getSigner()

  // TODO: Update parameters before deploy
  const rewardsPerBlock = ethers.utils.parseEther("9"); //TODO: Update
  const startingBlockNumber = await ethers.provider.getBlockNumber() + (60 * 60 * 3) / 12; // 12 hours after deployment
  const shouldFundFarming = true;
  const fundingAmount = ethers.utils.parseEther("11499993")
  const shouldCreatePool = true;

  let lpTokenAddress = "0x49492de97028992a2d1f056A62ae98840Aa85306"; // Address of the lp token
  let rewardTokenAddress = "0xf97e2A78f1f3D1fD438ff7cC3BB7De01E5945B83"; // Address of the token used for the reward
  let rewardToken = null;
  let lpToken = null;

  // If on Goerli, deploy both test lp and reward token
  if (network.name === "sepolia" || network.name === "goerli") {
    const TokenFactory = await ethers.getContractFactory("GenericERC20");

    console.log("Deploy LP token...");
    lpToken = await TokenFactory.deploy("LP Token", "LPT");
    await lpToken.deployed();
    console.log("LP token deployed at address:", lpToken.address);

    console.log("Deploy reward token...");
    rewardToken = await TokenFactory.deploy("RewardToken", "RT");
    await rewardToken.deployed();
    console.log("Reward token deployed at address:", rewardToken.address);

    lpTokenAddress = lpToken.address;
    rewardTokenAddress = rewardToken.address;
  } else {
    const Erc20Factory = await ethers.getContractFactory("GenericERC20")
    rewardToken = Erc20Factory.attach(rewardTokenAddress)
    lpToken = Erc20Factory.attach(lpTokenAddress)
  }

  console.log("Configuration:")
  console.log("Deployer wallet:", deployer.address)
  console.log("LP Token address:", lpToken.address, lpTokenAddress, await lpToken.symbol())
  console.log("Reward Token address:", rewardToken.address, rewardTokenAddress, await rewardToken.symbol())
  console.log("Reward per block:", ethers.utils.formatEther(rewardsPerBlock))
  console.log("Starting block:", startingBlockNumber)
  console.log("Funding amount:", ethers.utils.formatEther(fundingAmount))
  console.log("Expected duration:", (fundingAmount.div(rewardsPerBlock).mul(12).toNumber()) / 86400, "days" )
  console.log("Should fund the contract?", shouldFundFarming ? "YES" : "NO")
  console.log("Should create farming pool?", shouldCreatePool ? "YES" : "NO")

  console.log("Waiting 10 seconds...")
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log("Starting deploy...")

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

    // If should create pool
    if (shouldCreatePool) {
      console.log("Approving transfer of 1 wei of LPs...")
      let tx = await lpToken.approve(Farming.address, "1")
      await tx.wait()
      console.log("Amount approved.")

      console.log("Creating farming pool")
      tx = await Farming.add(1000, lpTokenAddress, true)
      await tx.wait()
      console.log("Pool created.")
    }
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
