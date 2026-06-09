---
id: mainnet-overview
title: Mainnet Overview
sidebar_position: 1
description: "0G Mainnet network details including Chain ID, RPC endpoints, contract addresses, and wallet setup for production deployments."
---

import OKXButton from '@site/src/components/OKXButton';
import MetaMaskButton from '@site/src/components/MetaMaskButton';
import React from 'react';

# 0G Mainnet

Build and run production workloads on the 0G Mainnet.

:::tip Mainnet Explorer
🔍 **[Explore Mainnet Activity](https://explorer.0g.ai/mainnet/home)**
:::

## Network Details

| Parameters | Network Details |
|----------------|---|
| **Network Name** | 0G Mainnet |
| **Chain ID** | 16661 |
| **Token Symbol** | 0G |
| **RPC URL** | `https://evmrpc.0g.ai` |
| **Storage Indexer** | `https://indexer-storage-turbo.0g.ai` |
| **Block Explorer** | `https://chainscan.0g.ai` |

#### ✅ 3rd Party RPCs (Recommended for production)
- [QuickNode](https://www.quicknode.com/chains/0g)
- [ThirdWeb](https://thirdweb.com/0g-aristotle)
- [Ankr](https://www.ankr.com/rpc/0g/)

### Add Network to Wallet

<div className="wallet-buttons" style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
  <MetaMaskButton
    label="Add 0G Mainnet"
    chainId={16661}
    chainName="0G Mainnet"
    tokenName="0G"
    tokenSymbol="0G"
    tokenDecimals={18}
    rpcUrls={["https://evmrpc.0g.ai"]}
    blockExplorerUrls={["https://chainscan.0g.ai"]}
  />
  <OKXButton
    label="Add 0G Mainnet"
    chainId={16661}
    chainName="0G Mainnet"
    tokenName="0G"
    tokenSymbol="0G"
    tokenDecimals={18}
    rpcUrls={["https://evmrpc.0g.ai"]}
    blockExplorerUrls={["https://chainscan.0g.ai"]}
  />
</div>

:::info Alternative RPC Providers
For redundancy in production apps, consider adding multiple RPC providers where available.
:::

## Contract Addresses

**0G Storage**
- Flow: `0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526`
- Mine: `0xCd01c5Cd953971CE4C2c9bFb95610236a7F414fe`
- Reward: `0x457aC76B58ffcDc118AABD6DbC63ff9072880870`

## Developer Tools
- **Chain Explorer**: `https://chainscan.0g.ai (https://chainscan.0g.ai)`
