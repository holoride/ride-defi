// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IStaking {
    event Stake(address indexed _staker, uint indexed _amount, uint indexed _timestamp);
    event Unstake(address indexed _staker, uint indexed amount, uint indexed _timestamp);

    function stake(uint _amount) external;
    function unstake() external;
    function unstakeForced() external;
    function addRewards(uint _amount) external;
    function computeRewards(address _stakers) external returns (uint);
}