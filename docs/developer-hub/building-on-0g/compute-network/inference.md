---
id: inference
title: Inference
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 0G Compute Inference

0G Compute Network provides decentralized AI inference services, supporting various AI models including Large Language Models (LLM), text-to-image generation, and speech-to-text processing.

## Prerequisites

- Node.js >= 22.0.0
- A wallet with 0G tokens (either testnet or mainnet)
- EVM compatible wallet (for Web UI)

## Supported Service Types

- **Chatbot Services**: Conversational AI with models like GPT, DeepSeek, and others
- **Text-to-Image**: Generate images from text descriptions using Stable Diffusion and similar models
- **Speech-to-Text**: Transcribe audio to text using Whisper and other speech recognition models

## Available Services

:::info Testnet Services

<details>
<summary><b>View Testnet Services (3 Available)</b></summary>

| # | Model | Type | Provider | Input (per 1M tokens) | Output (per 1M tokens) |
|---|-------|------|----------|----------------------|------------------------|
| 1 | `qwen-2.5-7b-instruct` | Chatbot | `0xa48f01...` | 0.05 0G | 0.10 0G |
| 2 | `gpt-oss-20b` | Chatbot | `0x8e60d4...` | 0.05 0G | 0.10 0G |
| 3 | `gemma-3-27b-it` | Chatbot | `0x69Eb5a...` | 0.15 0G | 0.40 0G |

**Available Models:**
- **Qwen 2.5 7B Instruct**: Fast and efficient conversational model
- **GPT-OSS-20B**: Mid-size open-source GPT alternative
- **Gemma 3 27B IT**: Google's instruction-tuned model

All testnet services feature TeeML verifiability and are ideal for development and testing.

</details>

:::

:::tip Mainnet Services

<details>
<summary><b>View Mainnet Services (7 Available)</b></summary>

| # | Model | Type | Provider | Input (per 1M tokens) | Output (per 1M tokens) |
|---|-------|------|----------|----------------------|------------------------|
| 1 | `DeepSeek-V3.2` | Chatbot | `0xd9966e...` | 0.3 0G | 0.48 0G |
| 2 | `deepseek-chat-v3-0324` | Chatbot | `0x1B3AAe...` | 0.30 0G | 1.00 0G |
| 3 | `gpt-oss-120b` | Chatbot | `0xBB3f5b...` | 0.10 0G | 0.49 0G |
| 4 | `qwen3-vl-30b-a3b-instruct` | Chatbot | `0x4415ef...` | 0.49 0G | 0.49 0G |
| 5 | `gpt-oss-20b` | Chatbot | `0x44ba50...` | 0.05 0G | 0.11 0G |
| 6 | `whisper-large-v3` | Speech-to-Text | `0x36aCff...` | 0.05 0G | 0.11 0G |
| 7 | `z-image` | Text-to-Image | `0xE29a72...` | - | 0.003 0G/image |

**Available Models by Type:**

**Chatbots (5 models):**
- **DeepSeek V3.2**: Latest high-performance reasoning model
- **GPT-OSS-120B**: Large-scale open-source GPT model
- **Qwen 2.5 VL 72B**: Vision-language multimodal model
- **DeepSeek Chat V3**: Optimized conversational model
- **GPT-OSS-20B**: Efficient mid-size model

**Speech-to-Text (1 model):**
- **Whisper Large V3**: OpenAI's state-of-the-art transcription model

**Text-to-Image (1 model):**
- **Z-Image**: Fast high-quality image generation

All mainnet services feature TeeML verifiability for trusted execution in production environments.

</details>

:::

## Choose Your Interface

| Feature | Web UI | CLI | SDK |
|---------|--------|-----|-----|
| Setup time | ~1 min | ~2 min | ~5 min |
| Interactive chat | ✅ | ❌ | ❌ |
| Automation | ❌ | ✅ | ✅ |
| App integration | ❌ | ❌ | ✅ |
| Direct API access | ❌ | ❌ | ✅ |

<Tabs>
<TabItem value="web-ui" label="Web UI" default>

**Best for:** Quick testing, experimentation and direct frontend integration.

### Installation

```bash
pnpm add @0glabs/0g-serving-broker -g
```

### Launch Web UI

```bash
0g-compute-cli ui start-web
```

Open `http://localhost:3090` in your browser.

### Getting Started

#### 1. Connect & Fund

1. **Connect your wallet** (MetaMask recommended)
2. **Deposit some 0G tokens** using the account dashboard
3. **Browse available AI models** and their pricing

#### 2. Start Using AI Services

**Option A: Chat Interface**
- Click "Chat" on any chatbot provider
- Start conversations immediately
- Perfect for testing and experimentation

**Option B: Get API Integration**
- Click "Build" on any provider
- Get step-by-step integration guides
- Copy-paste ready code examples

</TabItem>
<TabItem value="cli" label="CLI">

**Best for:** Automation, scripting, and server environments

### Installation

```bash
pnpm add @0glabs/0g-serving-broker -g
```

### Setup Environment

#### Choose Network

```bash
0g-compute-cli setup-network
```

#### Login with Wallet

Enter your wallet private key when prompted. This will be used for account management and service payments.

```bash
0g-compute-cli login
```

### Create Account & Add Funds

Before using inference services, you need to fund your account. For detailed account management, see [Account Management](./account-management).

```bash
0g-compute-cli deposit --amount 10
0g-compute-cli get-account
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 5
```

### CLI Commands

#### List Providers
```bash
0g-compute-cli inference list-providers
```

#### Verify Provider
Check provider's TEE attestation and reliability before using:
```bash
0g-compute-cli inference verify --provider <PROVIDER_ADDRESS>
```

This command outputs the provider's report and verifies their Trusted Execution Environment (TEE) status.

#### Acknowledge Provider
Before using a provider, acknowledge them on-chain:
```bash
0g-compute-cli inference acknowledge-provider --provider <PROVIDER_ADDRESS>
```

#### Direct API Access
Generate an authentication token for direct API calls:
```bash
0g-compute-cli inference get-secret --provider <PROVIDER_ADDRESS>
```

This generates a Bearer token in the format `app-sk-<SECRET>` that you can use for direct API calls.

### API Usage Examples

<Tabs>
<TabItem value="chatbot" label="Chatbot" default>

Use for conversational AI and text generation.

<Tabs>
<TabItem value="curl-chat" label="cURL" default>

```bash
curl <service_url>/v1/proxy/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer app-sk-<YOUR_SECRET>" \
  -d '{
    "model": <service.model>,
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }`
```

</TabItem>
<TabItem value="js-chat" label="JavaScript">

```javascript
const OpenAI = require('openai');

const client = new OpenAI({
  baseURL: `${service.url}/v1/proxy`,
  apiKey: 'app-sk-<YOUR_SECRET>'
});

const completion = await client.chat.completions.create({
  model: service.model,
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user',
      content: 'Hello!'
    }
  ]
});

console.log(completion.choices[0].message);
```

</TabItem>
<TabItem value="python-chat" label="Python">

```python
from openai import OpenAI

client = OpenAI(
    base_url=`${service.url}/v1/proxy`,
    api_key='app-sk-<YOUR_SECRET>'
)

completion = client.chat.completions.create(
    model=service.model,
    messages=[
        {
            'role': 'system',
            'content': 'You are a helpful assistant.'
        },
        {
            'role': 'user',
            'content': 'Hello!'
        }
    ]
)

print(completion.choices[0].message)
```

</TabItem>
</Tabs>

</TabItem>
<TabItem value="text-to-image" label="Text-to-Image">

Generate images from text descriptions.

<Tabs>
<TabItem value="curl-image" label="cURL" default>

```bash
curl <service_url>/v1/proxy/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer app-sk-<YOUR_SECRET>" \
  -d '{
    "model": <service.model>,
    "prompt": "A cute baby sea otter playing in the water",
    "n": 1,
    "size": "1024x1024"
  }'
```

</TabItem>
<TabItem value="js-image" label="JavaScript">

```javascript
const OpenAI = require('openai');

const client = new OpenAI({
  baseURL: `${service.url}/v1/proxy`,
  apiKey: 'app-sk-<YOUR_SECRET>'
});

const response = await client.images.generate({
  model: service.model,
  prompt: 'A cute baby sea otter playing in the water',
  n: 1,
  size: '1024x1024'
});

console.log(response.data);
```

</TabItem>
<TabItem value="python-image" label="Python">

```python
from openai import OpenAI

client = OpenAI(
    base_url=`${service.url}/v1/proxy`,
    api_key='app-sk-<YOUR_SECRET>'
)

response = client.images.generate(
    model=service.model,
    prompt='A cute baby sea otter playing in the water',
    n=1,
    size='1024x1024'
)

print(response.data)
```

</TabItem>
</Tabs>

</TabItem>
<TabItem value="speech-to-text" label="Speech-to-Text">

Transcribe audio files to text.

<Tabs>
<TabItem value="curl-audio" label="cURL" default>

```bash
curl <service_url>/v1/proxy/audio/transcriptions \
  -H "Authorization: Bearer app-sk-<YOUR_SECRET>" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@audio.ogg" \
  -F "model=whisper-large-v3" \
  -F "response_format=json"
```

</TabItem>
<TabItem value="js-audio" label="JavaScript">

```javascript
const OpenAI = require('openai');
const fs = require('fs');

const client = new OpenAI({
  baseURL: `${service.url}/v1/proxy`,
  apiKey: 'app-sk-<YOUR_SECRET>'
});

const transcription = await client.audio.transcriptions.create({
  file: fs.createReadStream('audio.ogg'),
  model: 'whisper-large-v3',
  response_format: 'json'
});

console.log(transcription.text);
```

</TabItem>
<TabItem value="python-audio" label="Python">

```python
from openai import OpenAI

client = OpenAI(
    base_url=`${service.url}/v1/proxy`,
    api_key='app-sk-<YOUR_SECRET>'
)

with open('audio.ogg', 'rb') as audio_file:
    transcription = client.audio.transcriptions.create(
        file=audio_file,
        model='whisper-large-v3',
        response_format='json'
    )

print(transcription.text)
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>

### Start Local Proxy Server

Run a local OpenAI-compatible server:
```bash
# Start server on port 3000 (default)
0g-compute-cli inference serve --provider <PROVIDER_ADDRESS>

# Custom port
0g-compute-cli inference serve --provider <PROVIDER_ADDRESS> --port 8080
```

Then use any OpenAI-compatible client to connect to `http://localhost:3000`.

</TabItem>
<TabItem value="sdk" label="SDK">

**Best for:** Application integration and programmatic access

### Installation

```bash
pnpm add @0glabs/0g-serving-broker
```

:::tip Starter Kits Available
Get up and running quickly with our comprehensive TypeScript starter kit within minutes.

- **[TypeScript Starter Kit](https://github.com/0gfoundation/0g-compute-ts-starter-kit)** - Complete examples with TypeScript and CLI tool
:::

### Initialize the Broker

<Tabs>
<TabItem value="nodejs" label="Node.js" default>

```typescript
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

// Choose your network
const RPC_URL = process.env.NODE_ENV === 'production'
  ? "https://evmrpc.0g.ai"  // Mainnet
  : "https://evmrpc-testnet.0g.ai";  // Testnet

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const broker = await createZGComputeNetworkBroker(wallet);
```

</TabItem>
<TabItem value="browser" label="Browser">

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
`@0glabs/0g-serving-broker` requires polyfills for Node.js built-in modules.

**Vite example:**
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
:::

</TabItem>
</Tabs>

### Discover Services

```typescript
// List all available services
const services = await broker.inference.listService();

// Filter by service type
const chatbotServices = services.filter(s => s.serviceType === 'chatbot');
const imageServices = services.filter(s => s.serviceType === 'text-to-image');
const speechServices = services.filter(s => s.serviceType === 'speech-to-text');
```

### Account Management

For detailed account operations, see [Account Management](./account-management).

```typescript
const account = await broker.ledger.getLedger();
await broker.ledger.depositFund(10);
// Required before first use of a provider
await broker.inference.acknowledgeProviderSigner(providerAddress);
```

### Make Inference Requests

<Tabs>
<TabItem value="chatbot-sdk" label="Chatbot" default>

```typescript
const messages = [{ role: "user", content: "Hello!" }];

// Get service metadata
const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);

// Generate auth headers
const headers = await broker.inference.getRequestHeaders(
  providerAddress
);

// Make request
const response = await fetch(`${endpoint}/chat/completions`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify({ messages, model })
});

const data = await response.json();
const answer = data.choices[0].message.content;
```

</TabItem>
<TabItem value="text-to-image-sdk" label="Text-to-Image">

```typescript
const prompt = "A cute baby sea otter";

const body = JSON.stringify({
    model,
    prompt,
    n: 1,
    size: "1024x1024"
  });

// Get service metadata
const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);

// Generate auth headers
const headers = await broker.inference.getRequestHeaders(
  providerAddress,
  body
);

// Make request
const response = await fetch(`${endpoint}/images/generations`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify({
    model,
    prompt,
    n: 1,
    size: "1024x1024"
  })
});

const data = await response.json();
const imageUrl = data.data[0].url;
```

</TabItem>
<TabItem value="speech-to-text-sdk" label="Speech-to-Text">

```typescript
const formData = new FormData();
formData.append('file', audioFile); // audioFile is a File or Blob
formData.append('model', model);
formData.append('response_format', 'json');

// Get service metadata
const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);

// Generate auth headers
const headers = await broker.inference.getRequestHeaders(
  providerAddress
);

// Make request
const response = await fetch(`${endpoint}/audio/transcriptions`, {
  method: "POST",
  headers: { ...headers },
  body: formData
});

const data = await response.json();
const transcription = data.text;
```

</TabItem>
</Tabs>

### Response Verification

The `processResponse` method handles response verification and automatic fee management. Both parameters are optional:

- **`receivedContent`**: The usage data from the service response. When provided, the SDK caches accumulated usage and automatically transfers funds from your main account to the provider's sub-account to prevent service interruptions.
- **`chatID`**: Response identifier for verifiable TEE services. Different service types handle this differently.

<Tabs>
<TabItem value="chatbot-verify" label="Chatbot" default>

For chatbot services, pass the usage data from the response to enable automatic fee management:

```typescript
// Standard chat completion
const response = await fetch(`${endpoint}/chat/completions`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify({ messages, model })
});

const data = await response.json();

// Process response for automatic fee management
if (data.usage) {
  await broker.inference.processResponse(
    providerAddress,
    undefined,              // chatID is undefined for non-verifiable responses
    JSON.stringify(data.usage)  // Pass usage data for fee calculation
  );
}

// For verifiable TEE services with chatID
// Check response headers first
let chatID = response.headers.get("ZG-Res-Key") || response.headers.get("zg-res-key");

// If not found in response headers, check response body
if (!chatID) {
  chatID = data.id || data.chatID;
}

if (chatID) {
  const isValid = await broker.inference.processResponse(
    providerAddress,
    chatID,           // Verify the response integrity
    JSON.stringify(data.usage)  // Also manage fees
  );
}
```

</TabItem>
<TabItem value="text-to-image-verify" label="Text-to-Image">

For text-to-image services, pass the original request data for input-based fee calculation:

```typescript
const requestBody = {
  model,
  prompt: "A cute baby sea otter",
  size: "1024x1024",
  n: 1
};

const response = await fetch(`${endpoint}/images/generations`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify(requestBody)
});

const data = await response.json();

// Get chatID from response headers for verification
const chatID = response.headers.get("ZG-Res-Key") || response.headers.get("zg-res-key");

if (chatID) {
  // Process response with chatID for verification and fee calculation
  const isValid = await broker.inference.processResponse(
    providerAddress,
    chatID                        // Verify the response integrity
  );
  console.log("Response valid:", isValid);
} else {
  // Fallback: process without verification if no chatID
  await broker.inference.processResponse(
    providerAddress,
    undefined                     // No chatID available
  );
}
```

</TabItem>
<TabItem value="speech-to-text-verify" label="Speech-to-Text">

For speech-to-text services, pass the usage data if available:

```typescript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('model', model);

const response = await fetch(`${endpoint}/audio/transcriptions`, {
  method: "POST",
  headers: { ...headers },
  body: formData
});

const data = await response.json();

// Get chatID from response headers for verification
const chatID = response.headers.get("ZG-Res-Key") || response.headers.get("zg-res-key");

if (chatID) {
  // Process response with chatID for verification and fee calculation
  const isValid = await broker.inference.processResponse(
    providerAddress,
    chatID,                      // Verify the response integrity
    JSON.stringify(data.usage || {}) // Pass usage for fee calculation
  );
  console.log("Response valid:", isValid);
} else if (data.usage) {
  // Fallback: process without verification if no chatID but usage available
  await broker.inference.processResponse(
    providerAddress,
    undefined,                   // No chatID available
    JSON.stringify(data.usage)   // Pass usage for fee calculation
  );
}
```

</TabItem>
<TabItem value="streaming-verify" label="Streaming Responses">

For streaming responses, handle chatID differently based on service type:

<Tabs>
<TabItem value="chatbot-stream" label="Chatbot Streaming" default>

```typescript
// For chatbot streaming, first check headers then try to get ID from stream
let chatID = response.headers.get("ZG-Res-Key") || response.headers.get("zg-res-key");

let usage = null;
let streamChatID = null; // Will try to get from stream data
const decoder = new TextDecoder();
const reader = response.body.getReader();

// Process stream
let rawBody = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  rawBody += decoder.decode(value, { stream: true });
}

// Parse usage and chatID from stream data
for (const line of rawBody.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed === 'data: [DONE]') continue;

  try {
    const jsonStr = trimmed.startsWith('data:')
      ? trimmed.slice(5).trim()
      : trimmed;
    const message = JSON.parse(jsonStr);

    // For chatbot, try to get ID from stream data
    if (!streamChatID && (message.id || message.chatID)) {
      streamChatID = message.id || message.chatID;
    }

    if (message.usage) {
      usage = message.usage;
    }
  } catch {}
}

// Use chatID from stream data if available, otherwise use header
const finalChatID = chatID || streamChatID;

// Process with chatID for verification if available
if (finalChatID) {
  const isValid = await broker.inference.processResponse(
    providerAddress,
    finalChatID,
    JSON.stringify(usage || {})
  );
  console.log("Chatbot streaming response valid:", isValid);
} else if (usage) {
  // Fallback: process without verification
  await broker.inference.processResponse(
    providerAddress,
    undefined,
    JSON.stringify(usage)
  );
}
```

</TabItem>
<TabItem value="audio-stream" label="Speech-to-Text Streaming">

```typescript
// For speech-to-text streaming, get chatID from headers
const chatID = response.headers.get("ZG-Res-Key") || response.headers.get("zg-res-key");

let usage = null;
const decoder = new TextDecoder();
const reader = response.body.getReader();

// Process stream
let rawBody = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  rawBody += decoder.decode(value, { stream: true });
}

// Parse usage from stream data
for (const line of rawBody.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed === 'data: [DONE]') continue;

  try {
    const jsonStr = trimmed.startsWith('data:')
      ? trimmed.slice(5).trim()
      : trimmed;
    const message = JSON.parse(jsonStr);
    if (message.usage) {
      usage = message.usage;
    }
  } catch {}
}

// Process with chatID for verification if available
if (chatID) {
  const isValid = await broker.inference.processResponse(
    providerAddress,
    chatID,
    JSON.stringify(usage || {})
  );
  console.log("Audio streaming response valid:", isValid);
} else if (usage) {
  // Fallback: process without verification
  await broker.inference.processResponse(
    providerAddress,
    undefined,
    JSON.stringify(usage)
  );
}
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>

**Key Points:**
- Always call `processResponse` after receiving responses to maintain proper fee management
- The SDK automatically handles fund transfers to prevent service interruptions
- For verifiable TEE services, the method also validates response integrity
- **chatID retrieval varies by service type:**
  - **Chatbot**: First try `ZG-Res-Key` header, then check `response.id` or `data.chatID` as fallback
  - **Text-to-Image & Speech-to-Text**: Always get chatID from `ZG-Res-Key` response header
  - **Streaming responses**:
    - **Chatbot streaming**: Check headers first, then try to get `id` or `chatID` from stream data
    - **Speech-to-text streaming**: Get chatID from `ZG-Res-Key` header immediately
- Usage data format varies by service type but typically includes token counts or request metrics

</TabItem>
</Tabs>

---

## Troubleshooting

### Common Issues

<details>
<summary><b>Error: Insufficient balance</b></summary>

Your account doesn't have enough funds. Add more using CLI or SDK:

CLI:

#### Deposit to Main Account
```bash
0g-compute-cli deposit --amount 5
```

#### Transfer to Provider Sub-Account
```bash
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 5
```

SDK:
```typescript
await broker.ledger.depositFund(1);
```
</details>

<details>
<summary><b>Error: Provider not acknowledged</b></summary>

You need to acknowledge the provider before using their service:

CLI:
```bash
0g-compute-cli inference acknowledge-provider --provider <PROVIDER_ADDRESS>
```

SDK:
```typescript
await broker.inference.acknowledgeProviderSigner(providerAddress);
```
</details>

<details>
<summary><b>Error: No funds in provider sub-account</b></summary>

Transfer funds to the specific provider sub-account:
```bash
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 5
```

Check your account balance:
```bash
0g-compute-cli get-account
```
</details>

<details>
<summary><b>Web UI not starting</b></summary>

If the web UI fails to start:

1. Check if another service is using port 3090:
```bash
0g-compute-cli ui start-web --port 3091
```

2. Ensure the package was installed globally:
```bash
pnpm add @0glabs/0g-serving-broker -g
```
</details>

## Next Steps

- **Manage Accounts** → [Account Management Guide](./account-management)
- **Fine-tune Models** → [Fine-tuning Guide](./fine-tuning)
- **Become a Provider** → [Provider Setup](./inference-provider)
- **View Examples** → [GitHub](https://github.com/0glabs/0g-compute-ts-starter-kit)

---

*Questions? Join our [Discord](https://discord.gg/0glabs) for support.*
