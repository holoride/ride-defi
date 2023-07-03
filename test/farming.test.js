const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {
  expectRevert,
  time
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { mineBlocks } = require("./utils");

// Constants
const rewardPerBlock = ethers.utils.parseEther("2");
const startBlockOffset = 100;
const initialFundAmount = ethers.utils.parseEther("1000")

const farmer1Amounts = [
  ethers.utils.parseEther("500"),  
  ethers.utils.parseEther("1500")
]

const farmer2Amounts = [
  ethers.utils.parseEther("4000")
]

// Variables
let deployer, farmer1, farmer2;
let farming, rewardToken, lpToken;

let startBlock ;

describe("Farming Tests", async () => {
  describe("Deploy contract", async () => {

    it("Should get signers", async () => {
      [deployer, farmer1, farmer2] = await ethers.getSigners();
    })

    it("Should deploy reward token", async () => {
      const factory = await ethers.getContractFactory("GenericERC20")
      rewardToken = await factory.deploy("RewardToken", "RT");
    })

    it("Should deploy lp token", async () => {
      const factory = await ethers.getContractFactory("GenericERC20")
      lpToken = await factory.deploy("LPToken", "LP");
    })

    it("Should transfer lp tokens to farmers", async () => {
      await lpToken.transfer(farmer1.address, ethers.utils.parseEther("2000"))
      await lpToken.transfer(farmer2.address, ethers.utils.parseEther("4000"))
    })

    it("Should deploy farming", async () => {
      // compute starting block
      const currentBlock = await ethers.provider.getBlockNumber()
      startBlock = currentBlock + startBlockOffset

      const factory = await ethers.getContractFactory("Farming")
      farming = await factory.deploy(rewardToken.address, rewardPerBlock, startBlock)
    })

    it("Farming is deployed correctly", async () => {
      const effRewardPerBlock = await farming.rewardPerBlock()
      const effStartBlock = await farming.startBlock();
      const effEndBlock = await farming.endBlock();

      expect(effRewardPerBlock).to.be.equal(rewardPerBlock)
      expect(effStartBlock).to.be.equal(startBlock)
      expect(effEndBlock).to.be.equal(startBlock)
    })
  })

  describe("Funding", async () => {

    it("Deployer approves transfer of reward tokens", async () => {
      await rewardToken.approve(farming.address, initialFundAmount)
    })

    it("Should not fund the farming if amount is not divisible by reward block", async () => {
      const invalidAmount = ethers.utils.parseEther("501");
      await expectRevert(farming.fund(invalidAmount), "fund: invalid amount");
    })

    it("Should fund the farming", async () => {
      const balanceBefore = await rewardToken.balanceOf(farming.address)
      await farming.fund(initialFundAmount);
      const balanceAfter = await rewardToken.balanceOf(farming.address)

      expect(balanceAfter.sub(balanceBefore)).to.be.equal(initialFundAmount)
    })

    it("End block should be computed correctly", async () => {
      const effEndBlock = await farming.endBlock();
      const expectedEndBlock = initialFundAmount.div(rewardPerBlock).add(startBlock)

      expect(effEndBlock).to.be.equal(expectedEndBlock)
    })

  })

  describe("Create Farming pool", async () => {

    it("Only owner should be able to create farming pool", async () => {
      await expectRevert(farming.connect(farmer1).add(100, lpToken.address, false), "Ownable: caller is not the owner")
    })

    it("Should create a farming pool", async () => {
      await farming.add(100, lpToken.address, false)
    })

    it("Pool should be correct", async () => {
      const pool = await farming.poolInfo(0);

      expect(pool.lpToken).to.be.equal(lpToken.address)
      expect(pool.allocPoint).to.be.equal(100)
      expect(pool.lastRewardBlock).to.be.equal(startBlock)
      expect(pool.accERC20PerShare).to.be.equal(0)
    })

    it("Pool length should be one", async () => {
      const length = await farming.poolLength()

      expect(length).to.be.equal(1)
    })

  })

  describe("Change farming pool allocation points", async () => {
    it("Only owner should be able to change farming pool", async () => {
      await expectRevert(farming.connect(farmer1).set(0, 150, false), "Ownable: caller is not the owner")
    })

    it("Should update farming pool", async () => {
      await farming.set(0, 150, false)
    })

    it("Pool should be correct", async () => {
      const pool = await farming.poolInfo(0);

      expect(pool.lpToken).to.be.equal(lpToken.address)
      expect(pool.allocPoint).to.be.equal(150)
      expect(pool.lastRewardBlock).to.be.equal(startBlock)
      expect(pool.accERC20PerShare).to.be.equal(0)
    })

  })

  describe("Farming", async () => {

    it("Farmer1 should deposit 500 lp tokens", async () => {
      await lpToken.connect(farmer1).approve(farming.address, farmer1Amounts[0])
      await farming.connect(farmer1).deposit(0, farmer1Amounts[0])
    })

    it("Farmer1 should reflect deposit", async () => {
      const deposited = await farming.deposited(0, farmer1.address)

      expect(deposited).to.be.equal(farmer1Amounts[0])
    })

    it("Total pending rewards should be 0", async () => {
      const total = await farming.totalPending()

      expect(total).to.be.equal(0)
    })

    it("Time passes and farming starts...", async () => {
      const currentBlock = await ethers.provider.getBlockNumber();
      const diff = startBlock - currentBlock
      await mineBlocks(diff)
    })

    it("8 blocks passes", async () => {
      await mineBlocks(8)
    })

    it("Total pending rewards should be 16", async () => {
      const total = await farming.totalPending()
      const expected = ethers.utils.parseEther("16")

      expect(total).to.be.equal(expected)
    })

    it("Expected rewards should be correct", async () => {
      const rewards = await farming.pending(0, farmer1.address) 
      const expected = rewardPerBlock.mul(8)

      expect(rewards).to.be.equal(expected)
    })

    it("Farmer2 deposits 4000 tokens", async () => {
      await lpToken.connect(farmer2).approve(farming.address, farmer2Amounts[0])
      await farming.connect(farmer2).deposit(0, farmer2Amounts[0])

      // REWARDS STATE
      // FARMER 1: 20
      // FARMER 2: 0
      // FARM BLOCK: 10
      const rewards1 = await farming.pending(0, farmer1.address) 
      const expected1 = rewardPerBlock.mul(10)
      const rewards2 = await farming.pending(0, farmer2.address);
      const expected2 = 0

      expect(rewards1).to.be.equal(expected1)
      expect(rewards2).to.be.equal(expected2)
    })

    it("8 blocks passes", async () => {
      await mineBlocks(8)
    })

    it("Farmer1 deposits 1500 tokens", async () => {
      const balance1Before = await rewardToken.balanceOf(farmer1.address)
      await lpToken.connect(farmer1).approve(farming.address, farmer1Amounts[1])
      await farming.connect(farmer1).deposit(0, farmer1Amounts[1])
      const balance1After = await rewardToken.balanceOf(farmer1.address)

      // REWARDS STATE
      // FARMER 1: 0  (22,2222... distributed)
      // FARMER 2: 17,7777...
      // FARM BLOCK: 20
      const rewards1 = 0 
      const distributed1 = rewardPerBlock.mul(10).add(ethers.utils.parseEther("2.222222222222222222"))
      const rewards2 = await farming.pending(0, farmer2.address);
      const expected2 =  ethers.utils.parseEther("17.777777777777777777") 

      console.log("Farmer 1 distributed rewards:", ethers.utils.formatEther(distributed1))
      console.log("Farmer 2 rewards:", ethers.utils.formatEther(rewards2))

      expect(rewards1).to.be.equal(0)
      expect(rewards2).to.be.equal(expected2)
      expect(balance1After.sub(balance1Before)).to.be.equal(distributed1)
    })

    it("Should update farming pool with mass update", async () => {
      await farming.set(0, 100, true)
    })


    it("479 blocks passes and farming ends", async () => {
      await mineBlocks(479)
    })

    it("Pending rewards are correct", async () => {
      // REWARDS STATE
      // FARMER 1: 0  (22,2222... distributed)
      // FARMER 2: 17,7777...
      // FARM BLOCK: 20
      const rewards1 = await farming.pending(0, farmer1.address)
      const expected1 = ethers.utils.parseEther("320")
      const rewards2 = await farming.pending(0, farmer2.address);
      const expected2 =  ethers.utils.parseEther("657.777777777777777777") 

      console.log("Farmer 1 distributed rewards:", ethers.utils.formatEther(expected1))
      console.log("Farmer 2 rewards:", ethers.utils.formatEther(rewards2))

      expect(rewards1).to.be.equal(expected1)
      expect(rewards2).to.be.equal(expected2)
    })

    it("Farmer1 withdraws 500 lpTokens", async () => {
      const withdrawAmount = ethers.utils.parseEther("500")
      const lpBalanceBefore = await lpToken.balanceOf(farmer1.address)
      const rewardBalanceBefore = await rewardToken.balanceOf(farmer1.address)
      await farming.connect(farmer1).withdraw(0, withdrawAmount)
      const lpbalanceAfter = await lpToken.balanceOf(farmer1.address)
      const rewardBalanceAfter = await rewardToken.balanceOf(farmer1.address)

      const lpDiff = lpbalanceAfter.sub(lpBalanceBefore)
      const rewardDiff = rewardBalanceAfter.sub(rewardBalanceBefore)
      const expectedRewards = ethers.utils.parseEther("320")

      expect(lpDiff).to.be.equal(withdrawAmount)
      expect(rewardDiff).to.be.equal(expectedRewards)
    })

    it("Farmer1 withdraws 1500 lpTokens", async () => {
      const withdrawAmount = ethers.utils.parseEther("1500")
      const lpBalanceBefore = await lpToken.balanceOf(farmer1.address)
      const rewardBalanceBefore = await rewardToken.balanceOf(farmer1.address)
      await farming.connect(farmer1).withdraw(0, withdrawAmount)
      const lpbalanceAfter = await lpToken.balanceOf(farmer1.address)
      const rewardBalanceAfter = await rewardToken.balanceOf(farmer1.address)

      const lpDiff = lpbalanceAfter.sub(lpBalanceBefore)
      const rewardDiff = rewardBalanceAfter.sub(rewardBalanceBefore)
      const expectedRewards = 0

      expect(lpDiff).to.be.equal(withdrawAmount)
      expect(rewardDiff).to.be.equal(expectedRewards)
    })

    it("Farmer1 cannot withdraw more", async () => {
      const withdrawAmount = 1 // 1 wei
      await expectRevert(farming.connect(farmer1).withdraw(0, withdrawAmount), "withdraw: can't withdraw more than deposit")
    })

  })

  describe("Emergency withdraw", async () => {

    it("Farmer2 does emergency withdraw", async () => {
      const lpBalanceBefore = await lpToken.balanceOf(farmer2.address)
      const rewardBalanceBefore = await rewardToken.balanceOf(farmer2.address)
      await farming.connect(farmer2).emergencyWithdraw(0)
      const lpbalanceAfter = await lpToken.balanceOf(farmer2.address)
      const rewardBalanceAfter = await rewardToken.balanceOf(farmer2.address)

      const lpDiff = lpbalanceAfter.sub(lpBalanceBefore)
      const rewardDiff = rewardBalanceAfter.sub(rewardBalanceBefore)
      const expectedRewards = 0

      expect(lpDiff).to.be.equal(farmer2Amounts[0])
      expect(rewardDiff).to.be.equal(expectedRewards)
    })

    it("Farmer2 cannot emergency withdraw multiple times and receive LPs", async () => {
      const lpBalanceBefore = await lpToken.balanceOf(farmer2.address)
      const rewardBalanceBefore = await rewardToken.balanceOf(farmer2.address)
      await farming.connect(farmer2).emergencyWithdraw(0)
      const lpbalanceAfter = await lpToken.balanceOf(farmer2.address)
      const rewardBalanceAfter = await rewardToken.balanceOf(farmer2.address)

      const lpDiff = lpbalanceAfter.sub(lpBalanceBefore)
      const rewardDiff = rewardBalanceAfter.sub(rewardBalanceBefore)

      expect(lpDiff).to.be.equal(0)
      expect(rewardDiff).to.be.equal(0)
    })

  })

  describe("Tests after end block", async () => {

    it("Cannot deposit after end block", async () => {
      await expectRevert(farming.deposit(0, ethers.utils.parseEther("1")), "deposit: cannot deposit after end block")
    })

    it("Cannot fund after end block", async () => {
      await expectRevert(farming.fund(ethers.utils.parseEther("1")), "fund: too late, the farm is closed")
    })

  })
})