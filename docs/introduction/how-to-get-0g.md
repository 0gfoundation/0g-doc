---
id: how-to-get-0g
title: How to Get 0G Token
sidebar_position: 3
description: "Learn how to buy, bridge, and swap 0G tokens through exchanges, cross-chain bridges, and 0G Hub. Includes wallet setup and supported trading pairs."
---

# How to Get 0G Token

:::tip Interactive Guide
Prefer a guided path? **[get.0g.ai](https://get.0g.ai)** is the official interactive guide to acquiring $0G — pick your starting point (fiat, another chain, an exchange, DeFi, or a wallet) and it walks you through step by step.
:::

:::info Network Details
- **Token**: Native gas token (EVM-compatible)
- **Chain ID**: 16661
- **Explorer**: [https://chainscan.0g.ai](https://chainscan.0g.ai)
- **Mainnet Launch**: September 2025
:::

## Centralized Exchanges

The most straightforward way to acquire $0G is through centralized exchanges. After purchasing, withdraw directly to the **0G Mainnet** (select "0G Chain" or "0G Mainnet" as the withdrawal network). All exchanges below support withdrawals to the native 0G network — always confirm the withdrawal network in-app before transferring, as availability can be paused during network upgrades.

### Spot Trading

| Exchange | Trading Pairs |
|----------|---------------|
| **[Binance](https://www.binance.com/en/trade/0G_USDT)** | 0G/USDT, 0G/USDC, 0G/TRY |
| **[HTX](https://www.htx.com/trade/0g_usdt)** | 0G/USDT |
| **[Bybit](https://www.bybit.com/en/trade/spot/0G/USDT)** | 0G/USDT |
| **[MEXC](https://www.mexc.com/exchange/0G_USDT)** | 0G/USDT, 0G/USDC |
| **[KuCoin](https://www.kucoin.com/trade/0G-USDT)** | 0G/USDT |
| **[Gate.io](https://www.gate.io/trade/0G_USDT)** | 0G/USDT |
| **[Bitget](https://www.bitget.com/spot/0GUSDT)** | 0G/USDT |
| **[HashKey Exchange](https://global.hashkey.com/en-US/spot/0G_USDT)** | 0G/USDT |
| **[LBank](https://www.lbank.com/trade/0g_usdt)** | 0G/USDT, 0G/USDC |
| **[Upbit](https://upbit.com/exchange?code=CRIX.UPBIT.KRW-0G)** | 0G/KRW, 0G/BTC, 0G/USDT |
| **[Kraken](https://www.kraken.com/prices/0g)** | 0G/USD, 0G/EUR |
| **[Bithumb](https://www.bithumb.com/react/trade/order/0G-KRW)** | 0G/KRW |

## Buy on Fomo

**[Fomo](https://fomo.family)** is a social trading app (mobile and web) for buying crypto in seconds — multichain, gasless, with Apple Pay support.

- **URL**: [$0G on Fomo](https://fomo.family/coin?address=0x4b948d64de1f71fcd12fb586f4c776421a35b3ee&chainId=56&r=vargs_g&source=share_link)
- **Network**: BNB Chain (trades the bridged $0G token)
- **Features**: Gasless trading, Apple Pay funding, social feeds and top-trader alerts

To move your $0G from BNB Chain to the native 0G network, bridge with [Stargate](https://stargate.finance).

## Bridge to 0G Chain

**[XSwap](https://xswap.link/)** is the official bridge for the 0G network, powered by [Chainlink CCIP](https://docs.chain.link/ccip/directory/mainnet/chain/0g-mainnet).

### XSwap Bridge

- **URL**: [https://xswap.link/bridge?toChain=16661](https://xswap.link/bridge?toChain=16661)
- **Supported Assets**: USDC and other tokens
- **Networks**: Ethereum ↔ 0G (with more chains coming)
- **Security**: Powered by [Chainlink CCIP](https://docs.chain.link/ccip/directory/mainnet/chain/0g-mainnet) with enterprise-grade security

**How to Bridge:**

1. Visit [xswap.link/bridge?toChain=16661](https://xswap.link/bridge?toChain=16661)
2. Connect your wallet (MetaMask, SafePal, etc.)
3. Select source chain (e.g., Ethereum) and 0G as destination
4. Choose asset to bridge (e.g., USDC)
5. Confirm transaction and wait for bridging to complete
6. Once bridged, swap your assets to $0G on the 0G Hub

### Khalani TokenFlight (Cross-Chain Swap on 0G Hub)

- **URL**: [https://hub.0g.ai/khalani/transfer](https://hub.0g.ai/khalani/transfer)
- **Networks**: 20 chains — including Ethereum, BNB Chain, Arbitrum, Base, Solana, Monad, Bitcoin and Tron
- **How it works**: Intent-based routing with atomic settlement. Select a source chain and token; TokenFlight finds the best route and delivers on 0G.

### More Bridges & Aggregators

| Bridge | Route to 0G | Notes |
|--------|-------------|-------|
| **[Jumper](https://jumper.exchange)** | 60+ chains | LI.FI aggregator; includes a gas-refuel option |
| **[Interport](https://interport.fi)** | 10+ chains incl. Solana & Monad | Gas Transfer feature delivers native 0G for fees |
| **[Stargate](https://stargate.finance)** | Ethereum & BNB Chain | Bridges $0G, plus WBTC / WETH / cbBTC to 0G |
| **[Wormhole Portal](https://portalbridge.com)** | Solana and 15+ chains | Wrapped-asset token bridge |
| **[0G Hub Bridge](https://hub.0g.ai/bridge)** | Ethereum ↔ 0G | Moves W0G (wrapped 0G) |
| **[Gas.zip](https://www.gas.zip)** | Gas refuel only | Tops up a small amount of native 0G for transaction fees |

:::note For developers
[LI.FI](https://li.fi/) — the bridge & swap aggregation engine behind Jumper — supports 0G Mainnet directly (chain key `zerog`, chain ID `16661`). Use the [LI.FI API](https://docs.li.fi/) or [SDK](https://docs.li.fi/sdk/overview) to quote and execute cross-chain swaps into 0G programmatically, e.g. `GET https://li.quest/v1/quote?toChain=16661&...`.
:::

## Swap on 0G Chain

Once you have assets on the 0G network, swap them for native $0G tokens.

### 0G Hub (Recommended)

- **URL**: [https://hub.0g.ai/swap](https://hub.0g.ai/swap)
- **Features**: Official swap interface for the 0G ecosystem
- **Powered by**: [Jaine](https://jaine.app/)
- **Available Pairs**: Multiple trading pairs including ETH, USDT, USDC

The 0G Hub provides seamless token swapping, portfolio tracking, and access to the entire 0G ecosystem.

## Wallet Setup

To receive and hold $0G, you need a wallet that supports the 0G network.

### Supported Wallets

Every wallet below detects the native $0G token automatically once the 0G network is added. "Bridged tokens" refers to W0G, USDC.e, WETH and WBTC on the 0G network.

| Wallet | Add 0G Network | Token Detection |
|--------|----------------|-----------------|
| **[MetaMask](https://metamask.io/)** | Add manually — see [Mainnet Overview](/developer-hub/mainnet/mainnet-overview) | $0G |
| **[Rabby](https://rabby.io/)** | Built-in | $0G and bridged tokens, with USD values |
| **[OKX Wallet](https://www.okx.com/web3)** | Built-in | $0G (USD value) and bridged tokens |
| **[Bitget Wallet](https://web3.bitget.com/)** | Built-in | $0G (USD value) and bridged tokens |
| **[Zerion](https://zerion.io/)** | Built-in | $0G (USD value) and most bridged tokens |
| **[Coinbase Wallet](https://www.coinbase.com/wallet)** | Add manually | $0G |
| **[SafePal](https://www.safepal.com/)** | In-app network directory (App v3.9.0+) | $0G (USD value) and bridged tokens |
| **[Trust Wallet](https://trustwallet.com/)** | Add manually | $0G |
| **[TokenPocket](https://www.tokenpocket.pro/)** | In-app network directory | $0G |
| **[Rainbow](https://rainbow.me/)** | Add manually | $0G |
| **[Safe](https://safe.global/)** (multisig for teams & treasuries) | Built-in | — |
| **[Fordefi](https://fordefi.com/)** (institutional MPC) | Built-in | — |
| **[Ledger](https://www.ledger.com/)** (hardware wallet) | Built-in | — |

### Adding 0G Network

For detailed instructions on adding the 0G network to your wallet, including RPC endpoints and network configuration, visit the [Mainnet Overview](/developer-hub/mainnet/mainnet-overview) page.

---

For more information about the 0G network and its features, see [Understanding 0G](/introduction/understanding-0g). For a step-by-step path tailored to where you're starting from, use the interactive guide at [get.0g.ai](https://get.0g.ai).
