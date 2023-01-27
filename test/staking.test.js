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
const initialStakingTokenAmont = ethers.utils.parseEther("10000");

const totalRewards = ethers.utils.parseEther("500");

const staker1StakeAmounts = [
  ethers.utils.parseEther("1000"),
  ethers.utils.parseEther("2500"),
  ethers.utils.parseEther("1500"),
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

    it("Staker1 should stake", async () => {
      await staking.connect(staker1).stake(staker1StakeAmounts[0]);
    })

    it("Stake queue is updated", async () => {
      const position = await staking.stakeQueue(staker1.address, 0);
      const lastBlockTimestamp = await helpers.time.latest();

      expect(position.amount).to.be.equal(staker1StakeAmounts[0]);
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
      expect(position.timestamp).to.be.equal(lastBlockTimestamp)
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

      const expectedRewards = staker1StakeAmounts[0].mul(STAKING_REWARDS).div("10000")

      expect(stakingTokenDiff).to.be.equal(staker1StakeAmounts[0]);
      expect(rewardTokenDiff).to.be.equal(expectedRewards)
    })

  })
});
