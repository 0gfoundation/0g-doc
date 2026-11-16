---
id: deposits
title: Deposits & Billing
sidebar_position: 2
description: "Pay for the Router in USD or 0G, fund your balance, check it, and see how per-request cost (including prompt caching) is calculated."
---

# Deposits & Billing

The Router charges per request from a single balance that covers every model, every provider, every service type. That balance is held in **USD** or in **0G tokens**, depending on your account's settlement mode.

:::note Separate from Direct sub-accounts
The balance you use with the Router is distinct from the per-provider sub-accounts used by the [Direct](../../direct) flow / [compute-marketplace.0g.ai](https://compute-marketplace.0g.ai). Funds in one do not back calls in the other. See [Router vs Advanced Mode](../comparison#pc0gai-router-vs-advanced-mode) if you've been using the old flow.
:::

## USD or 0G

Each account settles in exactly one currency at a time:

| Mode | You fund with | Prices used | Amounts reported in |
|---|---|---|---|
| `usd` | Card top-up on [pc.0g.ai](https://pc.0g.ai) | `pricing_usd` | **micro-USD** (1,000,000 = $1) |
| `0g` | 0G deposit to the Payment Layer | `pricing` | **neuron** (1e18 neuron = 1 0G) |

- **New accounts** created by signing up at [pc.0g.ai](https://pc.0g.ai) start in `usd`. Accounts created any other way start in `0g`, and existing accounts keep their mode.
- **Switching** is instant and reversible, and it moves no money: each currency keeps its own balance, and only the current mode's balance is spent. Money in the other balance stays there until you switch back.
- Switching requires a signed-in wallet session (the one [pc.0g.ai](https://pc.0g.ai) uses). API keys — `sk-` and `mk-` — cannot change the mode. The session endpoint is `POST /v1/account/settlement-mode`, with body `{"mode": "usd"}` or `{"mode": "0g"}`; it returns the new mode:

```json
{"settlement_mode": "usd", "currency": "usd"}
```

Every balance, usage, and per-request cost response carries a `currency` field (`"usd"` or `"0g"`) that tells you which unit its amounts are in.

:::caution Not every model is billable in both currencies
A model is billable in USD only if it publishes a `pricing_usd` price for the endpoint you call. If it doesn't, a USD account gets `501 usd_not_supported` (`"model not available in USD mode"`). The reverse — a model that is priced only in USD, called from a 0G account — returns `501 og_not_supported`. Pick another model or switch modes.
:::

## Fund a USD Account

Top up with a card from the **[pc.0g.ai](https://pc.0g.ai) dashboard**. 0G deposits do not fund a USD balance.

## Fund a 0G Account

You deposit to the **0G Payment Layer** — a shared balance contract used across all 0G products, not just the Router. Deposit once, and any 0G product you use (Router included) draws from the same pool.

The easiest way is **[pc.0g.ai](https://pc.0g.ai) → Dashboard → Deposit**. It's a normal on-chain transaction signed by your wallet; funds are usable within a few seconds of confirmation.

Payment Layer contract addresses:

| Network | Address |
|---|---|
| Mainnet | `0xA3b15Bd2aD18BFB6b5f92D8AA9F444Dd59d1cE32` |
| Testnet | `0x0AD9690e0b34aB2d493DE02cDF149ee34f6C9939` |

## How Costs Are Calculated

```text
total_cost = (input_tokens × prompt_price) + (output_tokens × completion_price)
```

- Prices are declared per model, per token: `pricing` in **neuron per token** (1e18 neuron = 1 0G) for 0G accounts, `pricing_usd` in **USD per token** for USD accounts (`"0.00001"` = $10 per million tokens)
- `input_tokens` includes the full conversation context you send (system prompt + prior messages + current user message)
- Image and audio endpoints price per request or per second depending on the model — see the catalog

Get current prices from [`GET /v1/models`](../models) or the model card on [pc.0g.ai](https://pc.0g.ai). The Router does not add markup — what the provider charges is what you pay.

### Prompt caching

On models whose providers support prompt caching, input tokens are split into three disjoint groups, each priced separately:

| Input tokens | Price field | Relative to `prompt` |
|---|---|---|
| Read from the cache | `cached_prompt` | Lower |
| Written to the cache | `cache_write` | Higher |
| Written to the cache with a 1-hour lifetime (`/v1/messages`) | `cache_write_1h` | Higher |
| Everything else | `prompt` | — |

A field appears only when it applies. If it is absent, those tokens bill at the plain `prompt` price (a 1-hour write without its own price bills at `cache_write`).

- `cache_write` and `cache_write_1h` are listed per model in [`GET /v1/models`](../models), in both `pricing` and `pricing_usd`.
- `cached_prompt` can differ between providers of the same model, so it is listed per provider in `GET /v1/providers`.
- [Usage history](#check-your-usage) reports `cached_tokens` (cache reads), `cache_write_tokens`, and `cache_write_1h_tokens` for each request. They are already included in `input_tokens` — don't add them on top.

## Minimum Balance Per Request

A request is accepted only if your spendable balance covers a small floor — currently **0.01 0G** for 0G accounts (counting what the Router can draw from your Payment Layer deposit) and **$0.001** for USD accounts. Below it, inference requests return `402` (`insufficient_balance` for 0G accounts). The floor only decides admission; the amount charged is the request's actual cost.

## Check Your Balance

`/v1/account/*` endpoints require a **management key** with the `account:read` scope (see [Authentication](../authentication)) — `sk-` keys return `403 insufficient_scope`.

```bash
curl https://router-api.0g.ai/v1/account/balance \
  -H "Authorization: Bearer mk-YOUR_MANAGEMENT_KEY"
```

```json
{
  "address": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  "currency": "0g",
  "deposit_balance": "2000000000000000000",
  "credit_balance": "0",
  "pending_charge": "0",
  "total_balance":   "2000000000000000000",
  "balance":         "2000000000000000000"
}
```

Values are in the unit named by `currency`: **neuron** for `"0g"`, **micro-USD** for `"usd"`. `total_balance` is what is available to spend right now.

For a 0G account, `total_balance` may lag your Payment Layer balance slightly because the Router pulls from the Payment Layer in batches (see below). When `total_balance` hits zero and the Payment Layer is also empty, the next inference request returns `402 insufficient_balance`.

For a USD account, the Payment Layer plays no part: don't add a Payment Layer balance on top of this response.

## Check Your Usage

Aggregate stats:

```bash
curl "https://router-api.0g.ai/v1/account/usage/stats?start_date=2026-04-01" \
  -H "Authorization: Bearer mk-YOUR_MANAGEMENT_KEY"
```

Returns total requests, total tokens (prompt/completion split), and total cost for the window.

Per-request history:

```bash
curl "https://router-api.0g.ai/v1/account/usage/history?limit=20&offset=0" \
  -H "Authorization: Bearer mk-YOUR_MANAGEMENT_KEY"
```

Returns a paginated list of individual requests with model, provider address, token counts (including the cache counts above), and cost. Both endpoints also accept `api_key_id`, `source`, `start_date`, and `end_date` filters.

Usage figures cover your account's **current** currency only, and the response's `currency` field names it. After switching modes, usage from the other currency is not mixed in.

## Related

- [**Authentication**](../authentication) — how to create, rotate, and revoke the API keys billed against this balance
- [**Rate Limits**](../rate-limits)
- [**Errors**](../errors) — especially `402 insufficient_balance`

---

## How funds reach the Router (0G accounts, advanced)

You don't need to know this to use the Router, but if you're curious about the on-chain flow:

1. You deposit to the **Payment Layer** contract. The deposit belongs to your wallet address.
2. The Router runs a background **PaymentWorker** that watches for users whose Router-side balance is below a threshold and who have an active usage pattern. For those users, the worker asks the Payment Layer to release a small tranche of your balance into the Router's internal payment contract.
3. The Router then debits that internal contract as you consume tokens, and periodically settles the consumed amount to individual providers on-chain.

This two-step design (Payment Layer → Router) means the Payment Layer balance is shared across all 0G products, and the Router only holds what it needs for your near-term usage. From your side, the only thing you interact with is the Payment Layer deposit — everything else is automatic.
