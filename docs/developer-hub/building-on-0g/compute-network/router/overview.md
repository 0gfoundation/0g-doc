---
id: overview
title: Overview
sidebar_position: 1
description: "A single OpenAI-compatible endpoint for every model on the 0G Compute Network. No SDK, no wallet keys — just an API key."
---

# 0G Compute Router

The **0G Compute Router** is an API gateway that sits in front of the entire 0G Compute Network. One endpoint, one API key, every model.

It handles provider discovery, on-chain billing, authentication, and failover automatically — so you use 0G's decentralized inference with the same code you'd write for OpenAI or Anthropic.

## When to Use the Router

|                     | **Router**                          | **[Direct](../direct)**        |
| ------------------- | ----------------------------------- | ---------------------------------- |
| Setup               | Get an API key                      | Install SDK, manage wallet keys    |
| Provider management | Automatic routing + failover        | Manual selection & funding         |
| Billing             | Single unified on-chain balance     | Per-provider sub-accounts          |
| API shape           | OpenAI / Anthropic compatible       | Custom SDK calls                   |
| Best for            | Server-side apps, agents, prototypes| Browser dApps, direct chain access |

Pick the Router when you want the simplest integration path. Pick Direct when you need per-provider control or wallet-signed requests in the browser.

## 60-Second Tour

<div className="feature-grid">

**[Quickstart →](./quickstart)**
Connect wallet, deposit, create an API key, send your first request — in four steps.

**[Chat Completions →](./features/chat-completions)**
OpenAI-compatible `/v1/chat/completions` with streaming, tool calling, and reasoning tokens.

**[Provider Routing →](./routing)**
Route by lowest latency, lowest price, or pin to a specific on-chain provider.

**[Authentication →](./authentication)**
API keys with three permission tiers.

**[Models →](./models)**
Browse the live catalog. Each model has pricing, context window, and capability flags.

**[Deposits & Billing →](./account/deposits)**
Deposit 0G tokens, consume on-chain, settle periodically. No subscriptions.

</div>

## Base URLs

Mainnet and testnet are fully separate environments — different Web UI, different API endpoint, different on-chain balances and API keys. Pick the one that matches the network your wallet is on.

| Network     | Web UI                                              | API Endpoint                                              |
| ----------- | --------------------------------------------------- | --------------------------------------------------------- |
| **Mainnet** | [pc.0g.ai](https://pc.0g.ai)                        | `https://router-api.0g.ai/v1`                             |
| **Testnet** | [pc.testnet.0g.ai](https://pc.testnet.0g.ai)        | `https://router-api-testnet.integratenetwork.work/v1`     |

:::tip OpenAI SDK drop-in
Any tool that speaks the OpenAI API works with 0G Router — change `base_url` and `api_key`, nothing else.
:::

:::note Migrating from compute-marketplace.0g.ai?
If you previously deposited on **[compute-marketplace.0g.ai](https://compute-marketplace.0g.ai)**, those funds live in **per-provider sub-accounts** under the [Direct](../direct) flow. They do **not** appear in the Router balance on pc.0g.ai — the two systems use different contracts and different accounting.

To see and use those old funds on pc.0g.ai, switch to **Advanced** mode using the toggle in the top-right. Advanced mode is the same Direct flow, just embedded in the new UI. See [Router vs Advanced Mode](./comparison#pc0gai-router-vs-advanced-mode).
:::
