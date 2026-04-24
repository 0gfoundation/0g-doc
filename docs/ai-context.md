---
id: ai-context
title: AI Coding Context
sidebar_class_name: hidden
description: "Comprehensive 0G infrastructure context for AI coding assistants, including network configs, contract addresses, and SDK examples."
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
| **RPC Endpoint** | https://evmrpc-testnet.0g.ai (development only — use 3rd party RPCs for production) |
| **Block Explorer** | https://chainscan-galileo.0g.ai |
| **Storage Explorer** | https://storagescan-galileo.0g.ai |
| **Validator Dashboard** | https://testnet.0g.explorers.guru |
| **Faucet** | https://faucet.0g.ai (0.1 0G/day) |
| **Faucet (Google Cloud)** | https://cloud.google.com/application/web3/faucet/0g/galileo |
| **Storage Indexer** | https://indexer-storage-testnet-turbo.0g.ai |
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

**Flow Contract Note**: The Flow contract (`log_contract_address`) manages on-chain data flow for storage operations. For **TypeScript SDK file uploads**, the flow contract is handled internally by the Indexer — you only need the EVM RPC URL. For **KV operations**, the flow contract address is still required when constructing a `Batcher`. For **Go SDK**, the indexer client also handles flow contract interaction internally. The flow contract addresses are listed in the contract tables above.

**SDK Installation**:

TypeScript/JavaScript:
```bash
npm install @0gfoundation/0g-ts-sdk ethers
```

Go:
```bash
go get github.com/0gfoundation/0g-storage-client
```

**Starter Kits** (recommended for getting started quickly):
- TypeScript: https://github.com/0gfoundation/0g-storage-ts-starter-kit — CLI scripts (`npm run upload`), importable library (`uploadFile`, `downloadFile`, `uploadData`, `batchUpload`), and browser UI with MetaMask. Supports turbo/standard storage modes.
- Go: https://github.com/0gfoundation/0g-storage-go-starter-kit

**Quick Start Examples**:

TypeScript - Upload File:
```typescript
import { ZgFile, Indexer } from "@0gfoundation/0g-ts-sdk";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
const indexer = new Indexer("https://indexer-storage-testnet-turbo.0g.ai");

// Upload — flow contract is resolved internally by the Indexer
const file = await ZgFile.fromFilePath("/path/to/file");
const [tree, treeErr] = await file.merkleTree();
console.log("Root Hash:", tree?.rootHash());

const [tx, uploadErr] = await indexer.upload(file, "https://evmrpc-testnet.0g.ai", signer);
await file.close();
```

TypeScript - KV Operations (requires flow contract):
```typescript
import { Batcher, KvClient } from "@0gfoundation/0g-ts-sdk";

// KV upload needs the flow contract address
const batcher = new Batcher(1, nodes, flowContract, RPC_URL);
batcher.streamDataBuilder.set(streamId, keyBytes, valueBytes);
const [tx, err] = await batcher.exec();

// KV read
const kvClient = new KvClient("<kv_node_url>");
const value = await kvClient.getValue(streamId, encodedKey);
```

**CLI Tool** (Go — built from 0g-storage-client):
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

# Upload with client-side encryption (AES-256-CTR)
0g-storage-client upload \
  --url https://evmrpc-testnet.0g.ai \
  --key YOUR_PRIVATE_KEY \
  --indexer https://indexer-storage-testnet-turbo.0g.ai \
  --file /path/to/file \
  --encryption-key <hex_key>

# Download file (--proof enables merkle verification)
0g-storage-client download \
  --indexer https://indexer-storage-testnet-turbo.0g.ai \
  --root <ROOT_HASH> \
  --file output.dat \
  --proof

# KV write
0g-storage-client kv-write \
  --url https://evmrpc-testnet.0g.ai \
  --key YOUR_PRIVATE_KEY \
  --indexer https://indexer-storage-testnet-turbo.0g.ai \
  --stream-id <STREAM_ID> \
  --stream-keys <KEYS> \
  --stream-values <VALUES>

# KV read
0g-storage-client kv-read \
  --node <KV_NODE_URL> \
  --stream-id <STREAM_ID> \
  --stream-keys <KEYS>
```

**Indexer REST API** (HTTP gateway for file operations):
```
GET  /file?root=0x...              # Download file by merkle root
GET  /file?txSeq=7                 # Download file by tx sequence
GET  /file/{root}/path/to/file     # Download file from folder
GET  /file/info/{cid}              # Query file info
POST /file/segment                 # Upload file segment (JSON: txSeq/root, index, data, proof)
```

**Documentation Links**:
- SDK Guide: [https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk](https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk)
- CLI Guide: [https://docs.0g.ai/developer-hub/building-on-0g/storage/storage-cli](https://docs.0g.ai/developer-hub/building-on-0g/storage/storage-cli)

**GitHub Repositories**:
- Storage Node: https://github.com/0gfoundation/0g-storage-node
- Storage KV: https://github.com/0gfoundation/0g-storage-kv
- Go Client/CLI: https://github.com/0gfoundation/0g-storage-client
- TypeScript SDK: https://github.com/0gfoundation/0g-ts-sdk

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

**Two Integration Paths**:
1. **Router (recommended)** — a single OpenAI-compatible API endpoint (`https://router-api.0g.ai/v1`) with one unified balance, automatic provider failover, and an API key. Best for server-side apps, agents, prototypes. Web UI: [pc.0g.ai](https://pc.0g.ai).
2. **Direct** — connect to individual providers via the `@0glabs/0g-serving-broker` SDK, manage per-provider sub-accounts, sign each request with your wallet. Best for browser dApps with wallet signing or direct on-chain control. Web UI: [compute-marketplace.0g.ai](https://compute-marketplace.0g.ai) (or **Advanced** mode on pc.0g.ai).

The two balance pools are independent — a Router deposit does not fund Direct sub-accounts and vice versa.

**Quick Start — Router (Recommended)**:

```bash
# 1. Visit https://pc.0g.ai, connect wallet, deposit 0G tokens
# 2. Dashboard → API Keys → create a key with 'inference' permission (starts with sk-)
# 3. Send a request — any OpenAI-compatible client works:

curl https://router-api.0g.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

**OpenAI SDK Integration (Router)**:
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://router-api.0g.ai/v1",
    api_key="sk-YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="zai-org/GLM-5-FP8",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**Router also supports**: image generation via `POST /v1/images/generations` (OpenAI-compatible, sync) or `POST /v1/async/images/generations` + `GET /v1/async/jobs/{jobId}?provider_address=...` (recommended for production) — both paths must pass `"response_format": "b64_json"` today; URL responses will be added later. Also `/v1/audio/transcriptions`, provider routing (`provider.sort`: `latency` / `price`, or `provider.address` to pin), `GET /v1/models` (no auth), `GET /v1/account/balance`, `GET /v1/account/usage/{stats,history}`.

**Quick Start — Direct (SDK)**:

```bash
# Install CLI
pnpm add @0glabs/0g-serving-broker -g

# Setup + fund
0g-compute-cli setup-network
0g-compute-cli login                                    # prompts for wallet private key
0g-compute-cli deposit --amount 10
0g-compute-cli inference list-providers
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 5  # auto-acknowledges

# Get a per-provider secret key
0g-compute-cli inference get-secret --provider <PROVIDER_ADDRESS>
```

With the per-provider secret, you call the provider's proxy directly:
```python
from openai import OpenAI
client = OpenAI(
    base_url="<service_url>/v1/proxy",
    api_key="app-sk-<YOUR_SECRET>",
)
```

**Fine-tuning Models** (uses the Direct account system; not available via Router):
```bash
# Prepare dataset (JSONL format, one {"prompt": "...", "completion": "..."} per line)
0g-compute-cli fine-tuning upload-data --file dataset.jsonl

# Create fine-tuning task (fund the fine-tuning sub-account first: transfer-fund --service fine-tuning)
0g-compute-cli fine-tuning create-task \
  --model Qwen2.5-0.5B-Instruct \
  --dataset <DATASET_ID> \
  --provider <PROVIDER_ADDRESS>

# Monitor progress
0g-compute-cli fine-tuning get-task --task-id <TASK_ID>
```

**Documentation Links**:
- Overview: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/overview](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/overview)
- Router (recommended):
  - Overview: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview)
  - Quickstart: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/quickstart](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/quickstart)
  - Models: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models)
  - Chat Completions: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/chat-completions](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/chat-completions)
  - Provider Routing: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing)
  - Deposits & Billing: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/account/deposits](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/account/deposits)
  - Router vs Direct: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/comparison](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/comparison)
- Direct (SDK):
  - Inference: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference)
  - Account: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/account-management](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/account-management)
- Fine-tuning: [https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning)
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

ERC-7857 is an NFT standard for tokenizing AI agents. It extends ERC-721 with encrypted metadata, secure re-encryption on transfer via TEE/ZKP oracles, cloning, and usage authorization. The reference implementation uses upgradeable beacon proxies and OpenZeppelin AccessControl.

**GitHub Repository**: https://github.com/0gfoundation/0g-agent-nft

**Core Interface (IERC7857)**:
```solidity
interface IERC7857 is IERC721, IERC7857Metadata {
    // Transfer token with encrypted metadata re-encryption
    function iTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        TransferValidityProof[] calldata _proofs
    ) external;

    // Delegate access-proof signing to an assistant address
    function delegateAccess(address _assistant) external;

    // Get the verifier contract (TEE or ZKP oracle)
    function verifier() external view returns (IERC7857DataVerifier);
}
```

**Key Data Structures**:
```solidity
struct IntelligentData {
    string dataDescription;
    bytes32 dataHash;
}

struct TransferValidityProof {
    AccessProof accessProof;      // Signed by receiver
    OwnershipProof ownershipProof; // Signed by TEE/ZKP oracle
}

struct OwnershipProof {
    OracleType oracleType; // TEE or ZKP
    bytes32 dataHash;
    bytes sealedKey;       // Encryption key sealed for receiver
    bytes targetPubkey;
    bytes nonce;
    bytes proof;
}

enum OracleType { TEE, ZKP }
```

**Extensions**:
- **Cloneable** (`IERC7857Cloneable`): `iCloneFrom()` — creates a new token with the same encrypted metadata
- **Authorize** (`IERC7857Authorize`): `authorizeUsage()` / `revokeAuthorization()` — grant usage rights without ownership transfer (max 100 users per token, cleared on transfer)
- **Data Storage** (`ERC7857IDataStorageUpgradeable`): On-chain storage for arrays of `IntelligentData` per token

**Architecture**:
- **AgentNFT**: Main contract — minting, creator tracking, mint fees. Roles: `ADMIN_ROLE`, `OPERATOR_ROLE`, `MINTER_ROLE`
- **Verifier**: Orchestrates TEE/ZKP proof verification with replay protection (nonce-based, 7-day expiry)
- **TeeVerifier**: ECDSA signature verification against a registered TEE oracle address
- **AgentMarket**: Marketplace with order/offer model, EIP-712 signatures, platform + partner fee distribution, and native/ERC20 payment support

**Transfer Flow**:
1. Receiver signs `AccessProof` (proving they want the data)
2. TEE/ZKP oracle decrypts metadata, re-encrypts with receiver's public key, produces `OwnershipProof` with `sealedKey`
3. `iTransferFrom()` calls `verifier.verifyTransferValidity()` to validate both proofs
4. Token ownership transfers and `PublishedSealedKey` event emits for receiver to decrypt

**Use Cases**: AI Trading Bots, Personal Assistants, Game Characters, Content Creation AI, Research Tools

**Documentation Links**:
- INFT Overview: [https://docs.0g.ai/developer-hub/building-on-0g/inft/inft-overview](https://docs.0g.ai/developer-hub/building-on-0g/inft/inft-overview)
- ERC-7857 Standard: [https://docs.0g.ai/developer-hub/building-on-0g/inft/erc7857](https://docs.0g.ai/developer-hub/building-on-0g/inft/erc7857)
- Integration Guide: [https://docs.0g.ai/developer-hub/building-on-0g/inft/integration](https://docs.0g.ai/developer-hub/building-on-0g/inft/integration)

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
npm install @0gfoundation/0g-ts-sdk ethers
```
```typescript
import { ZgFile, Indexer } from "@0gfoundation/0g-ts-sdk";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
const indexer = new Indexer("https://indexer-storage-testnet-turbo.0g.ai");

// Upload file — flow contract handled internally by Indexer
const file = await ZgFile.fromFilePath("/path/to/file");
const [tree, treeErr] = await file.merkleTree();
console.log("Root Hash:", tree?.rootHash());
const [tx, uploadErr] = await indexer.upload(file, "https://evmrpc-testnet.0g.ai", signer);
await file.close();

// Download file (withProof=true enables merkle verification)
const err = await indexer.download(rootHash, "/path/to/output", true);
```

**Go Example**:
```bash
go get github.com/0gfoundation/0g-storage-client
```
```go
import (
    "github.com/0gfoundation/0g-storage-client/common/blockchain"
    "github.com/0gfoundation/0g-storage-client/indexer"
    "github.com/0gfoundation/0g-storage-client/transfer"
    "github.com/0gfoundation/0g-storage-client/core"
)

// Initialize clients
w3client := blockchain.MustNewWeb3(evmRpc, privateKey)
defer w3client.Close()
indexerClient, _ := indexer.NewClient(indexerRpc, indexer.IndexerClientOption{})

// Upload — flow contract handled internally by indexer
file, _ := core.Open(filePath)
defer file.Close()
opt := transfer.UploadOption{ExpectedReplica: 1, FastMode: true}
txHashes, roots, _ := indexerClient.SplitableUpload(ctx, w3client, file, 4*1024*1024*1024, opt)

// Download
indexerClient.Download(ctx, rootHash, outputPath, true)
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

### Security
**Documentation**: [https://docs.0g.ai/resources/security](https://docs.0g.ai/resources/security)

### Contributing
**Documentation**: [https://docs.0g.ai/resources/how-to-contribute](https://docs.0g.ai/resources/how-to-contribute)

### Glossary
**Documentation**: [https://docs.0g.ai/resources/glossary](https://docs.0g.ai/resources/glossary)

---

*This context page is automatically maintained to provide AI coding assistants with comprehensive, up-to-date information about 0G infrastructure. All information is sourced from official documentation at https://docs.0g.ai.*
