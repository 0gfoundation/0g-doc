---
id: inft-overview
title: INFTs Overview
sidebar_position: 1
---

# INFTs: Tokenizing AI Agents

## What Are INFTs?

The rapid growth of AI agents necessitates new methods for managing their ownership, transfer, and capabilities within Web3 ecosystems. 

**INFTs (Intelligent Non-Fungible Tokens)** represent a significant advancement in this space, enabling the tokenization of AI agents with:

- **Transferability**: Move AI agents between owners securely
- **Decentralized control**: No single point of failure
- **Full asset ownership**: Complete control over AI capabilities
- **Royalty potential**: Monetize AI agent usage and transfers

:::tip Navigation Guide
- **This page**: High-level concepts and use cases
- **[ERC-7857 Standard](./erc7857)**: Technical implementation details
- **[Integration Guide](./integration)**: Step-by-step development guide
:::

## Why Traditional NFTs Don't Work for AI

Traditional NFT standards like ERC-721 and ERC-1155 have significant limitations when applied to AI agents:

### Key Problems

**🔓 Static and Public Metadata**
- Existing standards link to static, publicly accessible metadata
- AI agents need dynamic metadata that reflects learning and evolution
- Sensitive AI data requires privacy protection

**🚫 Insecure Metadata Transfer**
- ERC-721 transfers only move ownership identifiers
- The underlying AI "intelligence" doesn't transfer
- New owners receive incomplete or non-functional agents

**🔒 No Native Encryption**
- Current standards lack built-in encryption support
- Proprietary AI models remain exposed
- Sensitive user data can't be protected

## The INFT Solution: ERC-7857

ERC-7857 is a new NFT standard specifically designed to address AI agent requirements. It enables the creation, ownership, and secure transfer of INFTs with their complete intelligence intact.

### Revolutionary Features

**🛡️ Privacy-Preserving Metadata**
- Encrypts sensitive AI "intelligence" data
- Protects proprietary information from exposure
- Maintains privacy throughout transfers

**🔄 Secure Metadata Transfers**
- Both ownership AND encrypted metadata transfer together
- Verifiable transfer process ensures integrity
- New owners receive fully functional agents

**⚡ Dynamic Data Management**
- Supports evolving AI agent capabilities
- Secure updates to agent state and behaviors
- Maintains functionality within NFT framework

**🌐 Decentralized Storage Integration**
- Works with 0G Storage for permanent, tamper-proof storage
- Distributed access management
- No single point of failure

**✅ Verifiable Ownership & Control**
- Cryptographic proofs validate all transfers
- Oracle-based verification ensures integrity
- Transparent ownership verification

**🤖 AI-Specific Functionality**
- Built-in agent lifecycle management
- Pre-execution ownership verification
- Specialized features for AI use cases

## How INFT Transfers Work

The transfer mechanism ensures both token ownership and encrypted metadata transfer securely together.

### Simple Transfer Flow

```
1. 📦 Encrypt & Commit    →  2. 🔄 Oracle Processing
          ↓                           ↓
6. ✅ Access Granted     ←  3. 🔐 Re-encrypt for Receiver
          ↑                           ↓
5. ✓ Verify & Finalize   ←  4. 🗝️ Secure Key Delivery
```

<details>
<summary><b>Detailed Step-by-Step Process</b></summary>

1. **Encryption & Commitment**
   - AI agent metadata gets encrypted
   - Hash commitment created as authenticity proof
   - Content remains hidden

2. **Secure Transfer Initiation**
   - Trusted oracle (using TEEs) decrypts original metadata
   - Process happens in a secure environment

3. **Re-encryption for Receiver**
   - Oracle generates new encryption key
   - Re-encrypts metadata with new key
   - Stores new encrypted metadata (e.g., on 0G Storage)

4. **Key Delivery**
   - New encryption key encrypted with receiver's public key
   - Only intended owner can access metadata key

5. **Verification & Finalization**
   - Smart contract verifies multiple proofs:
     - Sender's access rights
     - Oracle validation of metadata matching
     - Receiver's signed acknowledgment
   - If valid: ownership transfers + receiver gets encrypted key

6. **Access Granted**
   - Receiver uses private key to decrypt metadata key
   - Full access to agent's encrypted intelligence granted

</details>

<div style={{textAlign: 'center'}}>
  <img src="/img/ERC7857-flow.webp" alt="ERC7857 Transfer Flow Diagram" style={{maxWidth: '100%'}} />
</div>

:::note Technical Implementation
For detailed oracle implementations (TEE vs ZKP), security considerations, and code examples, see the **[ERC-7857 Technical Standard](./erc7857)**.
:::

### Additional Capabilities

**🧬 Clone Function**
- Creates new token with same AI metadata
- Preserves original while enabling distribution
- Useful for AI agent templates

**🔐 Authorized Usage**
- Grant usage rights without ownership transfer
- Sealed executor processes metadata securely
- Enable AI-as-a-Service models

## Real-World Applications

Secure AI agent tokenization opens up transformative possibilities:

### 🏪 AI Agent Marketplaces
- Buy and sell trained AI agents with guaranteed capability transfer
- Secure marketplaces with verified agent functionality
- Transparent pricing and capability verification

### 🎯 Personalized Automation
- Own AI agents tailored for specific tasks:
  - DeFi trading strategies
  - Airdrop claiming automation
  - Social media management
  - Research and analysis

### 🏢 Enterprise AI Solutions
- Build proprietary AI agents for internal use
- Securely transfer or lease agents to clients
- Maintain control over sensitive business logic

### 💼 AI-as-a-Service (AIaaS)
- Tokenize AI agents for subscription models
- Granular usage permissions and billing
- Scalable service delivery

### 🤝 Agent Collaboration
- Combine multiple INFT agents for enhanced capabilities
- Create composite AI solutions
- Build AI agent ecosystems

### 💰 IP Monetization
- AI developers monetize models as NFTs
- Maintain usage control and royalty collection
- Protect proprietary algorithms

## Powered by 0G Infrastructure

INFTs leverage the complete 0G ecosystem for optimal performance:

| Component | Role in INFTs | Key Benefits |
|-----------|---------------|-------------|
| **0G Storage** | Encrypted metadata storage | Secure, permanent, owner-only access |
| **0G DA** | Transfer proof verification | Guaranteed metadata availability |
| **0G Chain** | Smart contract execution | Fast, low-cost INFT operations |
| **0G Compute** | Secure AI inference | Private agent execution |

### Why This Matters

By combining INFTs with 0G's comprehensive AI infrastructure, developers can create sophisticated, transferable AI agents that maintain their intelligence, privacy, and functionality throughout their entire lifecycle.

:::info Complete AI Stack
0G provides the only complete infrastructure stack specifically designed for AI applications, making it the ideal foundation for INFT development.
:::

## Next Steps

### For Developers
🚀 **[Integration Guide](./integration)** - Start building with INFTs  
📋 **[ERC-7857 Standard](./erc7857)** - Technical implementation details  
💻 **[GitHub Repository](https://github.com/0gfoundation/0g-agent-nft/tree/eip-7857-draft)** - Sample code and examples  

### For Users
🛒 **[AI Agent Marketplace](#)** - Browse available AI agents (coming soon)  
📚 **[User Guide](#)** - How to buy, transfer, and use INFTs (coming soon)  

### Get Support
💬 **[Discord Community](https://discord.gg/0glabs)** - Ask questions and get help  
📖 **[Documentation Hub](/)** - Complete 0G ecosystem guides  

:::tip Web3 Compatible
ERC-7857 is designed to be compatible with existing Web3 infrastructure while providing enhanced security and functionality for AI agent tokenization.
::: 
