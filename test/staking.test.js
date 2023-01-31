const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {
  expectRevert,
  time
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

// Variables
let deployer, staker1, staker2, secondAdmin;
let stakingToken, rewardToken;
let staking;

// Constants
const STAKING_TERM = 60 * 60 * 24 * 30 * 6; // 180 days
const STAKING_REWARDS = 1000; // 10%
const SECOND_STAKING_REWARDS = 500; // 5%
const initialStakingTokenAmont = ethers.utils.parseEther("10000");

const totalRewards = ethers.utils.parseEther("500");

const staker1StakeAmounts = [
  ethers.utils.parseEther("1000"),
  ethers.utils.parseEther("2500"),
  ethers.utils.parseEther("1500"),
]

const staker2StakeAmounts = [
  ethers.utils.parseEther("1000"),
  ethers.utils.parseEther("2000"),
  ethers.utils.parseEther("3000"),
]


describe("Staking", function () {
  
  // Setup test environment
  describe("Deployment", function () {
    it("Should get signers", async () => {
      [deployer, staker1, staker2, secondAdmin] = await ethers.getSigners();
    })

    it("Should deploy staking token", async () => {
      const factory = await ethers.getContractFactory("GenericERC20")
      stakingToken = await factory.deploy("StakingToken", "ST");
    })

    it("Should deploy reward token", async () => {
      const factory = await ethers.getContractFactory("GenericERC20")
      rewardToken = await factory.deploy("RewardToken", "RT");
    })

    it("Deployer should transfer 10000 tokens to staker1 and staker2", async () => {
      await stakingToken.transfer(staker1.address, initialStakingTokenAmont);
      await stakingToken.transfer(staker2.address, initialStakingTokenAmont);
    })

    it("Should deploy Staking smart contract", async () => {
      const factory = await ethers.getContractFactory("Staking")
      staking = await factory.deploy(
        stakingToken.address, 
        rewardToken.address, 
        STAKING_REWARDS, 
        STAKING_TERM
      );
    })
  })

  describe("Add rewards", async () => {

    it("Only admin can add rewards", async () => {
      await rewardToken.connect(staker1).approve(staking.address, totalRewards);
      
      const expectedRevertMessage = "AccessControl: account " + staker1.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
      await expectRevert(staking.connect(staker1).addRewards(totalRewards), expectedRevertMessage);
    })

    it("Should give admin role to secondAdmin", async () => {
      const role = "0x0000000000000000000000000000000000000000000000000000000000000000";
      await staking.grantRole(role, secondAdmin.address);
    })

    it("Should transfer reward tokens to second admin", async () => {
      await rewardToken.transfer(secondAdmin.address, totalRewards);
    })

    it("SecondAdmin should add rewards", async () => {
      await rewardToken.connect(secondAdmin).approve(staking.address, totalRewards);
      await staking.connect(secondAdmin).addRewards(totalRewards);
    })

  })

  // Test staking
  describe("First stake", async () => {

    it("Staker1 is not able to stake without approval", async () => {
      await expectRevert(staking.connect(staker1).stake(staker1StakeAmounts[0]), "ERC20: insufficient allowance");
    })

    it("Staker1 should approve transfer of 1000 tokens to staking", async () => {
      await stakingToken.connect(staker1).approve(staking.address, staker1StakeAmounts[0]);
    })

    it("Staker1 is not able to stake 0 tokens", async () => {
      await expectRevert(staking.connect(staker1).stake("0"), "Invalid amount");
    })

    it("Staker1 should stake", async () => {
      await staking.connect(staker1).stake(staker1StakeAmounts[0]);
    })

    it("Stake queue is updated", async () => {
      const position = await staking.stakeQueue(staker1.address, 0);
      const lastBlockTimestamp = await helpers.time.latest();

      expect(position.amount).to.be.equal(staker1StakeAmounts[0]);
      expect(position.rewardsPercentage).to.be.equal(STAKING_REWARDS);
      expect(position.singleClaimed).to.be.false;
      expect(position.timestamp).to.be.equal(lastBlockTimestamp)
    })

    it("Head and tail are correct", async () => {
      const head = await staking.head(staker1.address);
      const tail = await staking.tail(staker1.address);

      expect(head).to.be.equal(1);
      expect(tail).to.be.equal(0);
    })

    it("Balances should be correct", async () => {
      const staker1Balance = await stakingToken.balanceOf(staker1.address)
      const stakingBalance = await stakingToken.balanceOf(staking.address)

      expect(staker1Balance).to.be.equal(initialStakingTokenAmont.sub(staker1StakeAmounts[0]))
      expect(stakingBalance).to.be.equal(staker1StakeAmounts[0]);
    })

    it("1 month passes", async () => {
      const lastBlockTimestamp = await helpers.time.latest();
      const oneMonth = 60 * 60 * 24 * 30
      const oneMonthLater = lastBlockTimestamp + oneMonth;

      await network.provider.send("evm_mine", [oneMonthLater]);
      // await time.increaseTo(oneMonthLater);

      const updatedTimestamp = await helpers.time.latest();
      expect(updatedTimestamp - lastBlockTimestamp).to.be.equal(oneMonth)
    })

  })

  describe("Update rewards percentage", async () => {

    it("Only admin can update percentage", async () => {
      const expectedMessage = "AccessControl: account " + staker2.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"

      await expectRevert(staking.connect(staker2).updateRewardsPercentage(SECOND_STAKING_REWARDS), expectedMessage);
    })

    it("Should update rewards percentage", async () => {
      await staking.connect(secondAdmin).updateRewardsPercentage(SECOND_STAKING_REWARDS);
    })

    it("Rewards percentage should be updated", async () => {
      const percentage = await staking.rewardsPercentage();

      expect(percentage).to.be.equal(SECOND_STAKING_REWARDS);
    })

  })

  describe("Second stake", async () => {

    it("Staker1 expected rewards should be 0", async () => {
      const rewards = await staking.computeRewards(staker1.address)

      expect(rewards).to.be.equal(0)
    })

    it("Staker1 should approve transfer of 2500 tokens to staking", async () => {
      await stakingToken.connect(staker1).approve(staking.address, staker1StakeAmounts[1]);
    })

    it("Staker1 should stake", async () => {
      await staking.connect(staker1).stake(staker1StakeAmounts[1]);
    })

    it("Stake queue is updated", async () => {
      const position = await staking.stakeQueue(staker1.address, 1);
      const lastBlockTimestamp = await helpers.time.latest();

      expect(position.amount).to.be.equal(staker1StakeAmounts[1]);
      expect(position.rewardsPercentage).to.be.equal(SECOND_STAKING_REWARDS);
      expect(position.singleClaimed).to.be.false;
      expect(position.timestamp).to.be.equal(lastBlockTimestamp)
    })

    it("Head and tail are correct", async () => {
      const head = await staking.head(staker1.address);
      const tail = await staking.tail(staker1.address);

      expect(head).to.be.equal(2);
      expect(tail).to.be.equal(0);
    })

    it("5 month passes", async () => {
      const lastBlockTimestamp = await helpers.time.latest();
      const fiveMonths = 60 * 60 * 24 * 30 * 5
      const fiveMonthsLater = lastBlockTimestamp + fiveMonths;

      await network.provider.send("evm_mine", [fiveMonthsLater]);

      const updatedTimestamp = await helpers.time.latest();
      expect(updatedTimestamp - lastBlockTimestamp).to.be.equal(fiveMonths)
    })

  })

  describe("Third stake", async () => {

    it("Staker1 should approve transfer of 1500 tokens to staking", async () => {
      await stakingToken.connect(staker1).approve(staking.address, staker1StakeAmounts[2]);
    })

    it("Staker1 should stake", async () => {
      await staking.connect(staker1).stake(staker1StakeAmounts[2]);
    })

    it("Stake queue is updated", async () => {
      const position = await staking.stakeQueue(staker1.address, 2);
      const lastBlockTimestamp = await helpers.time.latest();

      expect(position.amount).to.be.equal(staker1StakeAmounts[2]);
      expect(position.rewardsPercentage).to.be.equal(SECOND_STAKING_REWARDS);
      expect(position.singleClaimed).to.be.false;
      expect(position.timestamp).to.be.equal(lastBlockTimestamp);
    })

    it("Head and tail are correct", async () => {
      const head = await staking.head(staker1.address);
      const tail = await staking.tail(staker1.address);

      expect(head).to.be.equal(3);
      expect(tail).to.be.equal(0);
    })

  })

  describe("Unforced withdraw", async () => {

    it("Staker1 should be eligible for the rewards of the first position", async () => {
      const rewards = await staking.computeRewards(staker1.address);

      const expectedRewards = staker1StakeAmounts[0].mul(STAKING_REWARDS).div("10000");
      expect(rewards).to.be.equal(expectedRewards)
    })

    it("Staker1 should unstake and receive rewards for the first position", async () => {
      const stakingTokenBalanceBefore = await stakingToken.balanceOf(staker1.address);
      const rewardTokenBalanceBefore = 0; // await rewardToken.balanceOf(staker1.address);

      await staking.connect(staker1).unstake();

      const stakingTokenBalanceAfter = await stakingToken.balanceOf(staker1.address);
      const rewardTokenBalanceAfter = await rewardToken.balanceOf(staker1.address);
      
      const stakingTokenDiff = stakingTokenBalanceAfter.sub(stakingTokenBalanceBefore);
      const rewardTokenDiff = rewardTokenBalanceAfter.sub(rewardTokenBalanceBefore);

      const expectedRewards = staker1StakeAmounts[0].div("10")

      expect(stakingTokenDiff).to.be.equal(staker1StakeAmounts[0]);
      expect(rewardTokenDiff).to.be.equal(expectedRewards)
    })

    it("Rewards for staker1 should be 0", async () => {
      const rewards = await staking.computeRewards(staker1.address);

      expect(rewards).to.be.equal(0)
    })

    it("Available rewards should be decreased", async () => {
      const available = await staking.availableRewards();
      const expected = totalRewards.sub(staker1StakeAmounts[0].mul(STAKING_REWARDS).div("10000"));
      expect(available).to.be.equal(expected)
    })

    it("One month passes", async () => {
      const lastBlockTimestamp = await helpers.time.latest();
      const oneMonth = 60 * 60 * 24 * 30
      const oneMonthLater = lastBlockTimestamp + oneMonth;

      await network.provider.send("evm_mine", [oneMonthLater]);

      const updatedTimestamp = await helpers.time.latest();
      expect(updatedTimestamp - lastBlockTimestamp).to.be.equal(oneMonth)
    })
  })

  describe("Forced withdraw", async () => {

    it("Staker1 should do a forced unstake", async () => {
      const stakingTokenBefore = await stakingToken.balanceOf(staker1.address);
      const rewardTokenBefore = await rewardToken.balanceOf(staker1.address);

      await staking.connect(staker1).unstakeForced();

      const stakingTokenAfter = await stakingToken.balanceOf(staker1.address);
      const rewardTokenAfter = await rewardToken.balanceOf(staker1.address);

      const stakingTokenDiff = stakingTokenAfter.sub(stakingTokenBefore);
      const rewardTokenDiff = rewardTokenAfter.sub(rewardTokenBefore);

      const expectedStakingTokens = ethers.utils.parseEther("4000")
      const expectedRewardTokens = staker1StakeAmounts[1].div("20")

      expect(stakingTokenDiff).to.be.equal(expectedStakingTokens);
      expect(rewardTokenDiff).to.be.equal(expectedRewardTokens);
    })


    it("Queue should be updated", async () => {
      const head = await staking.head(staker1.address);
      const tail = await staking.tail(staker1.address);

      expect(head).to.be.equal(3);
      expect(tail).to.be.equal(3);
    })

    it("Staker1 should not be able to do a signle unstake of an old position", async () => {
      await expectRevert(staking.connect(staker1).unstakeSingle(2), "Invalid index");
    })

    it("Staker1 should not be able to do a signle unstake of an old position", async () => {
      await expectRevert(staking.connect(staker1).unstakeSingle(3), "Invalid index");
    })

  })

  describe("Pause and unpause", async () => {

    it("Only admin should be able to pause staking", async () => {
      const expectedMessage = "AccessControl: account " + staker1.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"

      await expectRevert(staking.connect(staker1).pause(), expectedMessage)
    })

    it("Admin should pause staking", async () => {
      await staking.connect(secondAdmin).pause();
    })
    
    it("Staking function should be paused", async () => {
      await expectRevert(staking.connect(staker1).stake("10"), "Pausable: paused");
    })

    it("Only admin should be able to unpause staking", async () => {
      const expectedMessage = "AccessControl: account " + staker1.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"

      await expectRevert(staking.connect(staker1).unpause(), expectedMessage)
    })

    it("Admin should unpause staking", async () => {
      await staking.connect(secondAdmin).unpause();
    })
  })

  describe("Staking with single unstake", async () => {

    it("staker2 should approve token transfer", async () => {
      await stakingToken.connect(staker2).approve(staking.address, ethers.utils.parseEther("6000"));
    })

    it("Staker2 should do first stake", async () => {
      await staking.connect(staker2).stake(staker2StakeAmounts[0]);
    })

    it("One month passes", async () => {
      const lastBlockTimestamp = await helpers.time.latest();
      const oneMonth = 60 * 60 * 24 * 30
      const oneMonthLater = lastBlockTimestamp + oneMonth;

      await network.provider.send("evm_mine", [oneMonthLater]);

      const updatedTimestamp = await helpers.time.latest();
      expect(updatedTimestamp - lastBlockTimestamp).to.be.equal(oneMonth)
    })

    it("Staker2 should do second stake", async () => {
      await staking.connect(staker2).stake(staker2StakeAmounts[1]);
    })

    it("One month passes", async () => {
      const lastBlockTimestamp = await helpers.time.latest();
      const oneMonth = 60 * 60 * 24 * 30
      const oneMonthLater = lastBlockTimestamp + oneMonth;

      await network.provider.send("evm_mine", [oneMonthLater]);

      const updatedTimestamp = await helpers.time.latest();
      expect(updatedTimestamp - lastBlockTimestamp).to.be.equal(oneMonth)
    })

    it("Staker2 should do third stake", async () => {
      await staking.connect(staker2).stake(staker2StakeAmounts[2]);
    })

    it("5 month passes", async () => {
      const lastBlockTimestamp = await helpers.time.latest();
      const fiveMonths = 60 * 60 * 24 * 30 * 5
      const fiveMonthsLater = lastBlockTimestamp + fiveMonths;

      await network.provider.send("evm_mine", [fiveMonthsLater]);

      const updatedTimestamp = await helpers.time.latest();
      expect(updatedTimestamp - lastBlockTimestamp).to.be.equal(fiveMonths)
    })

    it("Staker2 should do a single unstake for second stake", async () => {
      const stakingTokenBefore = await stakingToken.balanceOf(staker2.address);
      const rewardTokenBefore = await rewardToken.balanceOf(staker2.address);
      const availableRewardsBefore = await staking.availableRewards();

      await staking.connect(staker2).unstakeSingle(1);

      const stakingTokenAfter = await stakingToken.balanceOf(staker2.address);
      const rewardTokenAfter = await rewardToken.balanceOf(staker2.address);
      const availableRewardsAfter= await staking.availableRewards();

      const stakingTokenDiff = stakingTokenAfter.sub(stakingTokenBefore);
      const rewardTokenDiff = rewardTokenAfter.sub(rewardTokenBefore);
      const availableRewardsDiff = availableRewardsBefore.sub(availableRewardsAfter)

      const expectedStakingTokens = staker2StakeAmounts[1]
      const expectedRewardTokens = staker2StakeAmounts[1].div("20")

      expect(stakingTokenDiff).to.be.equal(expectedStakingTokens);
      expect(rewardTokenDiff).to.be.equal(expectedRewardTokens);
      expect(availableRewardsDiff).to.be.equal(expectedRewardTokens)
    })

    it("Staker2 should not be able to do a single unstake twice", async () => {
      await expectRevert(staking.connect(staker2).unstakeSingle(1), "Already claimed");
    })

    it("Staker1 should not be able to do a single unstake out of the queue", async () => {
      await expectRevert(staking.connect(staker2).unstakeSingle(5), "Invalid index");
    })

    it("Staker2 should do a single unstake for third stake", async () => {
      const stakingTokenBefore = await stakingToken.balanceOf(staker2.address);
      const rewardTokenBefore = await rewardToken.balanceOf(staker2.address);
      const availableRewardsBefore = await staking.availableRewards();

      await staking.connect(staker2).unstakeSingle(2);

      const stakingTokenAfter = await stakingToken.balanceOf(staker2.address);
      const rewardTokenAfter = await rewardToken.balanceOf(staker2.address);
      const availableRewardsAfter= await staking.availableRewards();

      const stakingTokenDiff = stakingTokenAfter.sub(stakingTokenBefore);
      const rewardTokenDiff = rewardTokenAfter.sub(rewardTokenBefore);
      const availableRewardsDiff = availableRewardsBefore.sub(availableRewardsAfter)

      const expectedStakingTokens = staker2StakeAmounts[2]
      const expectedRewardTokens = 0

      expect(stakingTokenDiff).to.be.equal(expectedStakingTokens);
      expect(rewardTokenDiff).to.be.equal(expectedRewardTokens);
      expect(availableRewardsDiff).to.be.equal(expectedRewardTokens)
    })

    it("5 month passes", async () => {
      const lastBlockTimestamp = await helpers.time.latest();
      const fiveMonths = 60 * 60 * 24 * 30 * 5
      const fiveMonthsLater = lastBlockTimestamp + fiveMonths;

      await network.provider.send("evm_mine", [fiveMonthsLater]);

      const updatedTimestamp = await helpers.time.latest();
      expect(updatedTimestamp - lastBlockTimestamp).to.be.equal(fiveMonths)
    })

    it("Staker2 shoukd do a forced unstake and receive only rewards from first stake", async () => {
      const stakingTokenBefore = await stakingToken.balanceOf(staker2.address);
      const rewardTokenBefore = await rewardToken.balanceOf(staker2.address);
      const availableRewardsBefore = await staking.availableRewards();

      await staking.connect(staker2).unstakeForced();

      const stakingTokenAfter = await stakingToken.balanceOf(staker2.address);
      const rewardTokenAfter = await rewardToken.balanceOf(staker2.address);
      const availableRewardsAfter= await staking.availableRewards();

      const stakingTokenDiff = stakingTokenAfter.sub(stakingTokenBefore);
      const rewardTokenDiff = rewardTokenAfter.sub(rewardTokenBefore);
      const availableRewardsDiff = availableRewardsBefore.sub(availableRewardsAfter)

      const expectedStakingTokens = staker2StakeAmounts[0]
      const expectedRewardTokens = staker2StakeAmounts[0].div("20")

      expect(stakingTokenDiff).to.be.equal(expectedStakingTokens);
      expect(rewardTokenDiff).to.be.equal(expectedRewardTokens);
      expect(availableRewardsDiff).to.be.equal(expectedRewardTokens)
    })

  })

  describe("Rewards distribution whene available rewards are not sufficient", async () => {

    const stakeAmount = ethers.utils.parseEther("4000")

    it("Admin should update rewards percentage", async () => {
      await staking.connect(secondAdmin).updateRewardsPercentage(STAKING_REWARDS);
    })

    it("Staker2 should stake", async () => {
      await stakingToken.connect(staker2).approve(staking.address, stakeAmount);
      await staking.connect(staker2).stake(stakeAmount);
    })

    it("6 month passes", async () => {
      const lastBlockTimestamp = await helpers.time.latest();
      const sixMonths = 60 * 60 * 24 * 30 * 6 + 86400
      const sixMonthsLater = lastBlockTimestamp + sixMonths;

      await network.provider.send("evm_mine", [sixMonthsLater]);

      const updatedTimestamp = await helpers.time.latest();
      expect(updatedTimestamp - lastBlockTimestamp).to.be.equal(sixMonths)
    })

    it("Staker2 should unstake and receive partial rewards", async () => {
      const stakingTokenBefore = await stakingToken.balanceOf(staker2.address);
      const rewardTokenBefore = await rewardToken.balanceOf(staker2.address);
      const availableRewardsBefore = await staking.availableRewards();

      await staking.connect(staker2).unstakeForced();

      const stakingTokenAfter = await stakingToken.balanceOf(staker2.address);
      const rewardTokenAfter = await rewardToken.balanceOf(staker2.address);
      const availableRewardsAfter = await staking.availableRewards();

      const stakingTokenDiff = stakingTokenAfter.sub(stakingTokenBefore);
      const rewardTokenDiff = rewardTokenAfter.sub(rewardTokenBefore);

      const expectedStakingTokens = stakeAmount
      const expectedRewardTokens = availableRewardsBefore

      expect(stakingTokenDiff).to.be.equal(expectedStakingTokens);
      expect(rewardTokenDiff).to.be.equal(expectedRewardTokens);
      expect(availableRewardsAfter).to.be.equal(0);
    })
  })

  describe("Unstake without positions", async () => {

    it("Staker2 unstake forced without stake positions", async () => {
      const stakingTokenBefore = await stakingToken.balanceOf(staker2.address);
      const rewardTokenBefore = await rewardToken.balanceOf(staker2.address);
      const availableRewardsBefore = await staking.availableRewards();

      await staking.connect(staker2).unstakeForced();

      const stakingTokenAfter = await stakingToken.balanceOf(staker2.address);
      const rewardTokenAfter = await rewardToken.balanceOf(staker2.address);
      const availableRewardsAfter = await staking.availableRewards();

      const stakingTokenDiff = stakingTokenAfter.sub(stakingTokenBefore);
      const rewardTokenDiff = rewardTokenAfter.sub(rewardTokenBefore);

      expect(stakingTokenDiff).to.be.equal(0);
      expect(rewardTokenDiff).to.be.equal(0);
      expect(availableRewardsAfter).to.be.equal(availableRewardsBefore);
    })

  })

});

