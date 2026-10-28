---
id: file-inputs
title: File Inputs
sidebar_position: 5
description: "Attach PDF and text files inline to chat requests; the Router extracts the text for models that cannot read files themselves."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# File Inputs

You can attach files inline to `POST /v1/chat/completions` and `POST /v1/messages` requests, in each API's standard shape. Any chat model can answer questions about them: when the provider serving the request cannot read files itself, the Router extracts the text and puts it in the message where you attached the file.

Supported formats are **PDF** (with a text layer) and **UTF-8 text** files such as `.txt`, `.md`, `.csv`, `.json` or source code. The format is detected from the file's content, not from its name or declared MIME type.

## Request

Send the file as base64, either as a `data:` URI or as bare base64.

<Tabs>
<TabItem value="chat" label="Chat Completions" default>

```bash
curl https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "What is the new launch date in these notes?"},
        {"type": "file", "file": {
          "filename": "notes.txt",
          "file_data": "data:text/plain;base64,TWVldGluZyBub3RlcwpEZWNpc2lvbjogbGF1bmNoIGRhdGUgbW92ZWQgdG8gMjAyNi0xMS0xNS4K"
        }}
      ]
    }]
  }'
```

For a PDF, use `data:application/pdf;base64,...`.

</TabItem>
<TabItem value="messages" label="Messages">

```bash
curl https://router-api.0g.ai/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "glm-5.3-flash",
    "max_tokens": 1024,
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "What is the new launch date in these notes?"},
        {"type": "document", "title": "notes.txt", "source": {
          "type": "base64",
          "media_type": "text/plain",
          "data": "TWVldGluZyBub3RlcwpEZWNpc2lvbjogbGF1bmNoIGRhdGUgbW92ZWQgdG8gMjAyNi0xMS0xNS4K"
        }}
      ]
    }]
  }'
```

For a PDF, set `media_type` to `application/pdf`.

</TabItem>
</Tabs>

The file name (`filename`, or `title` on `/v1/messages`) is shown to the model with the file's text, so give it a meaningful name.

## How the file is read

- **Provider reads files itself.** The file is forwarded unchanged and the provider reads it, including content the Router cannot extract, such as scanned pages.
- **Otherwise, the Router extracts the text.** Each file is replaced by a text part holding its content, between `[File: <name>]` and `[End of file: <name>]` markers. The response's `x_0g_trace.request_rewritten` then contains `"file_parse"`:

```json
"x_0g_trace": {
  "request_id": "096a7a44-a82d-4a3d-b84b-b9528ddffb3c",
  "request_rewritten": ["file_parse"]
}
```

Because the provider received a modified request, its TEE signature will not match the request you sent when `request_rewritten` is present.

## Limits

The limits and errors below apply when the Router extracts the text. When the provider reads files itself, the file is forwarded as sent and the provider decides what it accepts.

| Limit | Value |
| --- | --- |
| Files per request | 20, counted across all messages, including files attached in earlier turns |
| Text kept per file | 200,000 bytes; the rest is cut and the model is told the file was truncated |
| Request body | 20 MB, after base64 encoding |

Files are not stored: send the file again in every request that needs it, as in a normal conversation history.

## Errors

A file the Router cannot read fails the request with `400` and `invalid_request_error`, rather than letting the model answer without it. The message names the file.

| `code` | Cause |
| --- | --- |
| `unsupported_file_type` | The file is neither a PDF nor UTF-8 text (for example an image, a `.docx` or a `.zip`) |
| `file_parse_failed` | The PDF has no extractable text (a scanned PDF; OCR is not supported), or is damaged or encrypted |
| `unsupported_file_source` | The file is given by `file_id`, by URL, or by an Anthropic `source.type` other than `base64`. Only inline base64 data is accepted |
| `invalid_file_data` | The file data is empty or not valid base64 |
| `too_many_files` | More than 20 files in the request |

These errors are not charged.

## Billing

There is no fee for files. When the Router extracts the text, that text is billed as input tokens at the model's normal price. When the provider reads the file itself, you pay the input tokens the provider reports for it.

## Related

- [**Chat Completions**](./chat-completions) — request and response shape
- [**Errors**](../errors) — response codes and error shapes
