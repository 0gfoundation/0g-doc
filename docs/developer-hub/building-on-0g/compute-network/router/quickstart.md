---
id: quickstart
title: Quickstart
sidebar_position: 2
description: "Four steps from zero to your first inference request."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quickstart

Four steps. Five minutes.

## 1. Connect Your Wallet

Visit **[pc.0g.ai](https://pc.0g.ai)** and connect a wallet. MetaMask and WalletConnect work directly; you can also sign in with Google, X/Twitter, Discord, or TikTok via Privy, which provisions an embedded wallet for you.

## 2. Deposit Funds

Deposit 0G tokens to the Router's on-chain payment contract. Your balance lives on-chain and is debited per request.

See [Deposits & Billing](./account/deposits) for how costs are calculated and how to check your balance.

## 3. Create an API Key

In **Dashboard → API Keys**, create a key with the `inference` permission. You'll get a secret starting with `sk-`.

Store it somewhere safe — the Router never shows it again.

## 4. Send Your First Request

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

</TabItem>
<TabItem value="python" label="Python (OpenAI SDK)">

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://router-api.0g.ai/v1",
    api_key="sk-YOUR_API_KEY",
)

response = client.chat.completions.create(
    model="zai-org/GLM-5-FP8",
    messages=[{"role": "user", "content": "Hello!"}],
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="js" label="JavaScript (OpenAI SDK)">

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://router-api.0g.ai/v1",
  apiKey: "sk-YOUR_API_KEY",
});

const response = await client.chat.completions.create({
  model: "zai-org/GLM-5-FP8",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);
```

</TabItem>
</Tabs>

That's it. You're talking to a decentralized TEE-backed provider through an OpenAI-compatible API.

## Next Steps

- **[Chat Completions](./features/chat-completions)** — streaming, tool calling, system prompts
- **[Provider Routing](./routing)** — route by latency, price, or specific provider
- **[Models](./models)** — browse the catalog with live pricing
