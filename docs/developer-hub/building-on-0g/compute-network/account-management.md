---
id: account-management
title: Account
sidebar_position: 2
sidebar_label: Account
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Account

The 0G Compute Network uses a unified account system for managing funds across services. This guide covers how to manage your accounts using different interfaces: Web UI, CLI, and SDK.

## Overview

The account system provides a secure and flexible way to manage funds across different AI service providers.

### Account Structure

- **Main Account**: Your primary wallet where funds are deposited. All deposits go here first, and you can withdraw funds from here back to your wallet.
- **Sub-Accounts**: Provider-specific accounts created automatically when you transfer funds to a provider. Each provider has a separate sub-account where funds are locked for their specific services.

### Fund Flow

<img src="/img/compute-network-account.png" alt="Account Fund Flow Diagram" width="600" />

1. **Deposit**: Transfer funds from your wallet to your Main Account
2. **Transfer**: Move funds from Main Account to Provider Sub-Accounts
3. **Usage**: Provider deducts from Sub-Account for services rendered
4. **Refund Request**: Initiate refund from Sub-Account (enters 24-hour lock period)
5. **Complete Refund**: After lock period expires, call retrieve-fund again to complete transfer back to Main Account
6. **Withdraw**: Transfer funds from Main Account back to your wallet

### Security Features

- **24-hour lock period** for refunds to protect providers from abuse
- **Single-use authentication** for each request to prevent replay attacks
- **On-chain verification** for all transactions ensuring transparency
- **Provider acknowledgment** required before first use of services

## Prerequisites

- Node.js >= 22.0.0
- A wallet with 0G tokens (for testnet or mainnet)
- MetaMask or compatible wallet (for Web UI)

## Web UI

The easiest way to manage your accounts is through the Web UI.

### Getting Started with Web UI

```bash
pnpm add @0glabs/0g-serving-broker -g

# Launch the Web UI
0g-compute-cli ui start-web
```

Access the Web UI at `http://localhost:3090/wallet` where you can:

- View your account balance in real-time
- Deposit funds directly from your connected wallet
- Transfer funds to provider sub-accounts
- Monitor spending and usage
- Request refunds with a visual interface

## CLI

The CLI provides command-line tools for account management, ideal for automation and scripting.

### Setup

```bash
# Install the CLI tool globally
pnpm add @0glabs/0g-serving-broker -g
```

### Setup Environment

#### Choose Network

```bash
0g-compute-cli setup-network
```

#### Login with Wallet

Enter your wallet private key when prompted. This will be used for account management and service payments.

```bash
0g-compute-cli login
```

### CLI Commands

#### Deposit Funds

Add funds to your main account:

```bash
0g-compute-cli deposit --amount 10
```

#### Check Balance

View your account overview:

```bash
0g-compute-cli get-account
```

Example output:

```
Overview
┌──────────────────────────────────────────────────┬─────────────────────────────────────────────────────┐
│ Balance                                          │ Value (0G)                                          │
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Total                                            │ 8.822778129999999663                                │
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Locked (transferred to sub-accounts)             │ 8.257334240000000491                                │
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Available for transfer to sub-accounts           │ 0.265443889999999960                                │
└──────────────────────────────────────────────────┴─────────────────────────────────────────────────────┘


Inference sub-accounts
┌────────────────────────┬──────────────────────────────┬────────────────────────────────────────────────┐
│ Provider               │ Balance (0G)                 │ Requested Return to Main Account (0G)          │
├────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ 0x924A2c71...          │ 3.257334240000000047         │ 0.000000000000000000                           │
├────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ 0x960E74Fc...          │ 3.000000000000000000         │ 3.000000000000000000                           │
├────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ 0x4f371f6e...          │ 3.299999999999999822         │ 0.000000000000000000                           │
└────────────────────────┴──────────────────────────────┴────────────────────────────────────────────────┘
```

#### Transfer to Provider

Before using a provider's service, transfer funds to their sub-account:

```bash
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 5
```

#### Request Refund

Withdraw unused funds from sub-accounts back to main account:

```bash
0g-compute-cli retrieve-fund
```

**Note**: Refunds have a 24-hour lock period for security. After the lock period expires, you need to call this function again to complete the refund and transfer the funds back to your main account. You can check the remaining lock time using the `get-sub-account` command:

```bash
0g-compute-cli get-sub-account --provider <PROVIDER_ADDRESS>
```

Example output showing refund details:
```
Details of Each Amount Applied for Return to Main Account
┌──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Amount (0G)                                      │ Remaining Locked Time                            │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ 0.099785050000000000                             │ 23h 43min 15s                                    │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

#### Withdraw to Wallet

Withdraw funds from main account to your wallet:

```bash
0g-compute-cli refund --amount 5
```

## SDK

For programmatic account management in your applications.

### Installation

```bash
pnpm add @0glabs/0g-serving-broker
```

### Initialize Broker

```typescript
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const broker = await createZGComputeNetworkBroker(wallet);
```

### Check Account Balance

```typescript
const account = await broker.ledger.getLedger();
console.log(`Total Balance: ${ethers.formatEther(account.totalBalance)} 0G`);
console.log(`Available: ${ethers.formatEther(account.availableBalance)} 0G`);
```

### Deposit Funds

```typescript
await broker.ledger.depositFund(10); // Deposit 10 0G
```

### Transfer to Provider

```typescript
const providerAddress = "<PROVIDER_ADDRESS>";
const amount = ethers.parseEther("5"); // 5 0G
await broker.ledger.transferFund(providerAddress, "inference", amount);
```

### Check Sub-Account Details

```typescript
const [subAccount, refunds] = await broker.inference.getAccountWithDetail(providerAddress);
console.log(`Sub-account balance: ${ethers.formatEther(subAccount.balance)} 0G`);

const { account: subAccount, refunds } = await broker.fineTuning.getAccountWithDetail(providerAddress);
console.log(`Sub-account balance: ${ethers.formatEther(subAccount.balance)} 0G`);
```

### Request Refund

```typescript
await broker.ledger.retrieveFund("inference");
await broker.ledger.retrieveFund("fine-tuning");
```

### Withdraw to Wallet

```typescript
await broker.ledger.refund(5); // Withdraw 5 0G
```

## Best Practices

### For Inference Services

1. Deposit enough funds for expected usage
2. Transfer funds to providers you plan to use frequently
3. Keep some balance in sub-accounts for better response times
4. Monitor usage regularly

### For Fine-tuning Services

1. Calculate dataset size before transferring funds
2. Transfer enough to cover the entire training job
3. Request refunds for unused funds after job completion

## Troubleshooting

<details>
<summary><b>Insufficient Balance Error</b></summary>

Check which account needs funds:

- Main account: Use `deposit`
- Sub-account: Use `transfer-fund`

```bash
# Check all balances
0g-compute-cli get-account

# Deposit to main account if needed
0g-compute-cli deposit --amount 10

# Transfer to provider if needed
0g-compute-cli transfer-fund --provider <ADDRESS> --amount 5
```

</details>

<details>
<summary><b>Refund Not Available</b></summary>

Refunds have a 24-hour lock period. After the lock period expires, you need to call the retrieve-fund function again to complete the refund. Check the status:

```bash
0g-compute-cli get-sub-account --provider <PROVIDER_ADDRESS>
```

Look for "Remaining Locked Time" in the output.

</details>

<details>
<summary><b>Transaction Failed</b></summary>

Common causes:

1. Network issues - Check your RPC endpoint
2. Gas price too low - Increase gas price
3. Insufficient gas - Ensure wallet has enough for gas fees

```bash
# Specify custom gas price
0g-compute-cli deposit --amount 10 --gas-price 20000000000
```

</details>

## Related Documentation

- [Inference Services](./inference) - Using AI inference with your funded accounts
- [Fine-tuning Services](./fine-tuning) - Training custom models with your funded accounts
