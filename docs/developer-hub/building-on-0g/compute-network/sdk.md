---
id: sdk
title: Inference SDK
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 0G Compute SDK

The 0G Compute Network SDK enables developers to integrate AI inference services from the 0G Compute Network into their applications. Currently, the 0G Compute Network SDK supports Large Language Model (LLM) inference services, with fine-tuning and additional features planned for future releases.

In just five minutes, you can initialize your broker to manage operations, set up and fund your account to pay for inference services, and learn how to send inference requests and handle responses.

## Quick Start

### Installation

```bash
pnpm add @0glabs/0g-serving-broker @types/crypto-js@4.2.2 crypto-js@4.2.0
```
## Core Concepts

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

## Step-by-Step Guide

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

:::caution Browser Compatibility
`@0glabs/0g-serving-broker` relies on several Node.js built-in modules (`crypto`, `stream`, `util`, `buffer`, `process`), so polyfills are necessary for browser compatibility.

**Example with Vite:**

```bash
pnpm add -D vite-plugin-node-polyfills
```

```javascript
// vite.config.js
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default {
  plugins: [
    nodePolyfills({
      include: ['crypto', 'stream', 'util', 'buffer', 'process'],
      globals: { Buffer: true, global: true, process: true }
    })
  ]
};
```

For other build tools (Webpack, Rollup, etc.), configure the appropriate polyfills for these Node.js modules.
:::

</TabItem>
</Tabs>

### Fund Your Account

```typescript
// Add 10 OG tokens
await broker.ledger.addLedger(10);

// Check balance
const account = await broker.ledger.getLedger();
console.log(`Balance: ${ethers.formatEther(account.totalBalance)} OG`);
```

### Discover Available Services

The 0G Compute Network hosts multiple AI service providers. The service discovery process helps you find and select the appropriate services for your needs.

<details open>
<summary><b>🎯 Official 0G Services</b></summary>

| Model | Provider Address | Description | Verification |
|-------|-----------------|-------------|--------------|
| **gpt-oss-120b** | `0xf07240Efa67755B5311bc75784a061eDB47165Dd` | State-of-the-art 70B parameter model for general AI tasks | TEE (TeeML) |
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
  const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);
  
  // Generate auth headers (single use)
  // For chat requests, pass JSON stringified messages array
  const messages = [{ role: "user", content: question }];
  const headers = await broker.inference.getRequestHeaders(providerAddress, JSON.stringify(messages));
  
```

### Send a Request to the Service

<Tabs>
<TabItem value="fetch" label="Using Fetch API" default>

```typescript
const messages = [{ role: "user", content: question }];

const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      messages: messages,
      model: model,
    }),
  });
  
const data = await response.json();
const answer = data.choices[0].message.content;
const chatID = data.id; // Save for verification

```
</TabItem>
<TabItem value="openai" label="Using OpenAI SDK">

```typescript
const messages = [{ role: "user", content: question }];

const openai = new OpenAI({
    baseURL: endpoint,
    apiKey: "", // Empty string
    defaultHeaders: headers
  });
  
const completion = await openai.chat.completions.create(
  {
    messages: messages,
    model: model,
  },
);
  
const answer = completion.choices[0].message.content!;
const chatID = completion.id; // Save for verification
```

</TabItem>
</Tabs>

### Response Processing
This function is used to verify the response. If it is a verifiable service, it will return whether the response is valid.

```typescript
const isValid = await broker.inference.processResponse(
  providerAddress,
  receivedContent,
  chatID // Optional: Only for verifiable services
);
```

### Fee Settlement
Fee settlement by the broker service occurs at scheduled intervals.

## Account Management

### Check Balance
```typescript
const account = await broker.ledger.getLedger();
console.log(`
  Balance: ${ethers.formatEther(account.totalBalance)} OG
`);
```

### Add Funds
```typescript
// Add more funds (amount in OG tokens)
await broker.ledger.depositFund(10);
```

### Request Refund
```typescript
// Withdraw unused funds from inference sub-account
// Parameters: service type ("inference" or "fine-tuning")
await broker.ledger.retrieveFund("inference");
```

## Troubleshooting

### Common Issues

<details>
<summary><b>Error: Insufficient balance</b></summary>

Your account doesn't have enough funds. Add more:
```typescript
// Amount in OG tokens
await broker.ledger.addLedger(1);
```
</details>

<details>
<summary><b>Error: Headers already used</b></summary>

Request headers are single-use. Generate new ones for each request:
```typescript
// ❌ Wrong
const messages = [{role: "user", content: "Hello"}];
const headers = await broker.inference.getRequestHeaders(provider, JSON.stringify(messages));
await makeRequest(headers);
await makeRequest(headers); // Will fail!

// ✅ Correct
const headers1 = await broker.inference.getRequestHeaders(provider, JSON.stringify(messages));
await makeRequest(headers1);
const headers2 = await broker.inference.getRequestHeaders(provider, JSON.stringify(messages));
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