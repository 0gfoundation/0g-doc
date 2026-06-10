---
id: audio
title: Audio Transcription
sidebar_position: 4
description: "Speech-to-text via the OpenAI-compatible /v1/audio/transcriptions endpoint."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Audio Transcription

**`POST /v1/audio/transcriptions`**

Fully compatible with the [OpenAI Audio Transcription API](https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create). Send audio as `multipart/form-data`; the OpenAI SDK does this automatically.

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
curl https://router-api.0g.ai/v1/audio/transcriptions \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -F "file=@recording.mp3" \
  -F "model=openai/whisper-large-v3" \
  -F "response_format=json"
```

</TabItem>
<TabItem value="python" label="Python (OpenAI SDK)">

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://router-api.0g.ai/v1",
    api_key="sk-YOUR_API_KEY",
)

with open("recording.mp3", "rb") as f:
    result = client.audio.transcriptions.create(
        model="openai/whisper-large-v3",
        file=f,
        response_format="json",
    )

print(result.text)
```

</TabItem>
</Tabs>

## Fields

| Field             | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `model`           | Audio model ID from [`/v1/models`](../models)                   |
| `file`            | Audio file (multipart form)                                     |
| `response_format` | `json`, `text`, `srt`, `verbose_json`, `vtt`                    |
| `language`        | ISO-639-1 code, e.g. `"en"` — optional, improves accuracy       |
| `prompt`          | Optional text to guide style and vocabulary                     |
| `temperature`     | Sampling temperature (0 = deterministic)                        |

## Response

```json
{
  "text": "Hello, this is a transcription of the audio file."
}
```

## 0G Router Extensions

Because this endpoint uses `multipart/form-data` instead of a JSON body, Router extensions are passed out-of-band — as a query parameter for `verify_tee`, and as `X-0G-Provider-*` request headers for provider routing.

**TEE verification** — pass `verify_tee` as a query parameter:

```
?verify_tee=true
```

See [Verifiable Execution](./verifiable-execution) for what `tee_verified` means in the response.

**Provider routing** — pass `X-0G-Provider-*` headers, the same surface as JSON endpoints:

```bash
curl https://router-api.0g.ai/v1/audio/transcriptions \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Provider-Sort: latency" \
  -F "file=@recording.mp3" \
  -F "model=openai/whisper-large-v3"
```

See [Provider Routing](../routing) for the full header reference.

## Related

- [**Models**](../models) — list available audio models
- [**Verifiable Execution**](./verifiable-execution)
