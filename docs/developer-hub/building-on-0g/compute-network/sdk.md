---
id: sdk
title: Inference & CLI Tools
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 0G Compute Network Tools

The 0G Compute Network provides multiple ways to interact with inference services. You can use the CLI for quick setup and testing, or integrate the SDK for programmatic access in your applications.

## Quick Start (CLI)

The 0G Compute CLI provides a simple way to get started with inference services in just a few steps.

### Installation

```bash
pnpm install -g @0glabs/0g-serving-broker
```

### Step 1: Add Funds

> **Note:** For normal use on the 0G testnet, you only need to set your private key as an environment variable. All other parameters are pre-configured for the testnet.

```bash
export ZG_PRIVATE_KEY=your_private_key

# Add funds to your account
0g-compute-cli deposit --amount 0.5
```

### Start Local Inference Service

### Step 2: Start Service

```bash
0g-compute-cli serve \
  --provider 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --ledger-ca=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 \
  --inference-ca=0x0165878A594ca255338adfa4d48449f69242Eb8F \
  --rpc=http://localhost:8545 \
  --key=your_private_key_here
```

That's it! Your inference service is now running and ready to accept requests.

### Available Commands

- `deposit --amount <amount>`: Add funds to your account
- `serve`: Start local inference service
- `list-models`: List available models
- `get-account`: Check account balance
- `--help`: Show all available commands

## Programmatic Usage (SDK)

The 0G Compute Network SDK enables developers to integrate AI inference services from the 0G Compute Network into their applications. Currently, the 0G Compute Network SDK supports Large Language Model (LLM) inference services, with fine-tuning and additional features planned for future releases.

In just five minutes, you can initialize your broker to manage operations, set up and fund your account to pay for inference services, and learn how to send inference requests and handle responses.

### Installation

```bash
pnpm add @0glabs/0g-serving-broker @types/crypto-js@4.2.2 crypto-js@4.2.0
```

### Core Concepts

### 1. The Broker
Your interface to the 0G Compute Network:
- Handles authentication and billing
- Manages provider connections
- Verifies computations

### 2. Providers
GPU owners offering AI services:
- Each has a unique address
- Set their own prices
- Run specific models

### 3. Prepaid Accounts
- Fund account before usage
- Automatic micropayments
- No surprise bills

### Step-by-Step Guide

### Initialize the Broker

<Tabs>
<TabItem value="privatekey" label="Using Private Key" default>

```typescript
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const broker = await createZGComputeNetworkBroker(wallet);
```

</TabItem>
<TabItem value="browser" label="Browser Wallet">

```typescript
import { BrowserProvider } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

// Check if MetaMask is installed
if (typeof window.ethereum === "undefined") {
  throw new Error("Please install MetaMask");
}

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const broker = await createZGComputeNetworkBroker(signer);
```

</TabItem>
</Tabs>

### Fund Your Account

```typescript
// Add 0.1 OG tokens (~10,000 requests)
await broker.ledger.addLedger("0.1");

// Check balance
const account = await broker.ledger.getLedger();
console.log(`Balance: ${ethers.formatEther(account.totalbalance)} OG`);
```

### Discover Available Services

The 0G Compute Network hosts multiple AI service providers. The service discovery process helps you find and select the appropriate services for your needs.

<details open>
<summary><b>🎯 Official 0G Services</b></summary>

| Model | Provider Address | Description | Verification |
|-------|-----------------|-------------|--------------|
| **llama-3.3-70b-instruct** | `0xf07240Efa67755B5311bc75784a061eDB47165Dd` | State-of-the-art 70B parameter model for general AI tasks | TEE (TeeML) |
| **deepseek-r1-70b** | `0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3` | Advanced reasoning model optimized for complex problem solving | TEE (TeeML) |

</details>

```typescript
const services = await broker.inference.listService();
```

Each service contains the following information:

```typescript
type ServiceStructOutput = {
  provider: string; // Provider's wallet address (unique identifier)
  serviceType: string; // Type of service
  url: string; // Service URL
  inputPrice: bigint; // Price for input processing
  outputPrice: bigint; // Price for output generation
  updatedAt: bigint; // Last update timestamp
  model: string; // Model identifier
  verifiability: string; // Indicates how the service's outputs can be verified. 'TeeML' means it runs with verification in a Trusted Execution Environment. An empty value means no verification.
};
```
### Acknowledge Provider
Before using a service provided by a provider, you must first acknowledge the provider on-chain by following API:

```typescript
await broker.inference.acknowledgeProviderSigner(providerAddress)
```

The providerAddress can be obtained from from service metadata. For details on how to retrieve it, see [Discover Available Services](/developer-hub/building-on-0g/compute-network/sdk#discover-available-services)



### Service Requests
Service usage in the 0G Network involves two key steps:

 - Retrieving service metadata
 - Generating authenticated request headers

```typescript
  
  // Get service details
  const { endpoint, model } = await broker.inference.getServiceMetadata(provider);
  
  // Generate auth headers (single use)
  const headers = await broker.inference.getRequestHeaders(provider, question);
  
```

### Send a Request to the Service

<Tabs>
<TabItem value="fetch" label="Using Fetch API" default>

```typescript
const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      messages: [{ role: "user", content: question }],
      model: model,
    }),
  });
  
const data = await response.json();
const answer = data.choices[0].message.content;

```
</TabItem>
<TabItem value="openai" label="Using OpenAI SDK">

```typescript
const openai = new OpenAI({
    baseURL: endpoint,
    apiKey: "", // Empty string
    defaultHeaders: headers
  });
  
const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: question }],
    model: model,
  });
  
const answer = completion.choices[0].message.content!;
```

</TabItem>
</Tabs>

### Response Processing
This function is used to verify the response. If it is a verifiable service, it will return whether the response is valid.

```typescript
const valid = await broker.inference.processResponse(
  providerAddress,
  content,
  chatID // Optional: Only for verifiable services
);
```

### Fee Settlement
Fee settlement by the broker service occurs at scheduled intervals.

## Account Management

### Check Balance
```typescript
const ledger = await broker.ledger.getLedger();
console.log(`
  Balance: ${ethers.formatEther(ledger.balance)} OG
  Locked: ${ethers.formatEther(ledger.locked)} OG
  Available: ${ethers.formatEther(ledger.balance - ledger.locked)} OG
`);
```

### Add Funds
```typescript
// Add more funds
await broker.ledger.depositFund("0.5");
```

### Request Refund
```typescript
// Withdraw unused funds
await broker.ledger.retrieveFund("inference", "0.1");
```

## Troubleshooting

### CLI Issues

<details>
<summary><b>Error: Chalk compatibility issue</b></summary>

If you encounter this error:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module chalk@5.x
```

**Solution**: Install chalk@4 globally
```bash
pnpm add -g chalk@4
```
</details>

<details>
<summary><b>Error: CLI command not found</b></summary>

Make sure the CLI is installed globally:
```bash
pnpm install -g @0glabs/0g-serving-broker
```

If using npm:
```bash
npm install -g @0glabs/0g-serving-broker
```
</details>

### SDK Issues

<details>
<summary><b>Error: Insufficient balance</b></summary>

Your account doesn't have enough funds. Add more:
```typescript
await broker.ledger.addLedger(ethers.parseEther("0.1"));
```
</details>

<details>
<summary><b>Error: Headers already used</b></summary>

Request headers are single-use. Generate new ones for each request:
```typescript
// ❌ Wrong
const headers = await broker.inference.getRequestHeaders(provider, content);
await makeRequest(headers);
await makeRequest(headers); // Will fail!

// ✅ Correct
const headers1 = await broker.inference.getRequestHeaders(provider, content);
await makeRequest(headers1);
const headers2 = await broker.inference.getRequestHeaders(provider, content);
await makeRequest(headers2);
```
</details>

<details>
<summary><b>Error: Provider not responding</b></summary>

The provider might be offline. Try another:
```typescript
// Try all official providers
for (const [model, provider] of Object.entries(OFFICIAL_PROVIDERS)) {
  try {
    console.log(`Trying ${model}...`);
    return await makeRequestToProvider(provider);
  } catch (e) {
    console.log(`${model} failed, trying next...`);
    continue; // Try next provider
  }
}
```
</details>

## Next Steps

- **Fine-tune Models** → [CLI Guide](./cli)
- **Become a Provider** → [Provider Setup](./inference-provider)
- **View Examples** → [GitHub](https://github.com/0gfoundation/compute-examples)

---

*Questions? Join our [Discord](https://discord.gg/0glabs) for support.*