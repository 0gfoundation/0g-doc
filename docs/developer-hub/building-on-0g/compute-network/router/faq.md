---
id: faq
title: FAQ
sidebar_position: 12
description: "Frequently asked questions about the 0G Compute Router."
---

# FAQ

## I deposited on compute-marketplace.0g.ai but don't see my balance on pc.0g.ai — where did my 0G go?

Nowhere. Those funds live in **per-provider sub-accounts** under the [Direct](../direct) flow, and pc.0g.ai defaults to showing the **Router** balance, which is a different on-chain pool.

Click the **Advanced** toggle in the top-right of pc.0g.ai. Advanced mode is the same Direct flow you've been using, just embedded in the new UI — your sub-account balances appear there.

See [Router vs Advanced Mode](./comparison#pc0gai-router-vs-advanced-mode) for a side-by-side breakdown of the two systems.

## Do I need a wallet to use the Router?

Yes. The Router bills on-chain, so you need a wallet to deposit 0G tokens and create API keys. [pc.0g.ai](https://pc.0g.ai) supports MetaMask and WalletConnect for direct wallet connect, plus social sign-in via Privy (Google, X/Twitter, Discord, TikTok) which provisions an embedded wallet for you.

Once you have an API key, your application code doesn't touch the wallet again — it just sends `Authorization: Bearer sk-…`.

## What is TEE and why does it matter?

A **Trusted Execution Environment** is a hardware-isolated region where code runs with cryptographic attestation of exactly what was executed. Every provider on the 0G Compute Network runs inside a TEE and attests to the model they serve.

This is what makes "decentralized inference" meaningful: you can verify, out-of-band, that the model you asked for is the model that ran — not a silently-swapped cheaper model.

## What token do I pay in?

**0G tokens**, native to the 0G chain. Deposit once to the Router payment contract; the Router handles conversions and provider payouts.

## Is the Router really OpenAI-compatible?

Yes. Any OpenAI client library — `openai-python`, `openai-node`, LangChain, LlamaIndex, Vercel AI SDK, etc. — works by changing `base_url` to `https://router-api.0g.ai/v1` and `api_key` to your Router key.

## How is pricing set?

Each provider declares prices per model (input tokens, output tokens). The Router publishes these in `/v1/models`. When you route with `sort: "price"`, the cheapest provider wins; otherwise failover picks a healthy provider regardless of price.

There is no Router markup on top of provider prices — what you see in the catalog is what you pay.

## What happens if no providers are available?

If every provider for your chosen model is unhealthy, you get `503 no_providers_available`. The Router does **not** fall back to a different model — picking a model is your decision. Choose a different model yourself, or wait and retry.

## Does the Router store my prompts?

No. The Router persists only billing metadata (token counts, model, provider, timestamp). Request and response bodies are not stored. If you need content audit logs, log them yourself on the caller side.

## Can I run my own provider?

Yes. See the [Inference Provider Setup](../inference-provider) guide. Once you're registered and healthy, the Router will start routing traffic to you alongside existing providers.

## Where do I get help?

- [**Discord**](https://discord.gg/0glabs) — the `#compute` channel
- [**GitHub Issues**](https://github.com/0gfoundation) for bug reports
