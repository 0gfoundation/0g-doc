---
id: principles
title: Principles
sidebar_position: 3
description: "The design choices behind the Router — API compatibility, on-chain settlement, failover, and verifiable execution."
---

# Principles

The Router exists to make 0G's decentralized compute network usable with the same code you already have. Four design choices shape how it works.

## 1. Drop-in Compatibility

The Router speaks the **OpenAI API** (`/v1/chat/completions`, `/v1/images/generations`, `/v1/audio/transcriptions`, …). Same routes, same fields, same SSE format.

Any SDK, agent framework, or tool that targets these APIs works without code changes — point it at `https://router-api.0g.ai/v1` and supply your Router API key.

The goal is zero switching cost. If we add a feature that OpenAI doesn't have (like provider pinning), it lives in an optional top-level field that is stripped before the request reaches the underlying provider. Your existing requests keep working.

## 2. On-Chain Billing, No Subscriptions

There is no monthly plan. You deposit 0G tokens to a payment contract, and each request debits the exact cost based on per-model token prices. Remaining balance is always visible on-chain.

```
total_cost = (input_tokens × prompt_price) + (output_tokens × completion_price)
```

Settlement to individual providers happens periodically in the background — you only see a single unified balance. Details: [Deposits & Billing](./account/deposits).

## 3. Failover by Default

Each model is served by one or more independent providers. The Router health-checks them continuously and distributes requests round-robin across the healthy set. If a request fails, the Router retries on the next healthy provider before returning an error to you.

You can override this — [Provider Routing](./routing) lets you sort by `latency` / `price` or pin to a specific provider address — but the default is "just work."

## 4. Verifiable Execution

Every provider on the network runs inside a **Trusted Execution Environment (TEE)** and attests to the exact model it's serving. The Router exposes provider addresses and attestation metadata so you can verify, out-of-band, that your request was handled by a model you trust.

This is the reason to use 0G over a centralized endpoint: you get OpenAI-style ergonomics **and** cryptographic proof that the model wasn't silently swapped.

## What the Router Does Not Do

- **No prompt storage.** The Router does not persist request or response bodies. Only billing metadata (token counts, model, provider, timestamp) is stored.
- **Provider isolation via TEE.** Every provider runs inside a Trusted Execution Environment, which isolates the serving process so it cannot access inference traffic outside the attested request/response path.
- **No synthetic responses.** The Router never generates content itself. If no provider can serve the request, you get a `503` — not a fallback LLM.
