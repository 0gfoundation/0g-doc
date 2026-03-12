---
id: integration
title: INFT Integration Guide
sidebar_position: 2
description: "Step-by-step guide to build INFTs on 0G. Deploy contracts, manage encrypted AI metadata, implement secure transfers, and build AI agent marketplaces."
---

# INFT Integration Guide

## Overview

This step-by-step guide shows you how to integrate INFTs into your applications using the 0G ecosystem. You'll learn to deploy contracts, manage metadata, and implement secure transfers.

:::tip Quick Navigation
- **New to INFTs?** Start with [INFT Overview](./inft-overview)
- **Need technical details?** See [ERC-7857 Standard](./erc7857)
- **Ready to build?** Continue with this guide
:::

## Prerequisites

### Knowledge Requirements
✅ **NFT Standards** - Understanding of ERC-721 basics  
✅ **Smart Contracts** - Solidity development experience  
✅ **Cryptography** - Basic encryption and key management concepts  
✅ **0G Ecosystem** - Familiarity with 0G infrastructure components  

### Technical Setup
✅ **Development Environment** - Node.js 16+, Hardhat/Foundry  
✅ **0G Testnet Account** - Wallet with testnet tokens  
✅ **API Access** - Keys for 0G Storage and Compute services  

<details>
<summary><b>Quick Setup Checklist</b></summary>

```bash
# Install dependencies
npm install @0gfoundation/0g-ts-sdk ethers hardhat

# Set environment variables
export PRIVATE_KEY="your-private-key"
export OG_RPC_URL="https://evmrpc-testnet.0g.ai"
export OG_STORAGE_URL="https://storage-testnet.0g.ai"
export OG_COMPUTE_URL="https://compute-testnet.0g.ai"
```

</details>

## Understanding 0G Integration

INFTs work seamlessly with 0G's complete AI infrastructure:

| Component | Purpose | INFT Integration |
|-----------|---------|------------------|
| **0G Storage** | Encrypted metadata storage | Stores AI agent data securely |
| **0G DA** | Proof verification | Validates transfer integrity |
| **0G Chain** | Smart contract execution | Hosts INFT contracts |
| **0G Compute** | Secure AI inference | Runs agent computations privately |

:::note Why This Architecture Matters
This integration ensures that AI agents maintain their intelligence, privacy, and functionality throughout their entire lifecycle while remaining fully decentralized.
:::

## Step-by-Step Implementation

### Step 1: Initialize Your Project

```bash
# Create new project
mkdir my-inft-project && cd my-inft-project
npm init -y

# Install required dependencies
npm install @0gfoundation/0g-ts-sdk @openzeppelin/contracts ethers hardhat
npm install --save-dev @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat init
```

**Configure environment:**
```bash
# Create .env file
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
OG_RPC_URL=https://evmrpc-testnet.0g.ai
OG_STORAGE_URL=https://storage-testnet.0g.ai
OG_COMPUTE_URL=https://compute-testnet.0g.ai
EOF
```

### Step 2: Create INFT Smart Contract

```solidity
// contracts/INFT.sol
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IOracle {
    function verifyProof(bytes calldata proof) external view returns (bool);
}

contract INFT is ERC721, Ownable, ReentrancyGuard {
    // State variables
    mapping(uint256 => bytes32) private _metadataHashes;
    mapping(uint256 => string) private _encryptedURIs;
    mapping(uint256 => mapping(address => bytes)) private _authorizations;
    
    address public oracle;
    uint256 private _nextTokenId = 1;
    
    // Events
    event MetadataUpdated(uint256 indexed tokenId, bytes32 newHash);
    event UsageAuthorized(uint256 indexed tokenId, address indexed executor);
    
    constructor(
        string memory name,
        string memory symbol,
        address _oracle
    ) ERC721(name, symbol) {
        oracle = _oracle;
    }
    
    function mint(
        address to,
        string calldata encryptedURI,
        bytes32 metadataHash
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        _encryptedURIs[tokenId] = encryptedURI;
        _metadataHashes[tokenId] = metadataHash;
        
        return tokenId;
    }
    
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external nonReentrant {
        require(ownerOf(tokenId) == from, "Not owner");
        require(IOracle(oracle).verifyProof(proof), "Invalid proof");
        
        // Update metadata access for new owner
        _updateMetadataAccess(tokenId, to, sealedKey, proof);
        
        // Transfer token ownership
        _transfer(from, to, tokenId);
        
        emit MetadataUpdated(tokenId, keccak256(sealedKey));
    }
    
    function authorizeUsage(
        uint256 tokenId,
        address executor,
        bytes calldata permissions
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _authorizations[tokenId][executor] = permissions;
        emit UsageAuthorized(tokenId, executor);
    }
    
    function _updateMetadataAccess(
        uint256 tokenId,
        address newOwner,
        bytes calldata sealedKey,
        bytes calldata proof
    ) internal {
        // Extract new metadata hash from proof
        bytes32 newHash = bytes32(proof[0:32]);
        _metadataHashes[tokenId] = newHash;
        
        // Update encrypted URI if provided in proof
        if (proof.length > 64) {
            string memory newURI = string(proof[64:]);
            _encryptedURIs[tokenId] = newURI;
        }
    }
    
    function getMetadataHash(uint256 tokenId) external view returns (bytes32) {
        return _metadataHashes[tokenId];
    }
    
    function getEncryptedURI(uint256 tokenId) external view returns (string memory) {
        return _encryptedURIs[tokenId];
    }
}
```

### Step 3: Deploy and Initialize Contract

**Create deployment script:**
```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with account:", deployer.address);
    
    // Deploy mock oracle for testing (replace with real oracle in production)
    const MockOracle = await ethers.getContractFactory("MockOracle");
    const oracle = await MockOracle.deploy();
    await oracle.deployed();
    
    // Deploy INFT contract
    const INFT = await ethers.getContractFactory("INFT");
    const inft = await INFT.deploy(
        "AI Agent NFTs",
        "AINFT",
        oracle.address
    );
    await inft.deployed();
    
    console.log("Oracle deployed to:", oracle.address);
    console.log("INFT deployed to:", inft.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

**Deploy to 0G testnet:**
```bash
npx hardhat run scripts/deploy.js --network og-testnet
```

### Step 4: Implement Metadata Management

**Create metadata manager:**
```javascript
// lib/MetadataManager.js
const { ethers } = require('ethers');
const crypto = require('crypto');

class MetadataManager {
    constructor(ogStorage, encryptionService) {
        this.storage = ogStorage;
        this.encryption = encryptionService;
    }
    
    async createAIAgent(aiModelData, ownerPublicKey) {
        try {
            // Prepare AI agent metadata
            const metadata = {
                model: aiModelData.model,
                weights: aiModelData.weights,
                config: aiModelData.config,
                capabilities: aiModelData.capabilities,
                version: '1.0',
                createdAt: Date.now()
            };
            
            // Generate encryption key
            const encryptionKey = crypto.randomBytes(32);
            
            // Encrypt metadata
            const encryptedData = await this.encryption.encrypt(
                JSON.stringify(metadata),
                encryptionKey
            );
            
            // Store on 0G Storage
            const storageResult = await this.storage.store(encryptedData);
            
            // Seal key for owner
            const sealedKey = await this.encryption.sealKey(
                encryptionKey,
                ownerPublicKey
            );
            
            // Generate metadata hash
            const metadataHash = ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes(JSON.stringify(metadata))
            );
            
            return {
                encryptedURI: storageResult.uri,
                sealedKey,
                metadataHash
            };
        } catch (error) {
            throw new Error(`Failed to create AI agent: ${error.message}`);
        }
    }
    
    async mintINFT(contract, recipient, aiAgentData) {
        const { encryptedURI, sealedKey, metadataHash } = aiAgentData;
        
        const tx = await contract.mint(
            recipient,
            encryptedURI,
            metadataHash
        );
        
        const receipt = await tx.wait();
        const tokenId = receipt.events[0].args.tokenId;
        
        return {
            tokenId,
            sealedKey,
            transactionHash: receipt.transactionHash
        };
    }
}

module.exports = MetadataManager;
```

### Step 5: Implement Secure Transfers

**Transfer preparation:**
```javascript
// lib/TransferManager.js
class TransferManager {
    constructor(oracle, metadataManager) {
        this.oracle = oracle;
        this.metadata = metadataManager;
    }
    
    async prepareTransfer(tokenId, fromAddress, toAddress, toPublicKey) {
        try {
            // Retrieve current metadata
            const currentURI = await this.metadata.getEncryptedURI(tokenId);
            const encryptedData = await this.storage.retrieve(currentURI);
            
            // Request oracle to re-encrypt for new owner
            const transferRequest = {
                tokenId,
                encryptedData,
                fromAddress,
                toAddress,
                toPublicKey
            };
            
            // Get oracle proof and new sealed key
            const oracleResponse = await this.oracle.processTransfer(transferRequest);
            
            return {
                sealedKey: oracleResponse.sealedKey,
                proof: oracleResponse.proof,
                newEncryptedURI: oracleResponse.newURI
            };
        } catch (error) {
            throw new Error(`Transfer preparation failed: ${error.message}`);
        }
    }
    
    async executeTransfer(contract, transferData) {
        const { from, to, tokenId, sealedKey, proof } = transferData;
        
        const tx = await contract.transfer(
            from,
            to,
            tokenId,
            sealedKey,
            proof
        );
        
        return await tx.wait();
    }
}
```

## Best Practices

### 🔒 Security Guidelines

**Key Management:**
- Store private keys in hardware wallets or HSMs
- Never expose keys in code or logs
- Implement automatic key rotation
- Use multi-signature wallets for critical operations

**Metadata Protection:**
```javascript
// Example: Secure metadata handling
class SecureMetadata {
    constructor() {
        this.encryptionAlgorithm = 'aes-256-gcm';
        this.keyDerivation = 'pbkdf2';
    }
    
    async encryptMetadata(data, password) {
        const salt = crypto.randomBytes(16);
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(this.encryptionAlgorithm, key, iv);
        // ... encryption logic
    }
}
```

### ⚡ Performance Optimization

**Efficient Storage Patterns:**
- Compress metadata before encryption
- Use appropriate storage tiers based on access patterns
- Implement lazy loading for large AI models
- Cache frequently accessed data locally

**Batch Operations:**
```javascript
// Batch multiple operations
async function batchMintINFTs(agents, recipients) {
    const operations = agents.map((agent, i) => 
        metadataManager.createAIAgent(agent, recipients[i])
    );
    
    const results = await Promise.all(operations);
    return results;
}
```

### 🧪 Testing Strategy

**Comprehensive Test Suite:**
```javascript
// test/INFT.test.js
describe('INFT Contract', function () {
    it('should mint INFT with encrypted metadata', async function () {
        const metadata = await createTestMetadata();
        const result = await inft.mint(owner.address, metadata.uri, metadata.hash);
        expect(result).to.emit(inft, 'Transfer');
    });
    
    it('should transfer with re-encryption', async function () {
        // Test secure transfer logic
    });
    
    it('should authorize usage without ownership transfer', async function () {
        // Test authorization functionality
    });
});
```

**Security Testing:**
- Test with malformed proofs
- Verify access controls
- Check for reentrancy vulnerabilities
- Validate oracle responses

## Real-World Use Cases

### 🏪 AI Agent Marketplace

**Complete marketplace integration:**
```javascript
// marketplace/AgentMarketplace.js
class AgentMarketplace {
    constructor(inftContract, paymentToken) {
        this.inft = inftContract;
        this.payment = paymentToken;
        this.listings = new Map();
    }
    
    async listAgent(tokenId, price, description) {
        // Verify ownership
        const owner = await this.inft.ownerOf(tokenId);
        require(owner === msg.sender, 'Not owner');
        
        // Create listing
        const listing = {
            tokenId,
            price,
            description,
            seller: owner,
            isActive: true
        };
        
        this.listings.set(tokenId, listing);
        
        // Approve marketplace for transfer
        await this.inft.approve(this.address, tokenId);
        
        return listing;
    }
    
    async purchaseAgent(tokenId, buyerPublicKey) {
        const listing = this.listings.get(tokenId);
        require(listing && listing.isActive, 'Agent not for sale');
        
        // Prepare secure transfer
        const transferData = await this.prepareTransfer(
            tokenId,
            listing.seller,
            msg.sender,
            buyerPublicKey
        );
        
        // Execute payment
        await this.payment.transferFrom(msg.sender, listing.seller, listing.price);
        
        // Execute secure transfer
        await this.inft.transfer(
            listing.seller,
            msg.sender,
            tokenId,
            transferData.sealedKey,
            transferData.proof
        );
        
        // Remove listing
        this.listings.delete(tokenId);
    }
}
```

### 💼 AI-as-a-Service Platform

**Usage authorization system:**
```javascript
// services/AIaaS.js
class AIaaSPlatform {
    async createSubscription(tokenId, subscriber, duration, permissions) {
        // Verify agent ownership
        const owner = await this.inft.ownerOf(tokenId);
        
        // Create usage authorization
        const authData = {
            subscriber,
            expiresAt: Date.now() + duration,
            permissions: {
                maxRequests: permissions.maxRequests,
                allowedOperations: permissions.operations,
                rateLimit: permissions.rateLimit
            }
        };
        
        // Grant usage rights
        await this.inft.authorizeUsage(
            tokenId,
            subscriber,
            ethers.utils.toUtf8Bytes(JSON.stringify(authData))
        );
        
        return authData;
    }
    
    async executeAuthorizedInference(tokenId, input, subscriber) {
        // Verify authorization
        const auth = await this.getAuthorization(tokenId, subscriber);
        require(auth && auth.expiresAt > Date.now(), 'Unauthorized');
        
        // Execute inference on 0G Compute
        const result = await this.ogCompute.executeSecure({
            tokenId,
            executor: subscriber,
            input,
            verificationMode: 'TEE'
        });
        
        // Update usage metrics
        await this.updateUsageMetrics(tokenId, subscriber);
        
        return result;
    }
}
```

### 🤝 Multi-Agent Collaboration

**Agent composition framework:**
```javascript
// collaboration/AgentComposer.js
class AgentComposer {
    async composeAgents(agentTokenIds, compositionRules) {
        // Verify ownership of all agents
        for (const tokenId of agentTokenIds) {
            const owner = await this.inft.ownerOf(tokenId);
            require(owner === msg.sender, `Not owner of agent ${tokenId}`);
        }
        
        // Create composite agent metadata
        const compositeMetadata = {
            type: 'composite',
            agents: agentTokenIds,
            rules: compositionRules,
            createdAt: Date.now()
        };
        
        // Encrypt and store composite metadata
        const encryptedComposite = await this.metadataManager.createAIAgent(
            compositeMetadata,
            msg.sender
        );
        
        // Mint new INFT for composite agent
        const result = await this.inft.mint(
            msg.sender,
            encryptedComposite.encryptedURI,
            encryptedComposite.metadataHash
        );
        
        return result.tokenId;
    }
    
    async executeCompositeInference(compositeTokenId, input) {
        // Retrieve composite metadata
        const metadata = await this.getDecryptedMetadata(compositeTokenId);
        
        // Execute inference on each component agent
        const agentResults = await Promise.all(
            metadata.agents.map(agentId => 
                this.executeAgentInference(agentId, input)
            )
        );
        
        // Apply composition rules to combine results
        const finalResult = this.applyCompositionRules(
            agentResults,
            metadata.rules
        );
        
        return finalResult;
    }
}
```

## Troubleshooting

### Common Issues & Solutions

<details>
<summary><b>Transfer Failures</b></summary>

**Problem**: INFT transfer transaction reverts

**Causes & Solutions**:
- **Invalid proof**: Verify oracle is online and proof is correctly formatted
- **Expired proof**: Generate new proof (proofs have limited validity)
- **Wrong owner**: Ensure `from` address matches actual token owner
- **Oracle unavailable**: Check oracle service status

```javascript
// Debug transfer issues
async function debugTransfer(tokenId, proof) {
    const owner = await inft.ownerOf(tokenId);
    console.log(`Token owner: ${owner}`);
    
    const isValidProof = await oracle.verifyProof(proof);
    console.log(`Proof valid: ${isValidProof}`);
    
    // Check oracle status
    const oracleStatus = await oracle.getStatus();
    console.log(`Oracle status: ${oracleStatus}`);
}
```

</details>

<details>
<summary><b>Metadata Access Issues</b></summary>

**Problem**: Cannot decrypt or access AI agent metadata

**Solutions**:
- Verify private key corresponds to sealed key
- Check storage URI accessibility
- Ensure metadata hasn't been corrupted
- Validate encryption algorithm compatibility

```javascript
// Test metadata access
async function testMetadataAccess(tokenId, privateKey) {
    try {
        const encryptedURI = await inft.getEncryptedURI(tokenId);
        const encryptedData = await storage.retrieve(encryptedURI);
        
        // Attempt decryption
        const sealedKey = await getSealedKey(tokenId);
        const key = await unsealKey(sealedKey, privateKey);
        const metadata = await decrypt(encryptedData, key);
        
        console.log('Metadata accessible:', !!metadata);
        return metadata;
    } catch (error) {
        console.error('Metadata access failed:', error.message);
    }
}
```

</details>

<details>
<summary><b>High Gas Costs</b></summary>

**Optimization strategies**:
- Compress proofs before submission
- Use batch operations for multiple transfers
- Optimize storage patterns
- Consider Layer 2 solutions

```javascript
// Optimize gas usage
async function optimizedTransfer(transfers) {
    // Batch multiple transfers
    const batchData = transfers.map(t => ({
        tokenId: t.tokenId,
        from: t.from,
        to: t.to,
        sealedKey: compressData(t.sealedKey),
        proof: compressProof(t.proof)
    }));
    
    return await inft.batchTransfer(batchData);
}
```

</details>

### Get Support

🐛 **[GitHub Issues](https://github.com/0gfoundation/0g-agent-nft/issues)** - Report bugs and feature requests  
💬 **[Discord Community](https://discord.gg/0glabs)** - Get help from developers  
📖 **[Documentation](./erc7857)** - Technical reference  
📚 **[Knowledge Base](https://kb.0g.ai)** - Common solutions  

## Next Steps

### Continue Learning
📋 **[ERC-7857 Technical Standard](./erc7857)** - Deep dive into implementation details  
🎯 **[INFT Use Cases](./inft-overview#real-world-applications)** - Explore more applications  
💻 **[Example Implementations](https://github.com/0gfoundation/0g-agent-nft/tree/eip-7857-draft)** - Reference code  

### Production Deployment
🚀 **Mainnet Migration** - Deploy to 0G mainnet when ready  
🔒 **Security Audit** - Get your contracts audited  
📊 **Monitoring Setup** - Implement monitoring and alerts  

### Community
🤝 **Developer Community** - Share your implementation  
💬 **Technical Discussions** - Join conversations about best practices  
👥 **Contribute** - Help improve the INFT ecosystem  

:::tip Ready to Deploy?
Once you've tested your implementation thoroughly, consider getting a security audit before deploying to mainnet. The 0G team can recommend trusted auditing partners.
:::