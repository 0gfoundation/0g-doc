---
id: comparison
title: Router vs Direct
sidebar_position: 11
description: "Which integration path to pick — Router gateway or Direct with wallet signing."
---

# Router vs Direct

The 0G Compute Network exposes the same underlying providers through two integration paths. This page helps you choose.

## At a Glance

|                            | **Router**                                | **[Direct](../direct)**                   |
| -------------------------- | ----------------------------------------- | ----------------------------------------- |
| **Where the request signs from** | Router API key (server-side)        | User's wallet (client or server)          |
| **API shape**              | OpenAI / Anthropic compatible             | 0G SDK calls                              |
| **Provider selection**     | Automatic with failover                   | Manual — you choose and fund each         |
| **Billing**                | Single unified on-chain balance           | Per-provider sub-accounts                 |
| **Browser-safe**           | Only via your backend (API keys are secret) | Yes — user's wallet signs each request   |
| **Integration effort**     | Change `base_url` + API key               | Install SDK, manage keys, handle signing  |
| **On-chain transparency**  | Settled periodically in batches           | Every call settles against a sub-account  |
| **Typical user**           | Backend service, agent framework, prototype | Wallet-connected dApp, on-chain agent   |

## Pick the Router When…

- You're building a **server-side app** — an agent, a backend, a CLI, an automation.
- You want to **reuse existing OpenAI/Anthropic code** without rewriting for a new SDK.
- You don't want to manage per-provider funding or provider discovery yourself.
- You want one balance covering every model, every service.
- You're prototyping and want the shortest path from signup to first request.

## Pick Direct When…

- You're building a **browser dApp** where the end user's wallet signs requests — API keys should never ship to browsers.
- You need **direct smart-contract interaction** — reading provider state, on-chain settlement receipts, custom escrow logic.
- You want to **choose and fund specific providers** with tight control, not a gateway's routing policy.
- You're writing an on-chain agent or a contract that calls providers directly.

## Can I Use Both?

Yes. The balances are separate (Router balance vs per-provider sub-accounts), but nothing prevents a single project from using the Router for backend workloads and Direct for a browser-wallet dApp.

## pc.0g.ai: Router vs Advanced Mode

The [pc.0g.ai](https://pc.0g.ai) Web UI exposes **both** integration paths through a mode toggle in the top-right:

| Mode in UI                 | What it is                                                                                   | Where funds live                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Router** (default)       | This documentation. Unified API gateway with a single balance.                               | 0G **Payment Layer** — shared contract across all 0G products, single pool across all models/providers |
| **Advanced**               | The classic [Direct](../direct) flow, embedded in the new UI                             | Per-provider sub-accounts — same as [compute-marketplace.0g.ai](https://compute-marketplace.0g.ai) |

**The two balance pools are independent.** A Router deposit does not fund your provider sub-accounts, and sub-account balances do not back Router API calls. They live in different contracts.

### For existing compute-marketplace.0g.ai users

If you've been using [compute-marketplace.0g.ai/wallet](https://compute-marketplace.0g.ai/wallet) and your funds don't appear in the default Router view on pc.0g.ai — that's expected. Click **Advanced** (top-right) to switch to the sub-account view where your existing balances are shown. Nothing has been lost; you're looking at the wrong pool.

If you want to consolidate onto the Router, withdraw from the per-provider sub-accounts in Advanced mode, then deposit the tokens into the Router balance from the default view.

## See Also

- **[Router Overview](./overview)**
- **[Direct](../direct)** — SDK-based path (inference, fine-tuning, and account management)
