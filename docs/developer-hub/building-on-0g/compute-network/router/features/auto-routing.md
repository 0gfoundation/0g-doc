---
id: auto-routing
title: Auto Routing
sidebar_position: 2
description: "Send model \"0g/auto\" and let the Router pick the model for the task: an encrypted classifier reads the conversation's opening, and response headers tell you which model answered."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Auto Routing

Set `"model": "0g/auto"` and the Router picks the model for you. It reads the opening of the conversation, decides what kind of task it is, such as debugging code, solving a math problem or small talk, and sends the request to the best model for that task. The response is that model's normal response, plus headers that say which model answered and why.

It works on `POST /v1/chat/completions` and `POST /v1/messages`, streaming or not.

## How it works

1. **Classify.** The opening of the conversation goes to a small classifier model, `vela-2.0-9b`. The opening is the system prompt plus the first user message, truncated. The classifier returns one [task category](#task-categories). This call is **end-to-end encrypted**: the Router forwards it without being able to read it.
2. **Pick.** The Router walks its ranking for that task and takes the first model that can serve the request: it accepts the request's inputs (for example images), supports the API format (Chat Completions or Messages), and is allowed by your [routing headers](../routing.md). So the same task can get a different model on `/v1/messages` than on `/v1/chat/completions`.
3. **Send.** The request is sent as if you had named that model. Everything else in your request is kept as you sent it.

Only text is read for the classification. Images are not sent to the classifier; the Router only uses the fact that the request contains images to choose among models that accept them.

The task for an opening is remembered for 24 hours, separately for each API key. Later turns of the same conversation repeat the opening, so they are not classified again and stay on the same model.

## Usage

<Tabs>
<TabItem value="chat" label="Chat Completions" default>

```bash
curl -i https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "0g/auto",
    "messages": [{"role": "user", "content": "Why does my C++ program segfault when I return a reference to a local variable?"}],
    "max_tokens": 300
  }'
```

</TabItem>
<TabItem value="messages" label="Messages">

```bash
curl -i https://router-api.0g.ai/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "0g/auto",
    "max_tokens": 300,
    "messages": [{"role": "user", "content": "What is the derivative of x^3 * sin(x)?"}]
  }'
```

</TabItem>
<TabItem value="python" label="Python (OpenAI SDK)">

```python
from openai import OpenAI

client = OpenAI(base_url="https://router-api.0g.ai/v1", api_key="sk-YOUR_API_KEY")

raw = client.chat.completions.with_raw_response.create(
    model="0g/auto",
    messages=[{"role": "user", "content": "Why does my C++ program segfault when I return a reference to a local variable?"}],
    max_tokens=300,
)
completion = raw.parse()
print(raw.headers.get("X-0G-Auto-Task"), "->", raw.headers.get("X-0G-Auto-Model"))
print(completion.choices[0].message.content)
```

</TabItem>
</Tabs>

The response headers of the Chat Completions example:

```
HTTP/1.1 200 OK
X-0g-Auto-Classifier-E2ee: sealed
X-0g-Auto-Model: claude-opus-5.5
X-0g-Auto-Task: code:debugging
```

The body's `model` field is also the model that answered, here `claude-opus-5.5`.

## Response headers

| Header | Example | Meaning |
| --- | --- | --- |
| `X-0G-Auto-Model` | `claude-opus-5.5` | The model that served the request |
| `X-0G-Auto-Task` | `code:debugging` | The task category the classifier chose; `general` when the request was not classified |
| `X-0G-Auto-Classifier-E2EE` | `sealed` | `sealed` when the classification was end-to-end encrypted, `none` when it was sent in the clear (see [Encryption](#encryption)). Absent when the request was not classified |

The headers are sent on streaming responses too, before the first chunk. Browsers can read them: they are listed in `Access-Control-Expose-Headers`.

## When the request is not classified

The task is `general` and no classifier call is made when:

- **You pin a provider** with `X-0G-Provider-Address` (or `provider.address` in the body). The classifier cannot run on that provider, and sending your opening to another provider would go against the pin.
- **The classification fails or takes longer than 5 seconds.** The request still goes ahead. The `general` result is remembered for one hour, so the conversation does not switch models while the classifier is unavailable.

For `general`, the Router uses its fallback list: `glm-5.3`, `glm-5.3-flashx`, `deepseek-v4-pro`, `qwen3.7-plus`, in that order.

## Encryption

The classifier call is end-to-end encrypted by default. Whether the main request is encrypted depends on the model that is picked, exactly as when you name that model yourself: `0gm-1.0-35b-a3b` and `glm-5.3` are end-to-end encrypted, other models are not. The `X-0G-E2EE` response header says which happened: `sealed` or `none`.

To make sure that the whole conversation is encrypted, send the `X-0G-Encrypted-Transit: required` request header. The Router then only picks models that can be end-to-end encrypted:

```bash
curl -i https://router-api.0g.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -H "X-0G-Encrypted-Transit: required" \
  -d '{
    "model": "0g/auto",
    "messages": [{"role": "user", "content": "Why does my C++ program segfault when I return a reference to a local variable?"}],
    "max_tokens": 300
  }'
```

Here the same question goes to `glm-5.3` instead of `claude-opus-5.5`, and `X-0G-E2EE` is `sealed`.

With `X-0G-Encrypted-Transit: off`, you allow the classification to be sent in the clear; `X-0G-Auto-Classifier-E2EE` is then `none`.

## Task categories

| Task | What it covers |
| --- | --- |
| `agent:workflow_execution` | Carrying out a multi-step workflow end to end as an agent |
| `agent:multi_step_planning` | Breaking a goal into an ordered plan, roadmap or strategy |
| `agent:tool_dispatch` | Choosing which tool, function or API to call, and with which arguments |
| `agent:web_search` | Looking up current information on the web |
| `agent:memory_extraction` | Extracting facts or preferences about the user to store for later |
| `code:general_impl` | Writing new code: a function, class, script or feature |
| `code:file_read_write` | Reading, creating, editing or patching files in a codebase |
| `code:debugging` | Finding and fixing the cause of an error, crash or failing test |
| `code:review_security` | Reviewing code for quality, bugs or security vulnerabilities |
| `code:shell_execution` | Writing or running shell commands |
| `code:frontend_ui` | Building or styling web and mobile user interfaces |
| `code:repo_scan` | Exploring or explaining an existing codebase |
| `code:devops_config` | Writing infrastructure or CI/CD configuration |
| `code:sql_database` | Writing or optimizing SQL queries, schemas or migrations |
| `data:extraction` | Pulling structured fields out of unstructured text |
| `data:transformation` | Converting, cleaning or reshaping data between formats |
| `classification_tagging` | Assigning labels, categories, sentiment or tags |
| `content_writing` | Writing articles, marketing copy, emails or other prose |
| `roleplay_fiction` | Role-play, interactive fiction and creative writing |
| `qa_knowledge` | Answering a factual or explanatory question |
| `conversational_reply` | Casual chat, greetings and small talk |
| `research_report` | Producing an in-depth research report or analysis |
| `customer_support` | Handling a customer's service issue, complaint or order |
| `summarization` | Condensing a text into a shorter summary |
| `security_audit` | Assessing systems or configurations for security risks |
| `math` | Solving math problems, proofs or calculations |
| `finance_trading` | Investing, trading, markets and financial analysis |
| `translation` | Translating text between languages |
| `devops` | Operating and troubleshooting running systems |

## How models are ranked

For each task, the ranking follows [OpenRouter's per-task leaderboard](https://openrouter.ai/rankings), limited to models that 0G serves. The Router checks the leaderboard once every 7 days and updates the ranking when it has changed. `0gm-1.0-35b-a3b` is always tried first for `conversational_reply`.

## Pricing

- The main request is billed at the price of the model that answered, as if you had named it.
- Each classification is billed as a separate request to the classifier model (Vela) on your usage: about 1,050 input tokens, about $0.00004 at current prices.
- The classification is not billed again when its result is remembered (later turns of the same conversation), or when the request is not classified.

## Errors

| Status | `error.code` | When |
| --- | --- | --- |
| `400` | `auto_no_eligible_model` | No model in the task's ranking can serve this request. For example, with `X-0G-Encrypted-Transit: required` and an image, when no model that can be encrypted both fits the task and accepts images. The message names the task and the models that were tried. Send the request again with a model named explicitly |
| `502` | — | The Router could not choose the model, for example when its model choice did not answer |

Other errors are the same as for any request: see [Errors](../errors.md).

## Limits

- Only `POST /v1/chat/completions` and `POST /v1/messages`. Other endpoints do not accept `0g/auto`.
- The classifier reads at most the system prompt's first 2,000 bytes and the first user message's first 6,000 bytes.
- A request that is classified takes about 1 second longer. Later turns of the same conversation do not.
- `0g/auto` is not listed by `GET /v1/models`.
