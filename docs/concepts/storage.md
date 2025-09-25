---
id: storage
title: 0G Storage
sidebar_position: 3
---

# 0G Storage: Built for Massive Data

Current storage options force impossible tradeoffs:
- **Cloud providers**: Fast but expensive with vendor lock-in
- **Decentralized options**: Either slow (IPFS), limited (Filecoin), or prohibitively expensive (Arweave)

## What is 0G Storage?

0G Storage breaks these tradeoffs - a decentralized storage network that's as fast as AWS S3 but built for Web3. Purpose-designed for AI workloads and massive datasets.

<details>
<summary><b>New to decentralized storage?</b></summary>

Traditional storage (like AWS):
- One company controls your data
- They can delete it, censor it, or change prices
- Single point of failure

Decentralized storage (like 0G):
- Data spread across thousands of nodes
- No single entity can delete or censor
- Always available, even if nodes go offline
</details>

## Why Choose 0G Storage?

### 🚀 The Complete Package

| What You Get | Why It Matters |
|--------------|----------------|
| **95% lower costs than AWS** | Sustainable for large datasets |
| **Instant retrieval** | No waiting for critical data |
| **Structured + unstructured data** | One solution for all storage needs |
| **Universal compatibility** | Works with any blockchain or Web2 app |
| **Proven scale** | Already handling TB-scale workloads |

## How It Works

0G Storage is a distributed data storage system designed with on-chain elements to incentivize storage nodes to store data on behalf of users. Anyone can run a storage node and receive rewards for maintaining one.

### Technical Architecture

0G Storage uses a two-lane system:

<details>
<summary><b>📤 Data Publishing Lane</b></summary>

- Handles metadata and availability proofs
- Verified through 0G Consensus network
- Enables fast data discovery
</details>

<details>
<summary><b>💾 Data Storage Lane</b></summary>

- Manages actual data storage
- Uses erasure coding: splits data into chunks with redundancy
- Even if 30% of nodes fail, your data remains accessible
- Automatic replication maintains availability
</details>
<img src="/img/0G Storage Architecture.png" alt="Storage Architecture" />

## Storage Layers for Different Needs

### 📁 Log Layer (Immutable Storage)
**Perfect for**: AI training data, archives, backups
- Append-only (write once, read many)
- Optimized for large files
- Lower cost for permanent storage

**Use cases**:
- ML datasets
- Video/image archives  
- Blockchain history
- General Large file storage

### 🔑 Key-Value Layer (Mutable Storage)
**Perfect for**: Databases, dynamic content, state storage
- Update existing data
- Fast key-based retrieval
- Real-time applications

**Use cases**:
- On-chain databases
- User profiles
- Game state
- Collaborative documents


## How Storage Providers Earn
0G Storage is maintained by a network of miners incentivized to store and manage data through a unique consensus mechanism known as **Proof of Random Access (PoRA)**.

### How It Works

1. **Random Challenges**: System randomly asks miners to prove they have specific data
2. **Cryptographic Proof**: Miners must generate a valid hash (like Bitcoin mining)
3. **Quick Response**: Must respond fast to prove data is readily accessible
4. **Fair Rewards**: Successful proofs earn storage fees

<details>
<summary><b>What's PoRA in simple terms?</b></summary>

Imagine a teacher randomly checking if students did their homework:
1. Teacher picks a random student (miner)
2. Asks for a specific page (data chunk)
3. Student must show it quickly
4. If correct, student gets rewarded

This ensures miners actually store the data they claim to store.
</details>

<img src="/img/pora.png" alt="PoRA" />

### Fair Competition = Fair Reward
To promote fairness, the mining range is capped at 8 TB of data per mining operation.

**Why 8TB limit?**
- Small miners can compete with large operations
- Prevents centralization
- Lower barrier to entry

**For large operators**: Run multiple 8TB instances.

**For individuals**: Focus on single 8TB range, still profitable

<img src="/img/data-chanks.png" alt="Mining Ranges" />

## How 0G Compares

| Solution | Best For | Limitation |
|----------|----------|------------|
| **0G Storage** | AI/Web3 apps needing speed + scale | Newer ecosystem |
| **AWS S3** | Traditional apps | Centralized, expensive |
| **Filecoin** | Cold storage archival | Slow retrieval, unstructured only |
| **Arweave** | Permanent storage | Extremely expensive |
| **IPFS** | Small files, hobby projects | Very slow, no guarantees |

### 0G's Unique Position
- **Only solution** supporting both structured and unstructured data
- **Instant access** unlike other decentralized options
- **Built for AI** from the ground up

## Frequently Asked Questions

<details>
<summary><b>Is my data really safe if nodes go offline?</b></summary>

Yes! The erasure coding system ensures your data survives node failures. The network automatically maintains redundancy levels, so your data remains accessible even during significant outages.
</details>

<details>
<summary><b>How fast can I retrieve large files?</b></summary>

- Parallel retrieval from multiple nodes
- Bandwidth is limited only by your connection
- 200 MBPS retrieval speed even at network congestion
- CDN-like performance through geographic distribution
</details>

<details>
<summary><b>What happens to pricing as the network grows?</b></summary>

The network fee is fixed. All pricing is transparent and on-chain, preventing hidden fees or sudden changes.
</details>

<details>
<summary><b>Can I migrate from existing storage?</b></summary>

Yes, easily:
1. Keep existing infrastructure
2. Use 0G as overflow or backup
3. Gradually migrate based on access patterns
</details>

## Get Started

### 🧑‍💻 For Developers
Integrate 0G Storage in minutes
→ [SDK Documentation](/developer-hub/building-on-0g/storage/sdk)

### ⛏️ For Storage Providers  
Earn by providing storage capacity
→ [Run a Storage Node](/run-a-node/storage-node)

---

*0G Storage: Purpose-built for AI and Web3's massive data needs.*
