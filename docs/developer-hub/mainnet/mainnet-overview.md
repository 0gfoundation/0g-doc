---
id: mainnet-overview
title: Mainnet Overview
sidebar_position: 1
---

import OKXButton from '@site/src/components/OKXButton';
import MetaMaskButton from '@site/src/components/MetaMaskButton';
import React from 'react';

# 0G Mainnet

Build and run production workloads on the 0G Mainnet.

## Network Details

| Parameters         | Network Details           |
| ------------------ | ------------------------- |
| **Network Name**   | 0G Mainnet                |
| **Chain ID**       | 16661                     |
| **Token Symbol**   | 0G                        |
| **Block Explorer** | `https://chainscan.0g.ai` |

#### ✅ 3rd Party RPCs (Recommended for production)

- QuickNode
- ThirdWeb
- Ankr

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
    blockExplorerUrls={["https://chianscan.0g.ai/"]}
  />
  <OKXButton
    label="Add 0G Mainnet"
    chainId={16661}
    chainName="0G Mainnet"
    tokenName="0G"
    tokenSymbol="0G"
    tokenDecimals={18}
    rpcUrls={["https://evmrpc.0g.ai"]}
    blockExplorerUrls={["https://chianscan.0g.ai/"]}
  />
</div>

:::info Alternative RPC Providers
For redundancy in production apps, consider adding multiple RPC providers where available.
:::

## Developer Tools

- **Chain Explorer**: `https://chianscan.0g.ai`
