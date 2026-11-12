---
id: agent-skill
title: 0G Private Computer skill
sidebar_position: -1
description: "Get started with 0G Private Computer through your coding agent: paste one line, say what you want, and approve each step. Connect a coding tool, build with 0G models, try models or fix a problem."
keywords: [agent skill, 0G Private Computer, Claude Code, OpenCode, Pi, Hermes Agent, 0gpc, Router, getting started]
---

# Get started with the 0G Private Computer skill

> Tell your coding agent what you want in plain words, and it sets up and uses [0G Private Computer](https://pc.0g.ai) for you. It shows every change before making it, and asks before anything that costs money.

---

## Before you start

1. **A pc.0g.ai account and an API key.** Create a key at [pc.0g.ai/dashboard/api-keys](https://pc.0g.ai/dashboard/api-keys). You need it to connect a coding tool or build with 0G models. You do not need a key just to ask about models; trying a model in the Playground uses your account and its balance.
2. **Some balance on your account.** Requests are paid per use from your balance. You top it up on pc.0g.ai; the agent never pays for you.
3. **A coding agent that can read a web page**, such as Claude Code or OpenCode.

To connect a coding tool (**Connect**), you also need macOS or Linux and Node.js 22 or later, because the agent runs the 0gpc CLI with `npx`. Windows is not supported for Connect, so check this before you start.

---

## Start in one line

Paste this into your coding agent:

```text
Read https://pc.0g.ai/skill and help me set up 0G Private Computer.
```

That is all. Nothing is installed on your machine and nothing is changed: the agent reads one page and then asks what you want to do.

Prefer a local copy? For long-term use, install the skill once with `npx skills add`. It needs Node.js 22.20 or later:

```sh
npx skills add 0gfoundation/0g-agent-skills/skills/private-computer/0g-private-computer
```

After installing, restart the tool so it loads the skill. Then ask in plain words (for example "connect Claude Code to 0G PC"), or type `/0g-private-computer` in Claude Code.

| | Paste one line | npx skills add |
|---|---|---|
| Best for | Getting started now | Long-term use |
| What it uses | `SKILL.md`, plus one reference file when the task needs it, read from the URL; nothing is saved on your machine | The whole skill saved on your machine: `SKILL.md` and its three reference files |
| Version | The latest, read each time | A local copy you can review and pin to a version |

---

## Your first session

**1. The agent shows you the choices.** You will see something like this (the wording and version number may differ a little):

```text
0G Private Computer skill v0.5 (read from https://pc.0g.ai/skill).
For long-term use, install it: npx skills add 0gfoundation/0g-agent-skills/skills/private-computer/0g-private-computer
(a local, reviewable, version-pinned copy; needs Node.js 22.20 or later).

What do you want to do?
1. Ask: what 0G PC is, which models, what they cost.
   Say: "which models support Private mode?"  Models: https://pc.0g.ai/models
2. Try: compare models in the Playground, no code.
   chat https://pc.0g.ai/playground/chat · image https://pc.0g.ai/playground/image
   video https://pc.0g.ai/playground/video · speech https://pc.0g.ai/playground/speech
3. Connect: put Claude Code, OpenCode, Pi or Hermes Agent on 0G models (uses the 0gpc CLI).
   Say: "connect Claude Code in this project to 0G PC"
4. Build: add 0G to your app or script (text, image, video, speech, embeddings, decisions).
   Say: "add a streaming chat endpoint with 0G PC in Private mode"
5. Compute Direct: wallet-signed calls, broker SDK, sub-accounts, fine-tuning (the Compute skills,
   not this one). https://github.com/0gfoundation/0g-agent-skills/tree/main/skills/compute
   Install: npx skills add 0gfoundation/0g-agent-skills/skills/compute/<skill>, for example
   streaming-chat or fine-tuning.
6. Fix: a 401, a balance problem, a model that seems down (status: https://pc.0g.ai/status),
   or a tool still on the old model.
   Say: "my 0G key gives a 401"

You need an API key for Connect and Build: create one at https://pc.0g.ai/dashboard/api-keys. It
never goes through me; you keep it in your own terminal or environment. Nothing is installed or
changed until you pick one.
```

If you do not see a menu like this, your agent may have summarized the page instead of reading it. Ask it to read the page again as raw text, or use `npx skills add` instead.

**2. You pick one.** Choose a number or say it in your own words. You can also skip the menu and ask directly. The agent tells you how it understood the request (for example "Connect, Claude Code, this project only") before it starts. Correct it if it is wrong.

**3. The agent does the safe parts and asks for the rest.** It reads the live model catalog, recommends a model, and shows you exactly what it will change. It waits for your yes before it writes anything.

**4. You do the parts only you can do.** The agent never asks for your key. It tells you when it needs you to act.

The rest of this page follows the six choices, in the same order.

---

### Who does what

| You | The agent |
|---|---|
| Create the key, enter it in your own terminal, keep it out of the chat | Never asks for, reads or repeats your key |
| Set the key's trust mode on pc.0g.ai | Tells you which mode your request needs |
| Top up your balance | Never pays, deposits or buys credits |
| Say yes to each preview and each paid request | Previews first, writes only after your yes |
| Restart the tool | Tells you when a restart is needed |

---

## Choose a trust mode

Every request runs under one of three modes. You set it as a default on your API key, or per request.

| Mode | What it means |
|---|---|
| Standard (default) | The widest choice of models, at the best price and availability. No privacy or verification guarantee beyond the serving provider's own policy. |
| Verified | Only routes where the model and route can be proven. Privacy follows the serving provider's policy. |
| Private | Only TEE-backed providers, with hardware isolation and no retention of prompt content. Available for some models only. Routing and billing metadata may remain visible. |

Not every model supports every mode. Check the model's page on [pc.0g.ai/models](https://pc.0g.ai/models). See [Privacy](/developer-hub/building-on-0g/compute-network/router/privacy) for the full guarantees.

---

## 1. Ask

**Use it when** you want to know what 0G Private Computer is, which models it has, or what they cost. No key, no cost, nothing installed.

| Say this | What happens |
|---|---|
| "what is 0G Private Computer?" | A short answer from the skill, with links |
| "which models support Private mode?" | Lists the models served by a TEE-attested provider, from the live catalog |
| "is glm-5.3 on 0G?" | Checks the live catalog right then |
| "what does it cost to generate an image?" | Quotes the price per image from the catalog |

The agent always points you to the [model catalog](https://pc.0g.ai/models) first, and to a model's own page (`pc.0g.ai/models/<model-id>`) for its endpoint, fields and limits. Prices and models change, so the agent reads them live instead of remembering them.

---

## 2. Try

**Use it when** you want to compare models before writing any code. The agent points you to the Playground for that kind of model.

| Model type | Playground |
|---|---|
| Chat, and image understanding (attach an image) | [pc.0g.ai/playground/chat](https://pc.0g.ai/playground/chat) |
| Image generation and editing | [pc.0g.ai/playground/image](https://pc.0g.ai/playground/image) |
| Video generation | [pc.0g.ai/playground/video](https://pc.0g.ai/playground/video) |
| Speech: transcription and text-to-speech | [pc.0g.ai/playground/speech](https://pc.0g.ai/playground/speech) |

Say, for example, "I want to compare a few image models before I write any code." The agent lists the live models for that type with their prices, and links the Playground. Trying a model in the Playground uses your account and its balance.

Embeddings, decisions and video understanding have no Playground page. For those, the agent links the model's page and offers one test request through the Build flow, after you agree to the cost.

---

## 3. Connect

**Use it when** you want a coding tool to run on 0G models. Works with Claude Code, OpenCode V1, Pi and Hermes Agent through the [0gpc CLI](/developer-hub/building-on-0g/compute-network/router/clients/0gpc-cli). Every change is previewed first and saved only after you confirm. Restart the tool afterwards so it picks up the new model.

| You want to | Say this | What happens |
|---|---|---|
| Put your coding agent on 0G | "connect Claude Code in this project to 0G PC" | Checks your setup; you add your key in your own terminal, pick a model and approve the exact change |
| See which models you can use | "which models can Claude Code use on 0G PC?" | Reads the live catalog, with price, context length, tool calling and Private support; no key, no cost |
| Pick a model for coding | "which 0G model is best for coding with Claude Code?" | Recommends one model from the live catalog, plus up to two alternatives, and says why |
| Keep your code private | "make sure Claude Code only uses Private (TEE) inference" | Has you set your key to Private on pc.0g.ai, then picks a model served by a TEE-attested provider |
| Switch model | "switch to a cheaper 0G model" | Shows the options, previews the change and saves it after you confirm |
| Confirm it's working | "am I on 0G now?" | Checks the local setup and points you to your requests in usage on pc.0g.ai |
| See what you've spent | "how much have I spent on 0G?" | Points you to usage and balance on pc.0g.ai; topping up is always your call |
| Replace your key | "I need a new 0G key" | You create a new key on pc.0g.ai and enter it in your own terminal; every connected tool picks it up |
| Use 0G in every project | "use 0G PC for Claude Code in all my projects" | Explains that this changes your global settings, previews it and asks before saving |
| Go back to your usual setup | "turn 0G off" | Removes only what 0gpc added; your other settings and your key stay |


### Example: connect Claude Code

**Before the chat (on pc.0g.ai, about two minutes)**

1. Create an API key at [pc.0g.ai/dashboard/api-keys](https://pc.0g.ai/dashboard/api-keys).
2. Set the key's trust mode. For private inference, choose Private. The CLI cannot set it, so this one is yours.
3. Check that your balance is not empty.

**In the chat**

1. **Say what you want.** Type:

   ```text
   Connect Claude Code in this project to 0G PC. I use the Private trust mode.
   ```

   The agent first tells you how it understood the request, for example:

   ```text
   Plan: Connect → Claude Code · this project only · trust mode Private · model to be chosen
   ```

   If that is not what you meant, say so now. Nothing has been changed yet.

2. **Save your key.** The agent asks you to run this in your own terminal. The key is hidden as you type, and the agent never sees it:

   ```sh
   npx @0gfoundation/0gpc@latest key set
   ```

   When it is done, tell the agent.

3. **Pick a model.** The agent lists models that fit from the live catalog, with price and context, and recommends one. Reply with the one you want. For Private, it only offers models served by a TEE-attested provider. If you chose this project only, the agent also shows the current directory and asks you to confirm it is the project root.

4. **Read the preview, then say yes.** The agent shows exactly which file will change and what will be written. Nothing is saved until you reply "yes".

5. **Let it check.** The agent writes the change with 0gpc, and nothing else, then runs an offline check. It asks you first before any online check, which may cost a very small amount. It ends with a short report: the tool, scope and model, what changed, the checks, and the command to undo it.

**After the chat**

- Fully quit and reopen Claude Code in that directory. The new model applies after the restart.
- To check, ask "am I on 0G now?" or look for your new requests under usage on [pc.0g.ai](https://pc.0g.ai/dashboard/overview).
- To go back, say "turn 0G off", or run the undo command from the report: `npx -y @0gfoundation/0gpc@latest reset claude --yes` (or `0gpc reset claude --yes` if you have 0gpc installed globally). It removes only what 0gpc added; your other settings and your key stay.


---

## 4. Build

**Use it when** you want to add 0G models to your own app or script. Describe what you want. The agent lists the live models for that feature, you pick a model and a trust mode, and it writes code that reads your key from the environment. It confirms the model with you before it writes any code, and asks before any request that costs money.

| Feature | Say this | Before it runs | Try it |
|---|---|---|---|
| Chat Completions | "add a streaming chat endpoint with 0G PC in Private mode" | Picks a model with you | [chat](https://pc.0g.ai/playground/chat) |
| Vision | "extract the totals from these screenshots with 0G PC" | Picks a vision model | [chat](https://pc.0g.ai/playground/chat) |
| Image Generation | "generate a 1024x1024 hero image with 0G PC" | Shows the per-image price | [image](https://pc.0g.ai/playground/image) |
| Image Editing | "replace the background of photo.jpg with plain white using 0G PC" | Shows the per-image price | [image](https://pc.0g.ai/playground/image) |
| Video Generation | "turn hero.png into a 5-second clip with 0G PC" | Shows duration and estimated cost | [video](https://pc.0g.ai/playground/video) |
| Video Understanding | "summarize what happens in demo.mp4 with 0G PC" | Picks a model that accepts video | |
| Audio Transcription | "transcribe meeting.mp3 with 0G PC" | Picks a speech-to-text model | [speech](https://pc.0g.ai/playground/speech) |
| Text-to-Speech | "read intro.md aloud with 0G PC and save it as intro.mp3" | Shows character count and estimated cost | [speech](https://pc.0g.ai/playground/speech) |
| Embeddings | "embed the Markdown files in ./docs with 0G PC for semantic search" | Shows estimated tokens and cost | |
| Decisions | "route each ticket in tickets.csv to billing, technical or other with 0G PC" | Shows estimated tokens and cost | |

The Router is at `https://router-api.0g.ai/v1` and is OpenAI-compatible. See the [Router quickstart](/developer-hub/building-on-0g/compute-network/router/quickstart) for the API itself.

---

## 5. Compute Direct

**Use it when** you want wallet-signed calls, the broker SDK, per-provider sub-accounts, Advanced mode on pc.0g.ai, or fine-tuning. This is a separate path with its own skills, not this one: see the Compute skills in [0g-agent-skills](https://github.com/0gfoundation/0g-agent-skills/tree/main/skills/compute).

Your Router balance (the default mode on pc.0g.ai) and Direct sub-accounts (Advanced mode, compute-marketplace.0g.ai) are separate. Funds in one do not pay for calls in the other.

---

## 6. Fix

**Use it when** something is not working.

| Say this | What happens |
|---|---|
| "my 0G key gives a 401" | Checks the key, the header, the base URL and any variable that overrides them. It never asks you to paste the key. |
| "I get a balance error" | Tells you whether it is your Router balance or Direct funds; you top up on pc.0g.ai |
| "this model keeps failing" | Checks the [status page](https://pc.0g.ai/status) first, to tell a model problem from a problem in your setup |
| "Claude Code is still on the old model" | Checks that you fully restarted it, in the same directory, and which scope is set |
| "my 0G setup stopped working" | Diagnoses first, then suggests the smallest fix you can undo |

See [Errors](/developer-hub/building-on-0g/compute-network/router/errors) for what each error code means.

---

## What is in the skill

The skill is four files. `SKILL.md` is the page every request starts from. The three reference files hold the detailed steps for one kind of task each, and the agent opens one only when your request needs it.

| File | What it covers | Opened when you |
|---|---|---|
| `SKILL.md` | The six choices, the ground rules (your key, previews, money), the model catalog | Start (every time) |
| `references/connect.md` | Connecting a coding tool through the 0gpc CLI | Choose **Connect** |
| `references/build.md` | Calling the Router from your app, per feature | Choose **Build** |
| `references/troubleshooting.md` | Router errors, balance and key problems, model status, a tool still on the old model | Choose **Fix**, or hit an error while connecting or building |

Ask, Try and Compute Direct need only `SKILL.md`. When you paste the line, the agent reads these files from `https://pc.0g.ai/skill` and `https://pc.0g.ai/skill/references/`. With `npx skills add`, they are already on your machine.

---

## Related

- [0gpc CLI](/developer-hub/building-on-0g/compute-network/router/clients/0gpc-cli): what the agent runs when you connect a coding tool.
- [Claude Code](/developer-hub/building-on-0g/compute-network/router/clients/claude-code): Claude Code settings in detail.
- [Router quickstart](/developer-hub/building-on-0g/compute-network/router/quickstart): call the Router from your own code.
- Source of the skill: [0gfoundation/0g-agent-skills](https://github.com/0gfoundation/0g-agent-skills).
