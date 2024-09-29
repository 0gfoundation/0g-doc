---
sidebar_position: 3
---
# Testnet Information
---

Welcome to Testnet-V2, where you can contribute to our network by operating various node types, including Validator, Storage, and DA (Data Availability) nodes. This page provides an overview of the testnet process and important information for participants.

:::important note
The validator selection process described here applies **only to the testnet**. Mainnet will have a different selection mechanism.
While it's possible to run nodes (ex: DA node vs Validator Node) independently, your chances of being selected as a _validator_ increases if you run multiple node types. 
If your validator is selected, it will manually be delegated by our team within a few days.
If you have any questions, reach out to us on [discord](https://discord.com/invite/0glabs)
:::

## Node FAQ (Frequently Asked Questions)

In Testnet-V2, we've implemented a fair and transparent process for selecting validators and managing various node types. Here's a summary of the key features:

**How do I become a validator?**
- You can apply to be a validator [here](https://shorturl.at/fgkoR). We receive numerous validator applications, and there are limited slots, meaning not all applicants can be accommodated. However, we have implemented a fair and transparent process for selecting validators and rotate the validators every few weeks. If you are not chosen for one rotation, that does not mean you will not be chosen for the next one. We appreciate your patience and continued interest in contributing to our network. 

**Why are there limited validator slots?** 
- Since we are currently using Cosmos/Tendermint consensus and they are limited to ~125 validators, we can only select 125 validators at this time. However, we anticipate this number will increase in the future when we transition to our own custom consensus. 

**What happens if I'm not selected to be a validator?**
- Validators are rotated every ~two weeks, so even if you're not selected for this round, you may be selected in the next rotation. Furthermore, validators are just one of the node types -- you can also run any of the other node types, like storage and DA. For detailed instructions on how to apply and operate each node type, please refer to our comprehensive setup guides:
  - [Run a Storage Node](run-a-node/storage.md)
  - [Run a DA Node](run-a-node/da.md)
  - [Run a Validator Node](run-a-node/validator.md)

## 0G Testnet Configuration

| Field | Value |
|-------|-------|
| Chain Name | 0G-Newton-Testnet |
| Chain ID | 16600 (`zgtendermint_16600-2`) |
| Token Symbol | A0GI |
| Chain RPC | https://evmrpc-testnet.0g.ai |
| Chain Websocket | https://cosmosrpc-testnet.0g.ai |
| Storage Standard RPC | https://rpc-storage-testnet.0g.ai |
| Storage Turbo RPC | https://rpc-storage-testnet-turbo.0g.ai |
| Chain Explorer | https://chainscan-newton.0g.ai/ |
| Storage Explorer | https://storagescan-newton.0g.ai/ |

## Contract Addresses

:::caution
The contract address might change during the public testnet phase, so please check this page regularly for updates. 
:::

| Component | Contract | Address |
|-----------|----------|---------|
| **0G Storage Turbo** | Flow Contract | `0xbD2C3F0E65eDF5582141C35969d66e34629cC768` |
| | Mine Contract | `0x6815F41019255e00D6F34aAB8397a6Af5b6D806f` |
| | Market Contract | `0xBa697dB4e9293e6d7674045373508823A85d0798` |
| | Reward Contract | `0x51998C4d486F406a788B766d93510980ae1f9360` |
| **0G Storage Standard** | Flow Contract | `0x0460aA47b41a66694c0a73f667a1b795A5ED3556` |
| | Mine Contract | `0x1785c8683b3c527618eFfF78d876d9dCB4b70285` |
| | Market Contract | `0x20f7e27cD0FaBD87F96afC4E83A88a47E9Ce4689` |
| | Reward Contract | `0x0496D0817BD8519e0de4894Dc379D35c35275609` |
| **0G DA** | DAEntrance Contract | `0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9` |

Deployed Block Number: `595059`

### Third-party RPCs

- [thirdweb RPC](https://thirdweb.com/0g-newton-testnet)

### Community RPCs

**community RPCs will be listed here**

