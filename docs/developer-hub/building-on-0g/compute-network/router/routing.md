---
id: routing
title: Provider Routing
sidebar_position: 5
description: "Control which provider serves your request — by latency, price, or specific on-chain address."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Provider Routing

By default, the Router distributes requests across healthy providers using round-robin with automatic failover. The `provider` field lets you override this when you need specific behavior.

## Default Behavior

If you send no `provider` field, the Router:

1. Picks a healthy provider for the requested model
2. Retries on the next healthy provider if the first returns an error
3. Returns the response — or a `503` if every provider failed

This is the recommended path for most applications.

## Routing Strategies

<Tabs>
<TabItem value="latency" label="Lowest Latency" default>

```json
{
  "model": "zai-org/GLM-5-FP8",
  "messages": [{"role": "user", "content": "Hello"}],
  "provider": {
    "sort": "latency"
  }
}
```

Routes to the provider with the lowest recently-observed latency for this model.

</TabItem>
<TabItem value="price" label="Lowest Price">

```json
{
  "model": "zai-org/GLM-5-FP8",
  "messages": [{"role": "user", "content": "Hello"}],
  "provider": {
    "sort": "price"
  }
}
```

Routes to the cheapest provider currently serving this model.

</TabItem>
<TabItem value="address" label="Pin a Specific Provider">

```json
{
  "model": "zai-org/GLM-5-FP8",
  "messages": [{"role": "user", "content": "Hello"}],
  "provider": {
    "address": "0xd9966e..."
  }
}
```

Routes directly to a specific provider by on-chain address. **Fallback is disabled by default when pinning** — if the pinned provider fails, the request fails. Set `allow_fallbacks: true` to re-enable cross-provider retry.

</TabItem>
</Tabs>

## `provider` Field Reference

| Field              | Type    | Description                                                                                     |
| ------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| `sort`             | string  | `"latency"` or `"price"`. Ignored if `address` is set.                                          |
| `address`          | string  | Provider's on-chain address for direct routing.                                                 |
| `allow_fallbacks`  | boolean | Allow retrying other providers on failure. Default: `true` normally, `false` when `address` is set. |

## Discovering Provider Addresses

List the providers serving a model with `GET /v1/providers?model_id=…` — see [Models](./models#listing-providers-for-a-model).

## Related

- [**Principles**](./principles) — why failover is the default
- [**Errors**](./errors) — what `502` and `503` mean for routing
