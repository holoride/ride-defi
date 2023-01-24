// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Imports
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IStaking.sol";

contract Staking is AccessControl, IStaking {
  // Structures
  struct StakePosition {
    uint amount; // amount of tokens staked
    uint timestamp; // block timestamp of the stake operation
  }

  // Constants
  uint public constant REWARDS_DIVIDER = 10000;
  uint public immutable REWARDS_PERCENTAGE;
  uint public immutable STAKING_TERM;

  // Members
  IERC20 public tokenToStake;
  IERC20 public rewardToken;
  uint public availableRewards;
  mapping (address => uint) public tail;
  // mapping (address => uint) public head;
  mapping (address => StakePosition[]) public stakeQueue;

  /**
   * @notice Constructor
   * @param _tokenToStake Address of the staking token
   * @param _rewardToken Address of the reward token
   * @param _rewardsPercentage Percentage of token to distribute as a reward
            for the stakers
   * @param _stakingTerm Seconds that needs to pass from the stake to consider
            the position eligible for rewards
   */
  constructor (
    address _tokenToStake, 
    address _rewardToken,  
    uint _rewardsPercentage, 
    uint _stakingTerm
  ) {
    // Setup roles
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    tokenToStake = IERC20(_tokenToStake);
    rewardToken = IERC20(_rewardToken);

    REWARDS_PERCENTAGE = _rewardsPercentage;
    STAKING_TERM = _stakingTerm;
  }

  /////////////////////////////////////////////////////////////////////////////
  // EXTERNAL FUNCTIONS

  /**
   * @notice Stake tokens
   * @param _amount Amount of tokens to stake
   * @dev Caller has to approve the transger of _amount staking tokens from
            its wallet to this contract
   */
  function stake(
    uint _amount
  ) external override {
    // Get tokens
    tokenToStake.transferFrom(msg.sender, address(this), _amount);

    // Create staking position
    StakePosition memory position = StakePosition(_amount, block.timestamp);
    stakeQueue[msg.sender].push(position);

    // emit event
    emit Stake(msg.sender, _amount, block.timestamp);
  }

  /**
   * @notice Unstake positions that are eligible for the rewards
   */
  function unstake() external override {
    _unstake(msg.sender, false);
  }

  /**
   * @notice Unstake all positions (also ones not eligible for the rewards)
   */
  function unstakeForced() external override {
    _unstake(msg.sender, true);
  }

  /////////////////////////////////////////////////////////////////////////////
  // PRIVILEGED FUNCTIONS
  /**
   * @notice Add rewards to the staking
   * @param _amount Amount of rewards to add
   * @dev Caller has to approve the transfer of _amount reward tokens from its
            wallet to this contract
   */
  function addRewards(
    uint _amount
  ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
    // Get tokens 
    rewardToken.transferFrom(msg.sender, address(this), _amount);

    // Update counter
    availableRewards += _amount;
  }

  /////////////////////////////////////////////////////////////////////////////
  // INTERNAL FUNCTIONS
  /**
   * @notice Internal unstake
   * @param _staker Address of the staker
   * @param _forceUnstake If true, unstake every position (also the ones that 
            won't receive rewards)
   * @dev Transfer accumulated rewards and also staked tokens 
   */
  function _unstake(
    address _staker, 
    bool _forceUnstake
  ) internal {
    uint positions = stakeQueue[_staker].length;
    uint totalRewards = 0;
    uint totalStakedTokens = 0;

    // Compute total rewards 
    uint i = tail[msg.sender];
    for (; i < positions; i++) {
      StakePosition memory position = stakeQueue[msg.sender][i];  

      // Update staked tokens to transfer
      totalStakedTokens += position.amount;

      // Compute time difference and check if stake is eligible 
      uint timeDiff = block.timestamp - position.timestamp;
      if (timeDiff >= STAKING_TERM) {
        // Since it's eligible, add rewards
        totalRewards += position.amount * REWARDS_PERCENTAGE / REWARDS_DIVIDER;
      } else if (! _forceUnstake) {
        break;
      }
    }

    // Sanity check. Do not transfer more than what's in the contract
    if (totalRewards > availableRewards) {
      totalRewards = availableRewards;
    }

    // Transfer rewards
    rewardToken.transfer(_staker, totalRewards);

    // Transfer staked tokens
    tokenToStake.transfer(_staker, totalStakedTokens);

    // Update tail
    tail[msg.sender] = i;

    // Emit event
    emit Unstake(_staker, totalRewards, block.timestamp);
  }
}
