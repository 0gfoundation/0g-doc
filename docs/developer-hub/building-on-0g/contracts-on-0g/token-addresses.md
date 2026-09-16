---
id: token-addresses
title: 0G Token Addresses
description: "Official contract addresses for the 0G token: W0G on 0G Mainnet, W0G bridged with Chainlink CCIP on Ethereum, Base, Solana and Robinhood Chain, and the bridged 0G token on Ethereum and BNB Chain."
keywords: [0G token, W0G, wrapped 0G, contract address, CCIP, Ethereum, Base, Solana, Robinhood Chain, BNB Chain]
---

# 0G Token Addresses

On **0G Mainnet** the 0G token is the native gas token, like ETH on Ethereum: it has no contract address of its own. Every official contract representation of the token, on 0G and on other chains, is listed on this page.

## W0G on 0G Mainnet

Wrapped 0G (W0G) is the ERC-20 form of the native token on 0G Mainnet, backed by the [WrappedOGBase precompile](./precompiles/precompiles-wrappedogbase).

| Network | Chain ID | Token | Address | Decimals |
|---------|----------|-------|---------|----------|
| 0G Mainnet | 16661 | W0G (Wrapped 0G) | [`0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c`](https://chainscan.0g.ai/address/0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c) | 18 |

## W0G on other chains (Chainlink CCIP)

W0G is also issued on the chains below and moves between them with [Chainlink CCIP](https://docs.chain.link/ccip/directory/mainnet). The Ethereum and Base tokens are registered in CCIP's TokenAdminRegistry with their own token pools.

| Network | Chain ID | Token | Address | Decimals |
|---------|----------|-------|---------|----------|
| Ethereum | 1 | W0G (Wrapped 0G) | [`0x4C1Dab3Be86347977F3DfC4b9688224ef2272939`](https://etherscan.io/token/0x4C1Dab3Be86347977F3DfC4b9688224ef2272939) | 18 |
| Base | 8453 | W0G (Wrapped 0G) | [`0x23cd099eB438CcA50349EE2BC809196b1ae00861`](https://basescan.org/token/0x23cd099eB438CcA50349EE2BC809196b1ae00861) | 18 |
| Solana | mainnet-beta | W0G (Wrapped 0G), SPL mint | [`gNyJyS9pQt33o4y4L3gdWZAF2XHgPrCBRQuaiCZStMe`](https://solscan.io/token/gNyJyS9pQt33o4y4L3gdWZAF2XHgPrCBRQuaiCZStMe) | 9 |
| Robinhood Chain | 4663 | W0G (Wrapped 0G) | [`0x32003CC8357938bCF615c1222a349c58f2B30698`](https://robinscan.io/address/0x32003CC8357938bCF615c1222a349c58f2B30698) | 18 |

:::caution Solana uses 9 decimals
The Solana mint has 9 decimals; every EVM deployment has 18. Convert amounts when moving between them.
:::

## Bridged 0G on Ethereum and BNB Chain (LayerZero)

The earlier bridged representation is a LayerZero OFT named `0G`. It deliberately has the **same address on Ethereum and BNB Chain** and moves to and from the 0G network through [Stargate](https://stargate.finance).

| Network | Chain ID | Token | Address | Decimals |
|---------|----------|-------|---------|----------|
| Ethereum | 1 | 0G (bridged, LayerZero OFT) | [`0x4B948d64dE1F71fCd12fB586f4c776421a35b3eE`](https://etherscan.io/token/0x4B948d64dE1F71fCd12fB586f4c776421a35b3eE) | 18 |
| BNB Chain | 56 | 0G (bridged, LayerZero OFT) | [`0x4B948d64dE1F71fCd12fB586f4c776421a35b3eE`](https://bscscan.com/token/0x4B948d64dE1F71fCd12fB586f4c776421a35b3eE) | 18 |

`0G` (LayerZero) and `W0G` (CCIP) are different contracts on Ethereum. Check which one a venue or bridge expects before sending funds.

## Related links

- [WrappedOGBase precompile](./precompiles/precompiles-wrappedogbase): how W0G is minted and burned on 0G Mainnet
- [How to Get 0G](/introduction/how-to-get-0g): buying, bridging and swapping the token
- [Chainlink CCIP directory](https://docs.chain.link/ccip/directory/mainnet): cross-chain token and lane details for W0G
- [Stargate](https://stargate.finance): bridge for the LayerZero 0G token
- [0G Hub bridge](https://hub.0g.ai/bridge): moving W0G between Ethereum and 0G
