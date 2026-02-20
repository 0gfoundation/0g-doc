---
id: ai-context
title: AI Coding Context
sidebar_class_name: hidden
---

# 0G AI Context for Coding Assistants

This page provides comprehensive context about 0G infrastructure to help AI coding assistants help developers build on 0G. All information is extracted from the official documentation at https://docs.0g.ai.

## Network Configurations

### Testnet (Galileo)
**Explorer**: [https://explorer.0g.ai/testnet/home](https://explorer.0g.ai/testnet/home)

| Parameter | Value |
|-----------|-------|
| **Network Name** | 0G-Galileo-Testnet |
| **Chain ID** | 16602 |
| **Token Symbol** | 0G |
| **RPC Endpoint** | https://evmrpc-testnet.0g.ai |
| **Block Explorer** | https://chainscan-galileo.0g.ai |
| **Storage Explorer** | https://storagescan-galileo.0g.ai |
| **Validator Dashboard** | https://testnet.0g.explorers.guru |
| **Faucet** | https://faucet.0g.ai (0.1 0G/day) |
| **Storage Start Block** | 1 |
| **DA Start Block** | 940000 |

**Documentation**: [https://docs.0g.ai/developer-hub/testnet/testnet-overview](https://docs.0g.ai/developer-hub/testnet/testnet-overview)

**Third-Party RPCs (Recommended for Production)**:
- QuickNode: https://www.quicknode.com/chains/0g
- ThirdWeb: https://thirdweb.com/0g-galileo-testnet-16601
- Ankr: https://www.ankr.com/rpc/0g/
- dRPC NodeCloud: https://drpc.org/chainlist/0g-galileo-testnet-rpc

### Mainnet (Aristotle)
**Explorer**: [https://explorer.0g.ai/mainnet/home](https://explorer.0g.ai/mainnet/home)

| Parameter | Value |
|-----------|-------|
| **Network Name** | 0G Mainnet |
| **Chain ID** | 16661 |
| **Token Symbol** | 0G |
| **RPC Endpoint** | https://evmrpc.0g.ai |
| **Storage Indexer** | https://indexer-storage-turbo.0g.ai |
| **Block Explorer** | https://chainscan.0g.ai |
| **Storage Start Block** | 2387557 |

**Documentation**: [https://docs.0g.ai/developer-hub/mainnet/mainnet-overview](https://docs.0g.ai/developer-hub/mainnet/mainnet-overview)

**Third-Party RPCs (Recommended for Production)**:
- QuickNode: https://www.quicknode.com/chains/0g
- ThirdWeb: https://thirdweb.com/0g-aristotle
- Ankr: https://www.ankr.com/rpc/0g/

## Smart Contract Addresses

### Testnet Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **Flow** | `0x22E03a6A89B950F1c82ec5e74F8eCa321a105296` | Storage data flow management |
| **Mine** | `0x00A9E9604b0538e06b268Fb297Df333337f9593b` | Storage mining rewards |
| **Reward** | `0xA97B57b4BdFEA2D0a25e535bd849ad4e6C440A69` | Reward distribution |
| **DAEntrance** | `0xE75A073dA5bb7b0eC622170Fd268f35E675a957B` | DA blob submission |
| **DASigners** | `0x0000000000000000000000000000000000001000` | DA signer management (precompile) |
| **WrappedOGBase** | `0x0000000000000000000000000000000000001001` | Wrapped native token (precompile) |
| **Compute Ledger** | `0xE70830508dAc0A97e6c087c75f402f9Be669E406` | Compute network payment ledger |
| **Compute Inference** | `0xa79F4c8311FF93C06b8CfB403690cc987c93F91E` | Compute inference service |
| **Compute FineTuning** | `0xaC66eBd174435c04F1449BBa08157a707B6fa7b1` | Compute fine-tuning service |

### Mainnet Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **Flow** | `0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526` | Storage data flow management |
| **Mine** | `0xCd01c5Cd953971CE4C2c9bFb95610236a7F414fe` | Storage mining rewards |
| **Reward** | `0x457aC76B58ffcDc118AABD6DbC63ff9072880870` | Reward distribution |
| **DASigners** | `0x0000000000000000000000000000000000001000` | DA signer management (precompile) |
| **WrappedOGBase** | `0x0000000000000000000000000000000000001001` | Wrapped native token (precompile) |
| **Compute Ledger** | `0x2dE54c845Cd948B72D2e32e39586fe89607074E3` | Compute network payment ledger |
| **Compute Inference** | `0x47340d900bdFec2BD393c626E12ea0656F938d84` | Compute inference service |
| **Compute FineTuning** | `0x4e3474095518883744ddf135b7E0A23301c7F9c0` | Compute fine-tuning service |

## 0G Services Overview

### 0G Chain
**Documentation**: [https://docs.0g.ai/concepts/chain](https://docs.0g.ai/concepts/chain)

Fastest modular AI chain with 11,000 TPS per Shard, sub-second finality, and full EVM compatibility.

**Key Features**:
- **Full EVM compatibility** - Use existing Ethereum tools (Hardhat, Foundry, Remix)
- **11,000 TPS per Shard** with sub-second finality
- **Same as Ethereum development** - just different RPC endpoint
- Optimized CometBFT consensus
- Native precompiled contracts for DA and wrapped tokens

**Deploy Smart Contracts**:

Using Hardhat:
```javascript
// hardhat.config.js
module.exports = {
  networks: {
    testnet: {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: ["YOUR_PRIVATE_KEY"]
    },
    mainnet: {
      url: "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  },
  solidity: "0.8.20"
};
```

Using Foundry:
```bash
# Testnet
forge create --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key YOUR_PRIVATE_KEY \
  src/MyContract.sol:MyContract

# Mainnet
forge create --rpc-url https://evmrpc.0g.ai \
  --private-key YOUR_PRIVATE_KEY \
  src/MyContract.sol:MyContract
```

Using Remix:
1. Open Remix IDE
2. Compile your contract
3. Go to Deploy & Run Transactions
4. Select "Injected Provider - MetaMask"
5. Ensure MetaMask is connected to 0G network
6. Deploy!

**Precompiled Contracts**:

DASigners (0x0000000000000000000000000000000000001000):
```solidity
// Query DA signers and epochs
function getEpochNumber(uint256 blockNumber) external view returns (uint256);
function getQuorum(uint256 epochNumber, uint256 quorumId) external view returns (Signer[] memory);
function isSigner(uint256 epochNumber, address account) external view returns (bool);
```

WrappedOGBase (0x0000000000000000000000000000000000001001):
```solidity
// Wrapped native token (like WETH)
function deposit() external payable;
function withdraw(uint256 amount) external;
function balanceOf(address account) external view returns (uint256);
```

**Verification & Indexing**:
- **Goldsky**: GraphQL indexing and real-time data streaming
  - Docs: https://docs.goldsky.com/chains/0g
  - Guide: [https://docs.0g.ai/developer-hub/building-on-0g/indexing/goldsky](https://docs.0g.ai/developer-hub/building-on-0g/indexing/goldsky)

**Documentation Links**:
- Deploy Contracts: [https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts)
- Precompiles: [https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/precompiles/overview](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/precompiles/overview)
- Staking: [https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/staking-interfaces](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/staking-interfaces)
- Validator Contracts: [https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/validator-contract-functions](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/validator-contract-functions)

### 0G Storage
**Documentation**: [https://docs.0g.ai/concepts/storage](https://docs.0g.ai/concepts/storage)

Decentralized storage offering 95% lower costs than AWS with instant retrieval.

**Key Features**:
- 95% cheaper than centralized alternatives
- 200 MBPS retrieval speed
- Proven TB-scale operations
- Two storage layers: Log (immutable) + KV (mutable)
- Proof of Random Access (PoRA) consensus

**SDK Installation**:

TypeScript/JavaScript:
```bash
npm install @0glabs/0g-ts-sdk ethers
```

Python:
```bash
pip install 0g-storage-client
```

Go:
```bash
go get github.com/0gfoundation/0g-storage-client
```

**Quick Start Examples**:

TypeScript - Upload File:
```typescript
import { ZgFile, Indexer } from "@0glabs/0g-ts-sdk";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
const indexer = new Indexer("https://indexer-storage-testnet-turbo.0g.ai");

const file = await ZgFile.fromFilePath("/path/to/file");
const [tree, treeErr] = await file.merkleTree();
console.log("Root Hash:", tree?.rootHash());

const [tx, uploadErr] = await indexer.upload(file, "https://evmrpc-testnet.0g.ai", signer);
await file.close();
```

Python - Upload File:
```python
from storage_client import ZgStorageClient

client = ZgStorageClient(
    rpc_endpoint="https://evmrpc-testnet.0g.ai",
    contract_address="0x22E03a6A89B950F1c82ec5e74F8eCa321a105296",
    private_key="YOUR_PRIVATE_KEY"
)

root_hash = client.upload_file("/path/to/file")
```

**CLI Tool**:
```bash
# Install
git clone https://github.com/0gfoundation/0g-storage-client.git
cd 0g-storage-client
go build

# Upload file
0g-storage-client upload \
  --url https://evmrpc-testnet.0g.ai \
  --key YOUR_PRIVATE_KEY \
  --indexer https://indexer-storage-testnet-turbo.0g.ai \
  --file /path/to/file

# Download file
0g-storage-client download \
  --indexer https://indexer-storage-testnet-turbo.0g.ai \
  --root <ROOT_HASH> \
  --file output.dat

# Upload directory
0g-storage-client upload-dir \
  --url https://evmrpc-testnet.0g.ai \
  --key YOUR_PRIVATE_KEY \
  --indexer https://indexer-storage-testnet-turbo.0g.ai \
  --file /path/to/directory

# Download directory
0g-storage-client download-dir \
  --indexer https://indexer-storage-testnet-turbo.0g.ai \
  --root <DIRECTORY_ROOT_HASH> \
  --file /path/to/output
```

**Documentation Links**:
- SDK Guide: [https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk](https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk)
- CLI Guide: [https://docs.0g.ai/developer-hub/building-on-0g/storage/storage-cli](https://docs.0g.ai/developer-hub/building-on-0g/storage/storage-cli)

**GitHub Repositories**:
- Storage Node: https://github.com/0gfoundation/0g-storage-node
- Storage KV: https://github.com/0gfoundation/0g-storage-kv
- Storage Client/CLI: https://github.com/0gfoundation/0g-storage-client
- TypeScript SDK: https://github.com/0gfoundation/0g-ts-sdk
- Python SDK: https://github.com/0gfoundation/0g-storage-client
- Go SDK: https://github.com/0gfoundation/0g-storage-client

### 0G Compute
**Documentation**: [https://docs.0g.ai/concepts/compute](https://docs.0g.ai/concepts/compute)

Decentralized GPU marketplace offering 90% cheaper AI workloads with OpenAI SDK compatibility.

**Key Features**:
- 90% cost reduction vs traditional cloud (e.g., $0.003 vs $0.03 per 1K tokens)
- Pay-per-use pricing (no subscriptions or monthly minimums)
- OpenAI SDK compatible - drop-in replacement
- Smart contract escrow for trustless payments
- TEE (Trusted Execution Environment) for secure processing
- 50-100ms inference latency
- Supports: Chatbot (LLM), Text-to-Image, Speech-to-Text

**DePIN Partners**:
- **io.net**: 300,000+ GPUs across 139 countries
- **Aethir**: 43,000+ enterprise-grade GPUs, 3,000+ H100s/H200s

**Quick Start (5 minutes)**:

Install CLI:
```bash
pnpm add @0glabs/0g-serving-broker -g
```

Option 1 - Web UI (Easiest):
```bash
# Launch Web UI
0g-compute-cli ui start-web

# Open http://localhost:3090
# Connect wallet, deposit tokens, start using AI services
```

Option 2 - CLI:
```bash
# Setup network
0g-compute-cli setup-network

# Login with wallet
0g-compute-cli login

# Fund account
0g-compute-cli deposit --amount 10

# List available providers
0g-compute-cli inference list-providers

# Transfer funds to provider
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 5

# Acknowledge provider
0g-compute-cli inference acknowledge-provider --provider <PROVIDER_ADDRESS>

# Get API key for direct access
0g-compute-cli inference get-secret --provider <PROVIDER_ADDRESS>
```

Option 3 - Direct API (OpenAI Compatible):
```bash
curl <service_url>/v1/proxy/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer app-sk-<YOUR_SECRET>" \
  -d '{
    "model": "<model_name>",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

**OpenAI SDK Integration**:
```python
from openai import OpenAI

client = OpenAI(
    api_key="app-sk-<YOUR_SECRET>",
    base_url="<service_url>/v1/proxy"
)

response = client.chat.completions.create(
    model="<model_name>",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)
```

**Fine-tuning Models**:
```bash
# Prepare dataset (JSONL format)
# Each line: {"prompt": "...", "completion": "..."}

# Upload dataset
0g-compute-cli fine-tuning upload-data --file dataset.jsonl

# Create fine-tuning task
0g-compute-cli fine-tuning create-task \
  --model Qwen2.5-0.5B-Instruct \
  --dataset <DATASET_ID> \
  --provider <PROVIDER_ADDRESS>

# Monitor progress
0g-compute-cli fine-tuning get-task --task-id <TASK_ID>
```

**Documentation Links**:
- Overview: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/overview](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/overview)
- Inference: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference)
- Fine-tuning: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning)
- Account Management: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/account-management](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/account-management)
- Provider Setup: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference-provider](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference-provider)

### 0G DA (Data Availability)
**Documentation**: [https://docs.0g.ai/concepts/da](https://docs.0g.ai/concepts/da)

Scalable data availability layer for rollups with 50 Gbps throughput.

**Key Features**:
- 50 Gbps demonstrated throughput
- VRF-based node selection
- Inherits Ethereum security

**For Rollup Developers**:
- OP Stack Integration: [https://docs.0g.ai/developer-hub/building-on-0g/rollups-and-appchains/op-stack-on-0g-da](https://docs.0g.ai/developer-hub/building-on-0g/rollups-and-appchains/op-stack-on-0g-da)
  - Repo: https://github.com/0gfoundation/0g-da-op-plasma
- Arbitrum Nitro: [https://docs.0g.ai/developer-hub/building-on-0g/rollups-and-appchains/arbitrum-nitro-on-0g-da](https://docs.0g.ai/developer-hub/building-on-0g/rollups-and-appchains/arbitrum-nitro-on-0g-da)
  - Repo: https://github.com/0gfoundation/nitro
- Integration Guide: [https://docs.0g.ai/developer-hub/building-on-0g/da-integration](https://docs.0g.ai/developer-hub/building-on-0g/da-integration)

### INFT (Intelligent NFTs)
**Documentation**: [https://docs.0g.ai/concepts/inft](https://docs.0g.ai/concepts/inft)

NFT standard (ERC-7857) for tokenizing AI agents with complete intelligence.

**Key Features**:
- Extends ERC-721 standard
- Encrypted metadata storage via 0G Storage
- Secure re-encryption for ownership transfer
- Oracle verification
- True AI ownership transfer

**Use Cases**:
- AI Trading Bots
- Personal Assistants
- Game Characters
- Content Creation AI
- Research Tools

**Documentation Links**:
- INFT Overview: [https://docs.0g.ai/developer-hub/building-on-0g/inft/inft-overview](https://docs.0g.ai/developer-hub/building-on-0g/inft/inft-overview)
- ERC-7857 Standard: [https://docs.0g.ai/developer-hub/building-on-0g/inft/erc7857](https://docs.0g.ai/developer-hub/building-on-0g/inft/erc7857)
- Integration Guide: [https://docs.0g.ai/developer-hub/building-on-0g/inft/integration](https://docs.0g.ai/developer-hub/building-on-0g/inft/integration)

## Running Nodes

### Hardware Requirements

| Node Type | Memory | CPU | Disk | Bandwidth | Purpose |
|-----------|--------|-----|------|-----------|---------|
| **Validator (Mainnet)** | 64 GB | 8 cores | 1 TB NVMe | 100 Mbps | Transaction validation |
| **Validator (Testnet)** | 64 GB | 8 cores | 4 TB NVMe | 100 Mbps | Transaction validation |
| **Storage Node** | 32 GB | 8 cores | 500GB-1TB SSD | 100 Mbps | Data storage |
| **Storage KV** | 32 GB | 8 cores | Flexible | - | Key-value storage |
| **DA Node** | 16 GB | 8 cores | 1 TB NVMe | 100 Mbps | Blob verification |
| **Archival Node** | 64 GB | 8 cores | Large NVMe | 100 Mbps | Historical data |

### Validator Node Setup

**Mainnet (Aristotle)**:
```bash
# Install dependencies
sudo apt update && sudo apt install -y make gcc jq curl git lz4 build-essential

# Install Go
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# Clone and build
git clone -b v1.0.4 https://github.com/0gfoundation/0gchain-Aristotle
cd 0gchain-Aristotle
make install

# Initialize
0gchaind init <YOUR_MONIKER> --chain-id zgtendermint_16661-1

# Configure
wget -O ~/.0gchain/config/genesis.json https://github.com/0gfoundation/0gchain-Aristotle/releases/download/v1.0.4/genesis.json
```

**Testnet (Galileo)**:
```bash
# Clone and build
git clone -b v3.0.4 https://github.com/0gfoundation/0gchain-NG
cd 0gchain-NG
make install

# Initialize
0gchaind init <YOUR_MONIKER> --chain-id zgtendermint_16602-1

# Configure
wget -O ~/.0gchain/config/genesis.json https://github.com/0gfoundation/0gchain-NG/releases/download/v3.0.4/genesis.json
```

**Documentation**: [https://docs.0g.ai/run-a-node/validator-node](https://docs.0g.ai/run-a-node/validator-node)

### Storage Node Setup

**Build from Source**:
```bash
# Install dependencies
sudo apt-get update
sudo apt-get install clang cmake build-essential pkg-config libssl-dev protobuf-compiler

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone and build
git clone -b <latest_tag> https://github.com/0gfoundation/0g-storage-node.git
cd 0g-storage-node
cargo build --release
```

**Configuration (Testnet)**:
```toml
# config.toml
log_contract_address = "0x22E03a6A89B950F1c82ec5e74F8eCa321a105296"
mine_contract_address = "0x00A9E9604b0538e06b268Fb297Df333337f9593b"
reward_contract_address = "0xA97B57b4BdFEA2D0a25e535bd849ad4e6C440A69"
blockchain_rpc_endpoint = "https://evmrpc-testnet.0g.ai"
log_sync_start_block_number = 1
miner_key = "YOUR_PRIVATE_KEY"
```

**Configuration (Mainnet)**:
```toml
# config.toml
log_contract_address = "0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526"
mine_contract_address = "0xCd01c5Cd953971CE4C2c9bFb95610236a7F414fe"
reward_contract_address = "0x457aC76B58ffcDc118AABD6DbC63ff9072880870"
blockchain_rpc_endpoint = "https://evmrpc.0g.ai"
log_sync_start_block_number = 2387557
miner_key = "YOUR_PRIVATE_KEY"
```

**Sharding Configuration**:
```toml
# Format: shard_id/shard_number where shard_number is 2^n
# Only applies on first startup if no stored shard config in db
shard_position = "0/2"
```

Sharding allows controlling how much data your node stores:
- `"0/2"` or `"1/2"` = 50% of total data (each on specific ranges)
- `"0/4"` to `"3/4"` = 25% of total data each
- Initial setup is deterministic (shard_id maps to specific range)
- Auto-splitting is NOT deterministic (random assignment when capacity exceeded)

**Run Storage Node**:
```bash
cd run
../target/release/zgs_node --config config.toml --miner-key <your_private_key>
```

**Documentation**: [https://docs.0g.ai/run-a-node/storage-node](https://docs.0g.ai/run-a-node/storage-node)

## Developer Tools

### Indexing with Goldsky

**Website**: https://docs.goldsky.com/chains/0g

**Products**:
- **Subgraphs**: GraphQL indexing for smart contracts
- **Mirror**: Real-time data streaming to databases

**Documentation**: [https://docs.0g.ai/developer-hub/building-on-0g/indexing/goldsky](https://docs.0g.ai/developer-hub/building-on-0g/indexing/goldsky)

### Rollup-as-a-Service

**Caldera on 0G DA**: [https://docs.0g.ai/developer-hub/building-on-0g/rollup-as-a-service/caldera-on-0g-da](https://docs.0g.ai/developer-hub/building-on-0g/rollup-as-a-service/caldera-on-0g-da)

### Smart Contract Development

**Deploy with Hardhat**:
```javascript
// hardhat.config.js
module.exports = {
  networks: {
    testnet: {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: ["YOUR_PRIVATE_KEY"]
    },
    mainnet: {
      url: "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  }
};
```

**Deploy with Foundry**:
```bash
# Testnet
forge create --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key YOUR_PRIVATE_KEY \
  src/MyContract.sol:MyContract

# Mainnet
forge create --rpc-url https://evmrpc.0g.ai \
  --private-key YOUR_PRIVATE_KEY \
  src/MyContract.sol:MyContract
```

**Documentation**: [https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts)


## Key Concepts

### AI Alignment
**Documentation**: [https://docs.0g.ai/concepts/ai-alignment](https://docs.0g.ai/concepts/ai-alignment)

Monitor AI systems for proper behavior, safety, and alignment with human values.

**Functions**:
- Track model drift
- Verify outputs
- Monitor performance
- Flag anomalies

### DePIN (Decentralized Physical Infrastructure)
**Documentation**: [https://docs.0g.ai/concepts/depin](https://docs.0g.ai/concepts/depin)

Physical GPU infrastructure provided by decentralized partners.

**Partners**:
- **io.net**: 300,000+ verified GPUs, 139 countries, 90% cost savings
- **Aethir**: 43,000+ enterprise GPUs, 3,000+ H100s/H200s, 99.99% uptime

## Starter Kits & Examples

### Compute Starter Kit
**Quick Start (Recommended for Hackathons)**:
```bash
# Install global CLI
pnpm add @0glabs/0g-serving-broker -g

# Option 1: Web UI (fastest way to start)
0g-compute-cli ui start-web
# Open http://localhost:3090, connect wallet, start using AI

# Option 2: CLI for automation
0g-compute-cli setup-network  # Choose testnet/mainnet
0g-compute-cli login           # Connect your wallet
0g-compute-cli deposit --amount 10  # Fund account
0g-compute-cli inference list-providers  # See available services
```

**OpenAI SDK Drop-in Replacement**:
```python
from openai import OpenAI

# Just change base_url and api_key!
client = OpenAI(
    api_key="app-sk-<YOUR_SECRET>",
    base_url="<PROVIDER_URL>/v1/proxy"
)

# Same API as OpenAI
response = client.chat.completions.create(
    model="<model_name>",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Storage Starter Kit
**TypeScript Example**:
```bash
npm install @0glabs/0g-ts-sdk ethers
```
```typescript
import { ZgFile, Indexer } from "@0glabs/0g-ts-sdk";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
const indexer = new Indexer("https://indexer-storage-testnet-turbo.0g.ai");

// Upload file
const file = await ZgFile.fromFilePath("/path/to/file");
const [tree, treeErr] = await file.merkleTree();
console.log("Root Hash:", tree?.rootHash());
const [tx, uploadErr] = await indexer.upload(file, "https://evmrpc-testnet.0g.ai", signer);
await file.close();

// Download file
const err = await indexer.download(rootHash, "/path/to/output", true);
```

**Python Example**:
```bash
pip install 0g-storage-client
```
```python
from storage_client import ZgStorageClient

client = ZgStorageClient(
    rpc_endpoint="https://evmrpc-testnet.0g.ai",
    contract_address="0x22E03a6A89B950F1c82ec5e74F8eCa321a105296",
    private_key="YOUR_PRIVATE_KEY"
)

# Upload
root_hash = client.upload_file("/path/to/file")

# Download
client.download_file(root_hash, "/path/to/output")
```

### Chain/Smart Contract Starter Kit
**Hardhat Project**:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```
```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    testnet: {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network testnet
```

**Foundry Project**:
```bash
forge init my-project
cd my-project
```
```bash
# Deploy
forge create --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key $PRIVATE_KEY \
  src/Counter.sol:Counter

# Verify interaction
cast call <CONTRACT_ADDRESS> "number()" --rpc-url https://evmrpc-testnet.0g.ai
```

### SDK Examples
- TypeScript SDK: https://github.com/0gfoundation/0g-ts-sdk/tree/main/examples
- Go SDK: https://github.com/0gfoundation/0g-storage-client/tree/main/examples

### Community Projects
**Awesome 0G Repository**: https://github.com/0gfoundation/awesome-0g

Curated list of community projects, tools, and resources built on 0G.

## Quick Reference

### Add Network to MetaMask

**Testnet**:
```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x40EA',
    chainName: '0G-Galileo-Testnet',
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: ['https://evmrpc-testnet.0g.ai'],
    blockExplorerUrls: ['https://chainscan-galileo.0g.ai']
  }]
});
```

**Mainnet**:
```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x4125',
    chainName: '0G Mainnet',
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: ['https://evmrpc.0g.ai'],
    blockExplorerUrls: ['https://chainscan.0g.ai']
  }]
});
```

### Common Commands

**Storage Upload (CLI)**:
```bash
0g-storage-client upload \
  --url https://evmrpc-testnet.0g.ai \
  --key YOUR_PRIVATE_KEY \
  --indexer https://indexer-storage-testnet-turbo.0g.ai \
  --file /path/to/file
```

**Storage Download (CLI)**:
```bash
0g-storage-client download \
  --indexer https://indexer-storage-testnet-turbo.0g.ai \
  --root ROOT_HASH \
  --file output.dat
```

**Check Node Status**:
```bash
# Validator
0gchaind status 2>&1 | jq .

# Storage Node
curl http://localhost:5678/status

# DA Node
curl http://localhost:34000/health
```

## Community & Support

### Official Links
- **Documentation**: https://docs.0g.ai
- **Website**: https://0g.ai
- **GitHub**: https://github.com/0gfoundation
- **Discord**: https://discord.gg/0gLabs
- **Twitter/X**: https://x.com/0g_Labs

### Getting Help
- Documentation: [https://docs.0g.ai/developer-hub/getting-started](https://docs.0g.ai/developer-hub/getting-started)
- Discord Developer Channel: https://discord.gg/0gLabs
- GitHub Issues: Create issues in respective repositories

## Vision & Mission

**Mission**: Make AI a Public Good

**Vision**: Democratized, transparent, fair, and secure AI infrastructure

**Approach**:
- Open infrastructure
- Community ownership
- Economic alignment
- Technical excellence

**Documentation**: [https://docs.0g.ai/introduction/vision-mission](https://docs.0g.ai/introduction/vision-mission)

---

## Additional Resources

### Node Sale Information
**Documentation**: [https://docs.0g.ai/node-sale/node-sale-index](https://docs.0g.ai/node-sale/node-sale-index)

### Security
**Documentation**: [https://docs.0g.ai/resources/security](https://docs.0g.ai/resources/security)

### Contributing
**Documentation**: [https://docs.0g.ai/resources/how-to-contribute](https://docs.0g.ai/resources/how-to-contribute)

### Glossary
**Documentation**: [https://docs.0g.ai/resources/glossary](https://docs.0g.ai/resources/glossary)

---

*This context page is automatically maintained to provide AI coding assistants with comprehensive, up-to-date information about 0G infrastructure. All information is sourced from official documentation at https://docs.0g.ai.*
