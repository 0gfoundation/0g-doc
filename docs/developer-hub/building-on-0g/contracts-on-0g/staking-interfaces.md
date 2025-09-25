---
id: staking-interfaces
title: Staking Interfaces
---

# Staking Interfaces

Welcome to the 0G Chain Staking Interfaces documentation. This guide provides comprehensive information about interacting with the 0G Chain staking system through smart contracts, enabling you to build applications that leverage validator operations and delegations.

## Overview

The 0G Chain staking system enables OG token holders to participate in network consensus and earn rewards through two primary mechanisms:

1. **Becoming a Validator**: Run infrastructure to validate transactions and produce blocks
2. **Delegating to Validators**: Stake tokens with existing validators to earn rewards without running infrastructure

The staking system is built on two core smart contract interfaces:

- **`IStakingContract`**: Central registry managing validators and global staking parameters
- **`IValidatorContract`**: Individual validator operations including delegations and reward distribution

## Prerequisites

Before working with the staking interfaces:

- Familiarity with Solidity and smart contract development
- Basic knowledge of consensus mechanisms and staking concepts

## Quick Start

```solidity
// Create a validator
IStakingContract staking = IStakingContract(0xea224dBB52F57752044c0C86aD50930091F561B9);
address validator = staking.createAndInitializeValidatorIfNecessary{value: msg.value}(
    description, commissionRate, withdrawalFee, pubkey, signature
);

// Delegate to validator
IValidatorContract(validator).delegate{value: msg.value}(msg.sender);
```

## Core Concepts

### Validators
Validators process transactions and produce blocks:
- **Unique Identity**: Identified by 48-byte consensus public key
- **Operator Control**: Managed by an Ethereum address
- **Commission**: Set their own reward commission rates
- **Self-Delegation**: Required minimum stake from operator

### Delegations
Token holders earn rewards by delegating to validators:
- **Share-Based**: Delegations represented as shares in the validator pool
- **Proportional Rewards**: Earnings based on share percentage
- **Withdrawal Delay**: Undelegation subject to network delay period

### Reward Distribution
Rewards flow through multiple layers:
1. **Community Tax**: Applied to all rewards first
2. **Validator Commission**: Taken from remaining rewards
3. **Delegator Distribution**: Proportional to shares held

## Contract Interfaces

### IStakingContract
`0xea224dBB52F57752044c0C86aD50930091F561B9` (Testnet)

Central registry for validators and global parameters.

#### Validator Management
```solidity
// Create validator contract
function createValidator(bytes calldata pubkey) external returns (address);

// Initialize validator with self-delegation
function initializeValidator(
    Description calldata description,
    uint32 commissionRate,
    uint96 withdrawalFeeInGwei,
    bytes calldata pubkey,
    bytes calldata signature
) external payable;

// Create and initialize in one call
function createAndInitializeValidatorIfNecessary(
    Description calldata description,
    uint32 commissionRate, 
    uint96 withdrawalFeeInGwei,
    bytes calldata pubkey,
    bytes calldata signature
) external payable;
```

#### Query Functions
```solidity
function getValidator(bytes memory pubkey) external view returns (address);
function computeValidatorAddress(bytes calldata pubkey) external view returns (address);
function validatorCount() external view returns (uint32);
function maxValidatorCount() external view returns (uint32);
```

### IValidatorContract
Individual validator operations and delegation management.

#### Delegation Management
```solidity
// Delegate tokens (msg.value = amount)
function delegate(address delegatorAddress) external payable returns (uint);

// Undelegate shares (msg.value = withdrawal fee)
function undelegate(address withdrawalAddress, uint shares) external payable returns (uint);

// Withdraw validator commission (only validator operator)
function withdrawCommission(address withdrawalAddress) external returns (uint);
```

:::info **Access Control**
The `withdrawCommission` function is restricted to the validator operator only - the address that originally created and manages the validator.
:::

#### Information Queries
```solidity
function tokens() external view returns (uint);           // Total tokens (delegated + rewards)
function delegatorShares() external view returns (uint);  // Total shares issued
function getDelegation(address delegator) external view returns (address, uint);
function commissionRate() external view returns (uint32);
function withdrawalFeeInGwei() external view returns (uint96);
```

:::tip **Understanding tokens()**
The `tokens()` function returns the complete validator balance, including both the original delegated amounts and any accumulated rewards that haven't been distributed yet.
:::

## Examples

### Creating a Validator

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IStakingContract.sol";

contract ValidatorExample {
    IStakingContract constant STAKING = IStakingContract(0xea224dBB52F57752044c0C86aD50930091F561B9);
    
    function createValidator(
        bytes calldata pubkey, 
        bytes calldata signature
    ) external payable {
        Description memory desc = Description({
            moniker: "My Validator",
            identity: "keybase-id", 
            website: "https://validator.example.com",
            securityContact: "security@example.com",
            details: "A reliable 0G Chain validator"
        });
        
        STAKING.createAndInitializeValidatorIfNecessary{value: msg.value}(
            desc,
            50000,  // 5% commission
            1,      // 1 Gwei withdrawal fee
            pubkey,
            signature
        );
    }
}
```

### Delegation Management

```solidity
contract DelegationHelper {
    IStakingContract constant STAKING = IStakingContract(0xea224dBB52F57752044c0C86aD50930091F561B9);
    
    function delegateToValidator(bytes calldata pubkey) external payable {
        address validator = STAKING.getValidator(pubkey);
        require(validator != address(0), "Validator not found");
        
        IValidatorContract(validator).delegate{value: msg.value}(msg.sender);
    }
    
    function getDelegationInfo(
        bytes calldata pubkey,
        address delegator
    ) external view returns (uint shares, uint estimatedTokens) {
        address validator = STAKING.getValidator(pubkey);
        IValidatorContract v = IValidatorContract(validator);
        
        (, shares) = v.getDelegation(delegator);
        
        uint totalTokens = v.tokens();
        uint totalShares = v.delegatorShares();
        
        if (totalShares > 0) {
            estimatedTokens = (shares * totalTokens) / totalShares;
        }
    }
}
```

## Getting Validator Signature

### Option 1: Automated Script (Recommended)

For quick setup, we provide an automated bash script that handles all signature generation steps:

#### Download and Execute
```bash
# Download the script
curl -O https://raw.githubusercontent.com/0glabs/0g-doc/main/scripts/generate-validator-signature.sh

# Make it executable
chmod +x generate-validator-signature.sh

# Run the script
./generate-validator-signature.sh
```

The script will prompt you for:
- `HOMEDIR` (default: `./0g-home/0gchaind-home`)
- `CHAIN_SPEC` (default: `testnet`)  
- `VALIDATOR_INITIAL_DELEGATION_IN_ETHER` (default: `32`)

**Output:**
```
✅ Staking message created successfully!

pubkey: 0xaa0f99735a6436d6b7ed763c2eaa8452d753c5152a4fb1e4dc0bd7e33bcfc8cd4fac0e2d6cbab941f423c17728fecc56
validator_address: 0x1e776a6b65892ec60537a885c17b820301e054b9
signature: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

To initialize the validator, you need to call the createAndInitializeValidatorIfNecessary function with the pubkey and signature.
```

### Option 2: Manual Steps

For those who want to understand the process or customize the workflow, follow these manual steps:

### Prerequisites
Your directory structure should look like:
```
galileo/
├── bin/0gchaind
└── config/
    ├── genesis.json
    ├── priv_validator_key.json
    └── ...
```

### Step 1: Extract Public Key

 `0gchaind-home/config` directory will look like this:
```
0gchaind-home/
├── config/
    ├── genesis.json
    ├── priv_validator_key.json
    └── ...
```

Make sure to use data path that is used for validator node setup.

```bash
# Set your home directory
HOMEDIR={your data path}/0g-home/0gchaind-home
CHAIN_SPEC=devnet

# Generate validator keys
./bin/0gchaind deposit validator-keys --home $HOMEDIR --chaincfg.chain-spec=$CHAIN_SPEC
```

**Output:**
```
Eth/Beacon Pubkey (Compressed 48-byte Hex):
0xaa0f99735a6436d6b7ed763c2eaa8452d753c5152a4fb1e4dc0bd7e33bcfc8cd4fac0e2d6cbab941f423c17728fecc56
```

### Step 2: Compute Validator Address

Use the public key from Step 1 to compute the validator's contract address. Choose your preferred method:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="cast" label="Foundry Cast" default>

**Recommended method** - simpler syntax and better error handling.

```bash
# Set your params
STAKING_CONTRACT_ADDRESS=0xea224dBB52F57752044c0C86aD50930091F561B9
PUBLIC_KEY=0xaa0f99735a6436d6b7ed763c2eaa8452d753c5152a4fb1e4dc0bd7e33bcfc8cd4fac0e2d6cbab941f423c17728fecc56

# cast call
cast call \
    $STAKING_CONTRACT_ADDRESS \
    "computeValidatorAddress(bytes)(address)" \
    $PUBLIC_KEY \
    --rpc-url https://evmrpc-testnet.0g.ai
```
**Output:**
```
0x1e776a6b65892ec60537a885c17b820301e054b9
```

</TabItem>
<TabItem value="curl" label="curl/RPC">

Alternative method using direct RPC calls - works without additional tooling.

```bash
# Set your params
STAKING_CONTRACT_ADDRESS=0xea224dBB52F57752044c0C86aD50930091F561B9
PUBLIC_KEY=0xaa0f99735a6436d6b7ed763c2eaa8452d753c5152a4fb1e4dc0bd7e33bcfc8cd4fac0e2d6cbab941f423c17728fecc56

# rpc call
curl -X POST https://evmrpc-testnet.0g.ai \
-H "Content-Type: application/json" \
-d '{
    "jsonrpc":"2.0",
    "method":"eth_call", 
    "params":[{
        "to": "'${STAKING_CONTRACT_ADDRESS}'",
        "data": "0x1ab06aa700000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030'${PUBLIC_KEY:2:96}'00000000000000000000000000000000"
    }, "latest"],
    "id":1
}'
```
**Output:**
```
{"jsonrpc":"2.0","id":1,"result":"0x0000000000000000000000001e776a6b65892ec60537a885c17b820301e054b9"}
```
Remove the zero paddings to get the validator address.
```
0x1e776a6b65892ec60537a885c17b820301e054b9
```

</TabItem>
</Tabs>

### Step 3: Generate Signature

Use the validator's contract address from Step 2 to generate a signature.

```bash
# set your params
VALIDATOR_CONTRACT_ADDRESS=0x1e776a6b65892ec60537a885c17b820301e054b9
VALIDATOR_INITIAL_DELEGATION_IN_GWEI=32000000000 # 32 ethers

# Generate signature for validator initialization
./bin/0gchaind deposit create-validator \
    $VALIDATOR_CONTRACT_ADDRESS \
    $VALIDATOR_INITIAL_DELEGATION_IN_GWEI \
    $HOMEDIR/config/genesis.json \
    --home $HOMEDIR \
    --chaincfg.chain-spec=$CHAIN_SPEC
```

**Output:**
```
✅ Deposit message created successfully!

pubkey: 0xaa0f99735a6436d6b7ed763c2eaa8452d753c5152a4fb1e4dc0bd7e33bcfc8cd4fac0e2d6cbab941f423c17728fecc56
signature: 0x123456789000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
```

## Initialize Validator
To initialize the validator, you need to call the `createAndInitializeValidatorIfNecessary` function with the public key and signature from the previous step. The value should be set to minimum 32 OG tokens as the minimum initial delegation.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStaking {
    struct Description {
        string moniker;
        string identity;
        string website;
        string securityContact;
        string details;
    }
    
    function createAndInitializeValidatorIfNecessary(
        Description calldata description,
        uint32 commissionRate,
        uint96 withdrawalFeeInGwei,
        bytes calldata pubkey,
        bytes calldata signature
    ) external payable returns (address);
    
    function getValidator(bytes memory pubkey) external view returns (address);
    
    function computeValidatorAddress(bytes calldata pubkey) external view returns (address);
}

```

- `description`: The validator's description struct
- `commissionRate`: The validator's commission rate
- `withdrawalFeeInGwei`: The validator's withdrawal fee
- `pubkey`: The validator's public key
- `signature`: The validator's signature


## Data Structures

<details>
<summary><b>Description Struct</b></summary>

```solidity
struct Description {
    string moniker;         // max 70 chars - Validator display name
    string identity;        // max 3000 chars - Keybase identity  
    string website;         // max 140 chars - Website URL
    string securityContact; // max 140 chars - Security contact
    string details;         // max 280 chars - Additional details
}
```

</details>

<details>
<summary><b>Withdrawal Entry</b></summary>

```solidity
struct WithdrawEntry {
    uint completionHeight;  // Block height when withdrawal completes
    address delegatorAddress; // Address receiving withdrawal
    uint amount;            // Amount being withdrawn
}
```

</details>

## Configuration Parameters

| Parameter | Description |
|-----------|-------------|
| `maxValidatorCount` | Maximum validators allowed |
| `minActivationStakesInGwei` | Minimum stake for activation |
| `maxEffectiveStakesInGwei` | Maximum effective stake |
| `communityTaxRate` | Tax on all rewards |
| `minWithdrawabilityDelay` | Withdrawal delay blocks |

## Troubleshooting

<details>
<summary><b>Error: "Validator not found"</b></summary>

The validator hasn't been created yet. Use `createValidator()` first:

```solidity
address validator = staking.createValidator(pubkey);
```

</details>

<details>
<summary><b>Error: "DelegationBelowMinimum"</b></summary>

Your delegation amount is below the minimum required. Check:

```solidity
uint96 minDelegation = staking.effectiveDelegationInGwei();
require(msg.value >= minDelegation * 1 gwei, "Insufficient delegation");
```

</details>

<details>
<summary><b>Error: "NotEnoughWithdrawalFee"</b></summary>

Include the withdrawal fee when undelegating:

```solidity
uint96 fee = validator.withdrawalFeeInGwei();
validator.undelegate{value: fee * 1 gwei}(recipient, shares);
```

</details>

## Contract Addresses

| Network | Staking Contract |
|---------|------------------|
| **Testnet** | `0xea224dBB52F57752044c0C86aD50930091F561B9` |

## Resources

- **Run Validator Node**: [Validator Setup Guide](../../../run-a-node/validator-node)
- **GitHub Repository**: [0G Chain Contracts](https://github.com/0gfoundation/0g-chain-v2/blob/dev-v2.1/contracts/src/staking/)
- **Deploy Contracts**: [Contract Deployment](./deploy-contracts)

---

Need help? Join our [Discord](https://discord.gg/0glabs) for developer support.
