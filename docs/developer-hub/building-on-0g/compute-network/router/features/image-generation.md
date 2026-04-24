---
id: image-generation
title: Image Generation
sidebar_position: 3
description: "Generate images on 0G Compute via synchronous (OpenAI-compatible) or asynchronous submit-and-poll endpoints."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Image Generation

The Router exposes two paths for image generation:

- **Synchronous** — drop-in OpenAI-compatible endpoint (`POST /v1/images/generations`). Returns the image in the same request. Best when you're using the OpenAI SDK directly or have short/fast models.
- **Asynchronous (recommended for production)** — submit a job and poll (`POST /v1/async/images/generations` + `GET /v1/async/jobs/{jobId}`). Avoids long-held HTTP connections. Best for slow models, batch workloads, serverless, or browser reliability.

Both paths accept the same request shape and produce the same final output.

:::caution `response_format: "b64_json"` is currently required
Always send `"response_format": "b64_json"`. Base64 is the only format supported end-to-end right now; URL-based responses will be enabled in a future release. This applies to **both** sync and async paths.
:::

## Synchronous — OpenAI-compatible

**`POST /v1/images/generations`**

Fully compatible with the [OpenAI Images API](https://platform.openai.com/docs/api-reference/images/create) — any OpenAI client library works unchanged once you switch the base URL.

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
curl https://router-api.0g.ai/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "z-image",
    "prompt": "A serene mountain landscape at sunset",
    "n": 1,
    "size": "1024x1024",
    "response_format": "b64_json"
  }'
```

</TabItem>
<TabItem value="python" label="Python (OpenAI SDK)">

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://router-api.0g.ai/v1",
    api_key="sk-YOUR_API_KEY",
)

result = client.images.generate(
    model="z-image",
    prompt="A serene mountain landscape at sunset",
    n=1,
    size="1024x1024",
    response_format="b64_json",
)

print(result.data[0].b64_json[:80], "...")
```

</TabItem>
</Tabs>

Returns the standard OpenAI image response: a `data` array with `b64_json` entries. Decode on the client to render.

### Request fields

| Field             | Required | Description                                                    |
| ----------------- | -------- | -------------------------------------------------------------- |
| `model`           | ✓        | Image model ID from [`/v1/models`](../models)                 |
| `prompt`          | ✓        | Text description of the desired image                          |
| `response_format` | ✓        | Must be `"b64_json"` today; `"url"` support is planned         |
| `n`               |          | Number of images to generate                                   |
| `size`            |          | e.g. `"1024x1024"` — check the model for supported sizes       |

## Asynchronous (recommended for production)

Image generation can take tens of seconds. Holding an HTTP connection open that long is fragile — short-timeout clients, browsers, and serverless functions will drop it. The async path solves this: submit once, poll until ready.

### 1. Submit a job

**`POST /v1/async/images/generations`** — same body as the synchronous endpoint.

```bash
curl https://router-api.0g.ai/v1/async/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "z-image",
    "prompt": "A serene mountain landscape at sunset",
    "n": 1,
    "size": "1024x1024",
    "response_format": "b64_json"
  }'
```

The Router responds immediately with a job handle:

```json
{
  "jobId": "5b595c31955d4be2923f5070705cced4",
  "status": "pending",
  "provider_address": "0xE29a72..."
}
```

`provider_address` identifies which provider is handling your job. You'll pass it back when polling — async jobs are pinned to their provider.

### 2. Poll for the result

**`GET /v1/async/jobs/{jobId}?provider_address={addr}`**

```bash
curl "https://router-api.0g.ai/v1/async/jobs/5b595c31955d4be2923f5070705cced4?provider_address=0xE29a72..." \
  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

While the job is running, `status` is `"pending"` (or `"running"`). When finished, `status: "completed"` appears with the result payload and an injected `x_0g_trace`:

```json
{
  "status": "completed",
  "createdAt": "2026-04-24T09:44:57.804Z",
  "data": {
    "created": 1777023898,
    "data": [
      { "b64_json": "iVBORw0KGgoAAAANSUhEUg..." }
    ]
  },
  "x_0g_trace": { "request_id": "...", "provider": "0x...", "billing": { "input_cost": "...", "output_cost": "...", "total_cost": "..." } }
}
```

The image array lives at `data.data[]` — the outer `data` is a wrapper object the provider returns around the OpenAI-style result, not the OpenAI array itself.

:::tip Use the `Retry-After` header for polling cadence
Both submit and poll responses forward a `Retry-After` header (in seconds) when the provider sends one — use that value to decide when to poll again, since it reflects the provider's current queue. Fall back to a fixed 2–3 second interval only if the header is missing.
:::

## 0G Router Extensions

The same optional top-level fields as chat completions, stripped before forwarding to the provider (applies to both sync and async paths):

| Field        | Type    | Description                                                                          |
| ------------ | ------- | ------------------------------------------------------------------------------------ |
| `provider`   | object  | Control provider routing — see [Routing](../routing)                                 |
| `verify_tee` | boolean | Ask the Router to synchronously verify the provider's TEE signature — see [Verifiable Execution](./verifiable-execution) |

## Billing

Image generation is charged per image at rates declared by the model (see `pricing.image` in the [catalog](../models)). Billing is tied to the provider's execution, not to your client holding the connection:

- **Submission starts the clock.** Once the provider accepts the job, generation begins.
- **Abandoning a poll does not cancel the job.** If you close the HTTP connection, stop polling, or kill your process after submitting, the provider still runs the job to completion and you are still billed.

## Related

- [**Models**](../models) — browse available image models and sizes
- [**Routing**](../routing)
- [**Verifiable Execution**](./verifiable-execution)
