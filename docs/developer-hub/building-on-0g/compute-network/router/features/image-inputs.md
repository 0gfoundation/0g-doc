---
id: image-inputs
title: Image Inputs
sidebar_position: 5
description: "Send images to vision models on chat requests, inline as base64 or by URL."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Image Inputs

Models that take image input can read images you attach to `POST /v1/chat/completions` and `POST /v1/messages` requests, in each API's standard shape. The Router passes the image to the provider unchanged and sends the request only to providers of the model that take images.

## Which models take images

A model takes images when `architecture.input_modalities` in [`/v1/models`](../models) contains `"image"`:

```bash
curl -s https://router-api.0g.ai/v1/models \
  | jq -r '.data[] | select(.architecture.input_modalities | index("image"))
                   | select(.architecture.output_modalities == ["text"]) | .id'
```

The catalog lists a model as taking images when any of its providers does, on any API. A model can take images on one API only: `glm-5.3-flash`, for example, takes them on `/v1/chat/completions` but not on `/v1/messages`. [`GET /v1/providers?model=<id>`](../models#listing-providers-for-a-model) shows each provider's `supported_formats` and `architecture.input_modalities`.

## Request

Send the image as base64. Use a `data:` URI on `/v1/chat/completions`, and an Anthropic `base64` source on `/v1/messages`.

<Tabs>
<TabItem value="chat" label="Chat Completions" default>

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "qwen3.8-flash",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "What color is this image? Answer in one word."},
        {"type": "image_url", "image_url": {
          "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR42mO4oKBAU8QwasGoBaMWjFowasGoBaMWjFowasGoBaMWDBULAE7YQD2B7wk2AAAAAElFTkSuQmCC"
        }}
      ]
    }]
  }'
```

</TabItem>
<TabItem value="messages" label="Messages">

```bash
curl https://router-api.0g.ai/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "mimo-v2.6-flash",
    "max_tokens": 1024,
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "What color is this image? Answer in one word."},
        {"type": "image", "source": {
          "type": "base64",
          "media_type": "image/png",
          "data": "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR42mO4oKBAU8QwasGoBaMWjFowasGoBaMWjFowasGoBaMWDBULAE7YQD2B7wk2AAAAAElFTkSuQmCC"
        }}
      ]
    }]
  }'
```

</TabItem>
</Tabs>

The response is the model's normal answer. A request can carry several images, in any message.

### Links

You can also pass a link instead of the data: an `https://` URL in `image_url.url`, or a `{"type": "url", "url": "..."}` source on `/v1/messages`. The provider then downloads the image itself, and the request fails with the provider's error when:

- the provider does not accept image links, or
- the provider cannot download the URL in time (for example, a host it cannot reach).

Because a model is often served by several providers, a link can work on one request and fail on the next. **Send base64 when you need the request to succeed reliably.**

## Errors

| Status | Cause |
| --- | --- |
| `400` `model_not_capable` | No provider of the model takes images on this API. The message says `model <id> does not accept image input`. Not charged |
| `413` | The request body, images included, is over 20 MB after base64 encoding |
| Provider's error, usually `400` | The provider refused the image, for example a link it could not download (`Download multimodal file timed out`), or an image larger than it accepts |

## Billing

There is no fee for images. The provider counts each image as input tokens, billed at the model's normal input price. Some providers report the image share separately in `usage.prompt_tokens_details.image_tokens`:

```json
"usage": {
  "prompt_tokens": 138,
  "prompt_tokens_details": {"cached_tokens": 0, "image_tokens": 66, "text_tokens": 72},
  "completion_tokens": 46,
  "total_tokens": 184
}
```

## Related

- [**Chat Completions**](./chat-completions) — request and response shape
- [**Models**](../models) — check which models take image input
- [**Errors**](../errors) — response codes and error shapes
