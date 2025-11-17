---
id: overview
title: Overview
sidebar_position: 1
---

# 0G Compute Network

Access affordable GPU computing power for AI workloads through a decentralized marketplace.

## AI Computing Costs Are Crushing Innovation

Running AI models today means choosing between:
- **Cloud Providers**: $5,000-50,000/month for dedicated GPUs
- **API Services**: $0.03+ per request, adding up to thousands monthly
- **Building Infrastructure**: Millions in hardware investment

**Result**: Only well-funded companies can afford AI at scale.

## Decentralized GPU Marketplace

0G Compute Network connects idle GPU owners with AI developers, creating a marketplace that's:
- **90% Cheaper**: Pay only for compute used, no monthly minimums
- **Instantly Available**: Access 1000s of GPUs globally
- **Verifiable**: Cryptographic proofs ensure computation integrity

Think of it as "Uber for GPUs" - matching supply with demand efficiently.

## Architecture Overview

![0G Compute Network Architecture](./architecture.png)

The network consists of:
1. **Smart Contracts**: Handle payments and verification
2. **Provider Network**: GPU owners running compute services
3. **Client SDKs**: Easy integration for developers
4. **Verification Layer**: Ensures computation integrity

## Key Components

### 🤖 Supported Services

| Service Type | What It Does | Status |
|--------------|--------------|--------|
| **Inference** | Run pre-trained models (LLMs) | ✅ Live |
| **Fine-tuning** | Fine-tune models with your data | ✅ Live |
| **Training** | Train models from scratch | 🔜 Coming |

### 🔐 Trust & Verification

**Verifiable Computation**: Proof that work was done correctly
- TEE (Trusted Execution Environment) for secure processing
- Cryptographic signatures on all results
- Can't fake or manipulate outputs

<details>
<summary><b>What makes it trustworthy?</b></summary>

**Smart Contract Escrow**: Funds held until service delivered
- Like eBay's payment protection
- Automatic settlement on completion
- No payment disputes
</details>

## Quick Start Paths

### 👨‍💻 "I want to use AI services"
Build AI-powered applications without infrastructure:
1. [Install SDK](./inference#sdk) - 5 minute setup
2. [Fund your account](./account-management) - Pre-pay for usage
3. [Send requests](./inference#direct-api-access) - **OpenAI SDK compatible**

### 🖥️ "I have GPUs to monetize"
Turn idle hardware into revenue:
1. Check [hardware requirements](./inference-provider#prerequisites)
2. [Set up provider software](./inference-provider#launch-provider-broker)

### 🎯 "I need to fine-tune AI models"
Fine-tune models with your data:
1. [Install CLI tools](./fine-tuning#install-cli)
2. [Prepare your dataset](./fine-tuning#prepare-your-data)
3. [Start fine-tuning](./fine-tuning#create-task)



## Frequently Asked Questions

<details>
<summary><b>How much can I save compared to OpenAI?</b></summary>

Typically 90%+ savings:
- OpenAI GPT-4: ~$0.03 per 1K tokens
- 0G Compute: ~$0.003 per 1K tokens
- Bulk usage: Even greater discounts
</details>

<details>
<summary><b>Is my data secure?</b></summary>

Yes, through multiple layers:
- TEE (Trusted Execution Environment) processing
- No data retention by providers
- Verifiable computation proofs
</details>

<details>
<summary><b>How fast is it compared to centralized services?</b></summary>

- Inference: 50-100ms latency (comparable to centralized)
- Geographic distribution reduces latency
</details>

---

*0G Compute Network: Democratizing AI computing for everyone.*