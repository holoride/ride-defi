# Solidity API

## Farming

### UserInfo

```solidity
struct UserInfo {
  uint256 amount;
  uint256 rewardDebt;
}
```

### PoolInfo

```solidity
struct PoolInfo {
  contract IERC20 lpToken;
  uint256 allocPoint;
  uint256 lastRewardBlock;
  uint256 accERC20PerShare;
}
```

### erc20

```solidity
contract IERC20 erc20
```

### paidOut

```solidity
uint256 paidOut
```

### rewardPerBlock

```solidity
uint256 rewardPerBlock
```

### poolInfo

```solidity
struct Farming.PoolInfo[] poolInfo
```

### userInfo

```solidity
mapping(uint256 => mapping(address => struct Farming.UserInfo)) userInfo
```

### totalAllocPoint

```solidity
uint256 totalAllocPoint
```

### startBlock

```solidity
uint256 startBlock
```

### endBlock

```solidity
uint256 endBlock
```

### constructor

```solidity
constructor(contract IERC20 _erc20, uint256 _rewardPerBlock, uint256 _startBlock) public
```

Constructor

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _erc20 | contract IERC20 | Address of the reward token |
| _rewardPerBlock | uint256 | Distributed rewards per block |
| _startBlock | uint256 | Block number from which users can farm |

### poolLength

```solidity
function poolLength() external view returns (uint256)
```

Returns the number of farming pools

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | pools Number of farming pools |

### fund

```solidity
function fund(uint256 _amount) public
```

Fund the farming and extends the end block

_Caller must approve the transfer of token from its wallet
          to this contract before calling this function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | uint256 | Amount of token to fund |

### add

```solidity
function add(uint256 _allocPoint, contract IERC20 _lpToken, bool _withUpdate) public
```

Create a farming pool

_DO NOT add the same LP token more than once. Rewards will be messed
                up if you do._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _allocPoint | uint256 | Allocation points of the pool. This pool will receive               _allocPoint / totalAllocPoint of the reward per block |
| _lpToken | contract IERC20 | Address of the LP token |
| _withUpdate | bool | If true, updates other farmimg pools |

### set

```solidity
function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) public
```

Update allocation points of a farming pool

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pid | uint256 | Pool id |
| _allocPoint | uint256 | Allocation points of the pool |
| _withUpdate | bool | If true, updates other farmimg pools |

### deposited

```solidity
function deposited(uint256 _pid, address _user) external view returns (uint256)
```

Returns the amount of deposited LPs for a user

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pid | uint256 | Pool id |
| _user | address | Address of the user |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | deposited Deposited tokens of the user |

### pending

```solidity
function pending(uint256 _pid, address _user) external view returns (uint256)
```

Returns the pending rewards for a user

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pid | uint256 | Pool id |
| _user | address | Address of the user |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | rewards Rewards of the user in the farming pool |

### totalPending

```solidity
function totalPending() external view returns (uint256)
```

Returns the total amount of pending rewards

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | totalRewards Total amount of pending rewards |

### massUpdatePools

```solidity
function massUpdatePools() public
```

Updates reward variables for every farming pool

_Can be really expensive in gas_

### updatePool

```solidity
function updatePool(uint256 _pid) public
```

Updates reward variables for a single farming pool

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pid | uint256 | Pool id |

### deposit

```solidity
function deposit(uint256 _pid, uint256 _amount) public
```

Deposit LP tokens in a farming pool

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pid | uint256 | Pool id |
| _amount | uint256 | Amount of LP tokens to deposit |

### withdraw

```solidity
function withdraw(uint256 _pid, uint256 _amount) public
```

Withdraw tokens from a farming pool

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pid | uint256 | Pool id |
| _amount | uint256 | Amount of LP tokens to withdraw |

### emergencyWithdraw

```solidity
function emergencyWithdraw(uint256 _pid) public
```

Withdraw LP tokens from a farming pool ignoring rewards

_Emergency only_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pid | uint256 | Pool id |

### erc20Transfer

```solidity
function erc20Transfer(address _to, uint256 _amount) internal
```

