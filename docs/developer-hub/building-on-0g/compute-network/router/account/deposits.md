---
id: deposits
title: Deposits & Billing
sidebar_position: 2
description: "Deposit 0G tokens to the shared 0G Payment Layer, check your balance, and see how per-request cost is calculated."
---

# Deposits & Billing

The Router charges on-chain, per token, from a single balance that covers every model, every provider, every service type. You deposit once; you're done until the balance runs out.

:::note Separate from Direct sub-accounts
The balance you use with the Router is distinct from the per-provider sub-accounts used by the [Direct](../../direct) flow / [compute-marketplace.0g.ai](https://compute-marketplace.0g.ai). Funds in one do not back calls in the other. See [Router vs Advanced Mode](../comparison#pc0gai-router-vs-advanced-mode) if you've been using the old flow.
:::

## Deposit

You deposit to the **0G Payment Layer** — a shared balance contract used across all 0G products, not just the Router. Deposit once, and any 0G product you use (Router included) draws from the same pool.

The easiest way is **[pc.0g.ai](https://pc.0g.ai) → Dashboard → Deposit**. It's a normal on-chain transaction signed by your wallet; funds are usable within a few seconds of confirmation.

Payment Layer contract addresses:

| Network | Address |
|---|---|
| Mainnet | `0xA3b15Bd2aD18BFB6b5f92D8AA9F444Dd59d1cE32` |
| Testnet | `0x0AD9690e0b34aB2d493DE02cDF149ee34f6C9939` |

## How Costs Are Calculated

```
total_cost = (input_tokens × prompt_price) + (output_tokens × completion_price)
```

- Prices are declared per model and quoted in **neuron per token** (1e18 neuron = 1 0G)
- `input_tokens` includes the full conversation context you send (system prompt + prior messages + current user message)
- Image and audio endpoints price per request or per second depending on the model — see the catalog

Get current prices from [`GET /v1/models`](../models) or the model card on [pc.0g.ai](https://pc.0g.ai). The Router does not add markup — what the provider charges is what you pay.

:::note Cached-token pricing
Tiered pricing for cached prompt tokens is on the roadmap — a future release will report cached and fresh input tokens separately and bill them at distinct rates.
:::

## Check Your Balance

```bash
curl https://router-api.0g.ai/v1/account/balance \
  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

```json
{
  "address": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  "deposit_balance": "2000000000000000000",
  "total_balance":   "2000000000000000000"
}
```

Values are in **neuron**. `total_balance` is what is available to spend right now. It may lag your Payment Layer balance slightly because the Router pulls from the Payment Layer in batches (see below). When `total_balance` hits zero and the Payment Layer is also empty, the next inference request returns `402 insufficient_balance`.

## Check Your Usage

Aggregate stats:

```bash
curl "https://router-api.0g.ai/v1/account/usage/stats?start_date=2026-04-01" \
  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

Returns total requests, total tokens (prompt/completion split), and total cost for the window.

Per-request history:

```bash
curl "https://router-api.0g.ai/v1/account/usage/history?limit=20&offset=0" \
  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

Returns a paginated list of individual requests with model, provider address, token counts, and cost. Both endpoints also accept `api_key_id`, `source`, `start_date`, and `end_date` filters.

## Related

- [**Authentication**](../authentication) — how to create, rotate, and revoke the API keys billed against this balance
- [**Rate Limits**](../rate-limits)
- [**Errors**](../errors) — especially `402 insufficient_balance`

---

## How funds reach the Router (advanced)

You don't need to know this to use the Router, but if you're curious about the on-chain flow:

1. You deposit to the **Payment Layer** contract. The deposit belongs to your wallet address.
2. The Router runs a background **PaymentWorker** that watches for users whose Router-side balance is below a threshold and who have an active usage pattern. For those users, the worker asks the Payment Layer to release a small tranche of your balance into the Router's internal payment contract.
3. The Router then debits that internal contract as you consume tokens, and periodically settles the consumed amount to individual providers on-chain.

This two-step design (Payment Layer → Router) means the Payment Layer balance is shared across all 0G products, and the Router only holds what it needs for your near-term usage. From your side, the only thing you interact with is the Payment Layer deposit — everything else is automatic.
