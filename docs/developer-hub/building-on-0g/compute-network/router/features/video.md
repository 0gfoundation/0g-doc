---
id: video
title: Video Generation
sidebar_position: 4
description: "Generate video clips on 0G Compute: submit a job, poll its status, and download the MP4 through the OpenAI Video API-shaped /v1/videos endpoints."
---

# Video Generation

Video generation is asynchronous. You submit a job, poll it until it finishes, then download the clip. The endpoints follow the [OpenAI Video API](https://developers.openai.com/api/reference/resources/videos) shape, but the models behind them are not OpenAI's: where a model's own limits differ, the model's limits win.

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/v1/videos` | `POST` | Submit a video job |
| `/v1/videos/{id}` | `GET` | Poll a job's status. The poll that sees the job completed also settles the charge |
| `/v1/videos/{id}/content` | `GET` | Download the finished clip (`video/mp4`) |
| `/v1/videos` | `GET` | List your recent video jobs, for example to recover a lost id |

Video models have the `video-generation` service type. Find them, with their duration range, resolution tiers and prices, in [`/v1/models`](../models).

## 1. Submit a job

**`POST /v1/videos`**

```bash
curl https://router-api.0g.ai/v1/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "bytedance/seedance-2.0",
    "prompt": "A paper boat drifting across a calm pond at sunrise",
    "seconds": 4,
    "size": "480p"
  }'
```

The Router responds as soon as the provider accepts the job:

```json
{
  "id": "zg_00000000e585ac23f1689fd3073c6ceceb21b0a0_E9RD9DF6oHVg6BEMIBSQj4Dl9SEWNDVt",
  "object": "video",
  "status": "queued",
  "progress": 0,
  "created_at": 1791902122,
  "provider_address": "0x00000000e585ac23f1689fd3073c6ceceb21b0a0"
}
```

Use `id` for every later call. It already identifies the provider that owns the job, so you don't need to pass anything else. Store it as text (up to 80 characters) and send it back exactly as returned.

### Request fields

| Field | Required | Description |
| --- | --- | --- |
| `model` | ✓ | Video model ID from [`/v1/models`](../models) |
| `prompt` | ✓ | Text description of the clip |
| `seconds` | ✓ | Clip length in seconds. Required here, unlike in the OpenAI Video API. Must be a positive number no greater than 3600. Fractions are rounded up |
| `size` | | Resolution tier, e.g. `"480p"`. Leave it out to use the model's default. See [Size and duration](#size-and-duration) |
| `input_reference` | | Reference image for image-to-video. Send it as a file part of a `multipart/form-data` request |
| `metadata` | | **[beta]** Model-specific controls and reference media. See [Model-specific controls](#model-specific-controls) |

The body can be `application/json` or `multipart/form-data`. For **image-to-video**, send the same fields as form values plus the image as the `input_reference` file part.

Video submits accept the same `X-0G-Provider-*` routing headers as other inference endpoints. See [Routing](../routing).

### Size and duration

- **`size` selects a resolution tier, not exact output dimensions.** The tiers a model serves are listed in `pricing.variants[].dimensions.resolution` in [`/v1/models`](../models). Send one of those names, and read the list from the catalog rather than hard-coding it, because tiers are added over time. Pixel dimensions such as `"1280x720"` are also accepted, but they only pick the **aspect ratio**, and only for text-to-video. The clip still renders at a tier the model serves, so a `1280x720` request to a model that only serves 2K returns a 2K clip at the 2K price. For image-to-video, the aspect ratio follows your reference image.
- **`seconds` is clamped to the model's range, not rejected.** If you ask for less than the minimum you get, and pay for, the minimum. If you ask for more than the maximum you get the maximum. Each model's range is in its `description` in [`/v1/models`](../models).
- The submit response echoes what you **sent**. The poll response reports what was actually **rendered**, so check the poll response to see what you are billed for.

### Model-specific controls

:::note Beta
`metadata` is in beta.
:::

A model whose [`/v1/models`](../models) entry includes `video_capabilities` also accepts the model's own options under `metadata`. These are forwarded to the model unchanged. `video_capabilities` describes them:

- `controls`: each option, with the `path` to send it at (for example `metadata.resolution` or `metadata.ratio`), its type, the allowed values or range, and its default.
- `slots`: reference media the model accepts, such as `first_frame`, `last_frame`, `reference_image`, `reference_video` and `reference_audio`, with how many of each and whether a URL or a base64 `data:` URI is accepted.
- `request_note` and `billing_note`: how to format media references, and how the model bills extra inputs.

Send requests that use `metadata` as JSON, not multipart. They are only routed to providers that support `metadata`. If none is available, you get `400 model_not_capable`. The Router does not drop the fields and run the job without them.

## 2. Poll for status

**`GET /v1/videos/{id}`**

```bash
curl https://router-api.0g.ai/v1/videos/zg_00000000e585ac23f1689fd3073c6ceceb21b0a0_E9RD9DF6oHVg6BEMIBSQj4Dl9SEWNDVt \
  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

`status` moves from `queued` to `in_progress`, and `progress` runs from 0 to 100. A clip can take several minutes, so poll every few seconds. When the job is done, `status` is `completed` and the response includes `x_0g_trace` with the charge:

```json
{
  "id": "zg_00000000e585ac23f1689fd3073c6ceceb21b0a0_E9RD9DF6oHVg6BEMIBSQj4Dl9SEWNDVt",
  "object": "video",
  "status": "completed",
  "progress": 100,
  "seconds": "4",
  "size": "480p",
  "created_at": 1791902122,
  "completed_at": 1791902282,
  "x_0g_trace": {
    "request_id": "async-9681dcad86603121-E9RD9DF6oHVg6BEMIBSQj4Dl9SEWNDVt",
    "provider": "0x00000000e585ac23f1689fd3073c6ceceb21b0a0",
    "billing": {
      "currency": "0g",
      "input_cost": "0",
      "output_cost": "1102486023381046892",
      "total_cost": "1102486023381046892"
    }
  }
}
```

Costs are in neuron when `currency` is `"0g"` (1e18 neuron = 1 0G), and in micro-USD when it is `"usd"`. A `failed` job has no output and is not charged.

## 3. Download the clip

**`GET /v1/videos/{id}/content`**

```bash
curl https://router-api.0g.ai/v1/videos/zg_00000000e585ac23f1689fd3073c6ceceb21b0a0_E9RD9DF6oHVg6BEMIBSQj4Dl9SEWNDVt/content \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -o video.mp4
```

This streams the MP4. If you skip polling, a completed job is charged before the download starts. A job that is still running returns `409 video_not_ready`, so keep polling. A job that failed returns `424 video_job_failed`.

:::caution Download promptly
The provider stores the file, not the Router, and providers delete it after a while (roughly a day to a week, depending on the provider). Each account can run at most 2 downloads at once. Additional ones get `429 too_many_concurrent_requests`.
:::

## List your video jobs

**`GET /v1/videos?limit=20`**

```bash
curl "https://router-api.0g.ai/v1/videos?limit=20" \
  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "zg_00000000e585ac23f1689fd3073c6ceceb21b0a0_E9RD9DF6oHVg6BEMIBSQj4Dl9SEWNDVt",
      "object": "video",
      "model": "bytedance/seedance-2.0",
      "status": "completed",
      "created_at": 1791902122,
      "seconds": "4",
      "size": "480p"
    }
  ],
  "has_more": false
}
```

This returns your own jobs, most recent first. Use it to find a job whose id you lost. `limit` defaults to 20, and larger values are capped at 100. There is no pagination, so only your 100 most recent jobs can be listed.

Each entry is the Router's own record of the job:

- `seconds` and `size` are what you **requested**, which can differ from what was rendered.
- `status` is `in_progress`, `completed` or `failed`. `completed` means the clip was delivered and charged. `in_progress` can include a clip that has finished but has not been polled yet. Poll `GET /v1/videos/{id}` to get the provider's full status and settle the charge.

## Errors

| Status | Code | Meaning |
| --- | --- | --- |
| `400` | `invalid_request` | Missing `model`, `prompt` or `seconds`, or an invalid `seconds` value |
| `400` | `model_not_capable` | The request uses `metadata`, but no available provider supports it |
| `402` | `insufficient_balance` | Your balance does not cover one clip of this length on this model. See [Billing](#billing) |
| `404` | `model_not_found` | Unknown model |
| `404` | `async_job_not_found` | Unknown or expired job id |
| `409` | `video_not_ready` | Download requested before the job completed |
| `423` | `refund_pending` | A refund is in progress for your account |
| `424` | `video_job_failed` | Download requested for a job that failed |
| `429` | `video_jobs_in_flight_limit` | Too many unfinished video jobs on your account. Wait for earlier jobs to finish. The limit is in the error message |
| `501` | `usd_not_supported` / `og_not_supported` | The model can't be billed in your account's currency |
| `503` | `no_available_provider` / `vault_unavailable` | No provider is available right now, or your balance can't be read right now. Retry |

Errors that the model itself raises, such as an option it doesn't support, are passed through with the provider's message. See [Errors](../errors) for the error format.

## Billing

- **You're charged once, when the clip completes.** This happens on the first poll that sees `completed`, or when you download the clip, or automatically if you never come back. Abandoning a job does not cancel it. A failed job is not charged.
- **Price depends on the model.** Each model's `pricing.variants` in [`/v1/models`](../models) gives a price per resolution tier, either per second of output (`unit: "video_second"`) or per token the model reports for the clip (`unit: "video_token"`). Some models charge extra for reference inputs. Their `video_capabilities.billing_note` explains how. `x_0g_trace.billing` on the completed poll shows the exact charge.
- **Balance check at submit.** When you submit, the Router holds enough of your balance to cover the longest clip your request could be billed for. The hold is released when the clip is charged, and the actual charge is usually lower. If your balance can't cover the hold, you get `402` with both figures in the message. Add funds or request fewer seconds.
- **Concurrent jobs.** How many unfinished video jobs you can have at once depends on your balance, up to a fixed ceiling.
- **0G accounts and USD prices.** If a model is priced in USD, a 0G account is charged at the 0G/USD rate recorded when you submitted the job, not the rate when it finished.

## Related

- [**Models**](../models): find video models, their tiers and prices
- [**Routing**](../routing)
- [**Image Generation**](./image-generation)
- [**Deposits & Billing**](../account/deposits)
