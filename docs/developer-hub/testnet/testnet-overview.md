---
id: testnet-overview
title: Testnet Overview
sidebar_position: 1
---

import OKXButton from '@site/src/components/OKXButton';
import MetaMaskButton from '@site/src/components/MetaMaskButton';
import RemoveNewtonModal from '@site/src/components/RemoveNewtonModal';
import React, { useState } from 'react';

# 0G Testnet (Galileo)

Test your applications on 0G's infrastructure without real costs or risks.

:::tip Testnet Explorer
🔍 **[Explore Testnet Activity](https://explorer.0g.ai/testnet/home)**
:::

## Network Details

| Parameters | Network Details |
|----------------|---|
| **Network Name** | 0G-Galileo-Testnet |
| **Chain ID** | 16602 |
| **Token Symbol** | 0G |
| **Block Explorer** | ```https://chainscan-galileo.0g.ai``` |
| **Faucet** | https://faucet.0g.ai |


#### ✅ 3rd Party RPCs (Recommended for production)
- [QuickNode](https://www.quicknode.com/chains/0g)
- [ThirdWeb](https://thirdweb.com/0g-galileo-testnet-16601)
- [Ankr](https://www.ankr.com/rpc/0g/)
- [dRPC NodeCloud](https://drpc.org/chainlist/0g-galileo-testnet-rpc)



## Getting Started

### Step 1: Add Network to Wallet

export const AddNetworkSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="admonition admonition-note alert alert--warning">
        <div className="admonition-content">
          <p>
            Remove any old 0G testnet configurations before adding Galileo. 
            <a href="#" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }} style={{marginLeft: '5px'}}>
              Need help?
            </a>
          </p>
        </div>
      </div>

      <div className="wallet-buttons">
        <MetaMaskButton label="Add to MetaMask" />
        <OKXButton label="Add to OKX Wallet" />
      </div>

      <RemoveNewtonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

<AddNetworkSection />

<style>
  {`
    .wallet-buttons {
      display: flex;
      gap: 16px;
      margin: 16px 0;
    }
    
    @media (max-width: 768px) {
      .wallet-buttons {
        flex-direction: column;
      }
    }
  `}
</style>

### Step 2: Get Test Tokens

Visit the [0G Faucet](https://faucet.0g.ai) to receive free testnet tokens. **Daily Limit**: 0.1 0G per wallet.


### Step 3: Start Building

Choose your integration:
- [Deploy Smart Contracts](/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts)
- [Use Storage SDK](/developer-hub/building-on-0g/storage/sdk)
- [Access Compute Network](/developer-hub/building-on-0g/compute-network/inference)
- [Integrate DA Layer](/developer-hub/building-on-0g/da-integration)


### Contract Addresses

:::caution
Addresses may change during testnet.
:::

**0G Storage**
- Flow: `0x22E03a6A89B950F1c82ec5e74F8eCa321a105296`
- Mine: `0x00A9E9604b0538e06b268Fb297Df333337f9593b`
- Reward: `0xA97B57b4BdFEA2D0a25e535bd849ad4e6C440A69`

**0G DA**
- DAEntrance: `0xE75A073dA5bb7b0eC622170Fd268f35E675a957B`

<!-- **Deployment Block**: `326165` -->

## Developer Tools

### Block Explorers
- **[Chain Explorer](https://chainscan-galileo.0g.ai)**: View transactions, blocks, and smart contracts
- **[Storage Explorer](https://storagescan-galileo.0g.ai)**: Track storage operations and metrics
- **[Validator Dashboard](https://testnet.0g.explorers.guru)**: Monitor network validators

<details>
<summary>Development RPC</summary>

:::warning Development Only
This endpoint is for development purposes and should not be used in production applications.
:::

`https://evmrpc-testnet.0g.ai`

</details>

## Faucet
- Use the [official Faucet](https://faucet.0g.ai) to request tokens. Each user can receive up to 0.1 0G token per day, which is sufficient for most testing needs.

- If you require more than 0.1 0G token per day, please reach out in our vibrant [discord](https://discord.com/invite/0glabs) community to request additional tokens.
