---
id: zerion-api
title: Zerion API
sidebar_position: 2
description: "Access token balances, DeFi positions, and transaction history on 0G Chain with Zerion API — a wallet data API covering 60+ EVM chains and Solana."
---

# Zerion API

Zerion API is an enterprise-grade wallet data API that provides token balances, DeFi positions, NFTs, and transaction history on 0G and 60+ other chains including all major EVM networks and Solana.

Built on the same infrastructure that powers the [Zerion Wallet](https://zerion.io) app used by over a million users, the API delivers real-time, normalized data across all supported chains through a single integration.

## Why Zerion API?

- **Unified Multi-Chain Data**: Query wallet data across 0G and 60+ other chains with a single API — no per-chain logic required.
- **Real-Time Updates**: Portfolio balances, DeFi positions, and transaction feeds are updated in real time.
- **Human-Readable Transactions**: Transaction history is decoded and enriched, returning actions like "Swapped 1 ETH for 3,000 USDC" instead of raw calldata.
- **Production-Proven**: The same infrastructure behind the Zerion app, serving millions of requests daily.

---

## API Products

### Wallet Portfolios

Get aggregated token balances and portfolio values for any wallet address on 0G.

- **Token Balances**: Positions with real-time prices and USD values.
- **Portfolio Totals**: Aggregated value across all chains or filtered to 0G.
- **Historical Charts**: Portfolio value over time for analytics and dashboards.

**Typical Use Cases**: Portfolio trackers, wallet UIs, accounting tools, or any app displaying user balances.

### DeFi Positions

Fetch decoded DeFi positions across lending, staking, and liquidity protocols on 0G.

- **Protocol Positions**: LP positions, staking, lending, and borrowing decoded into a normalized format.
- **Underlying Assets**: See the tokens inside complex positions (e.g., both sides of an LP).
- **Protocol Attribution**: Each position is attributed to its protocol with metadata.

**Typical Use Cases**: DeFi dashboards, yield aggregators, risk monitoring, or portfolio management apps.

### Transaction History

Access full decoded transaction history for any wallet on 0G.

- **Enriched Actions**: Transactions decoded into human-readable actions (trades, transfers, approvals, mints).
- **Filterable**: Filter by action type, asset, or time range.
- **Cross-Chain**: Same format across 0G and all other supported chains.

**Typical Use Cases**: Activity feeds, accounting exports, compliance tools, or analytics dashboards.

---

## Getting Started

1. Get your API key at [zerion.io/api](https://zerion.io/api).
2. Explore the [API documentation](https://developers.zerion.io) for endpoints, parameters, and response formats.
3. Start querying wallet data on 0G — no additional chain configuration needed.
