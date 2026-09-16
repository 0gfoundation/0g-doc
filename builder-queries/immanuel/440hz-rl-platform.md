# Builder query — Immanuel (440hz)

**Date:** 2026-05-02
**Builder:** Immanuel
**Project:** 440hz — Federated training arenas for tuning LLMs (RLAIF platform on 0G)

---

## Round 1 — Initial proposal

> Currently we are trying to setup one PC as a compute provider on 0g, but instead
> of the serving-broker which is provided by 0G, we are building a custom broker
> to handle Reinforcement Learning through DinD.
>
> We would really appreciate some feedback on this approach or do let us know if
> there any better options.
>
> is this possible with what we have in 0G
> What the builder will need for this

### My evaluation (Round 1)

**Short answer: No, not in a supported way.**

Three separate problems:

1. **Consumer PC as 0G compute provider — No.**
   - `inference-provider.md:48-49` and `fine-tuning-provider.md:14-18` require Intel
     TDX-enabled CPU and NVIDIA H100/H200 with TEE support.
   - Without TEE attestation, the broker cannot sign responses verifiably; clients
     (Compute Router, TS SDK) reject unverified providers.

2. **Custom broker — Not a supported path.**
   - Both flows route through the official broker
     ([`0g-compute-ts-sdk/releases`](https://github.com/0gfoundation/0g-compute-ts-sdk/releases)).
   - Re-implementing requires producing valid TEE attestations from real TDX+H100 hardware.
   - No documented "bring your own broker" extension point.

3. **RL via DinD on 0G — Not today.**
   - Per `compute-network/overview.md:48`: Training is 🔜 Coming, not Live.
   - Fine-tuning provider's `customizedModels` slot runs `python <trainingScript>` on
     a JSONL dataset — supervised FT, not arbitrary RL loops.
   - DinD inside CVM typically wants `--privileged` / nested virt → breaks TDX
     attestation surface; nested GPU passthrough not supported.

### What a builder would need (if pursuing anyway)

- TDX-capable host (Sapphire/Emerald Rapids Xeon) + H100 or H200 with confidential compute
- `private-ml-sdk` CVM (`fine-tuning-provider.md:108-114`)
- Official broker binary + 0G-funded wallet
- Public IP + open port matching `config.local.yaml`

### Better options suggested

1. **Use 0G Storage now, bridge to compute later.** Datasets, checkpoints, weights
   on 0G Storage; train on own GPU; migrate when Training tier ships.
2. **Fit into fine-tuning-provider as a custom model.** If RL can be framed as
   "load model + run script over dataset" (DPO/ORPO over static preferences), the
   existing `customizedModels` slot fits.
3. **Talk to 0G Discord directly** before architecting a custom broker.

---

## Round 2 — Builder's clarification

> Yes, we are aware of that hardware requirement (outside of our budget range).
>
> However, as the product uses a custom serving-broker that connects to an another
> device—while operating within the 0G compute marketplace and leveraging other
> functional testnet reward systems. we thought this approach is optimal for utilizing
> the 0G compute ecosystem for our project.
>
> Please do let us know if there is any better option to do Reinforcement Learning
> and Custom training scripts in 0G stack.

### My evaluation (Round 2)

**The "custom broker proxying to another device" idea:**

The official broker is *already* a proxy fronting a model service that runs anywhere.
That isn't novel.

What blocks a normal PC isn't *where* the model runs — it's **what the broker is
required to sign**:
- Broker registers an endpoint on-chain
- Signs every response with a key generated *inside the TEE*, bound to a TDX + GPU
  attestation report
- Clients verify the signature chain
- No TEE attestation = signature unverifiable = no fees

"Earn testnet rewards by spoofing attestations" is not promised by any doc and is
at risk of being clawed back at TGE/snapshot.

### Real options today (in order of viability on PC hardware)

1. **Run RL on own hardware, anchor to 0G Storage + DA.**
   - 0G Storage for datasets, preference data, replay buffers, checkpoints, LoRA
     adapters, final policy weights (Merkle root hash referenceable on-chain)
   - 0G Chain for run metadata, reward function hashes, policy version pointers
   - 0G DA if trajectories/rollouts need public availability proofs
   - User of 0G's data layer, not a compute operator

2. **Bend RL into fine-tuning provider's `customizedModels` slot — as a customer.**
   - A TEE-equipped provider registers an image with `trainingScript` running RL
     (DPO/ORPO over static preference data)
   - Customer submits jobs and pays in 0G

3. **Run commodity-hardware nodes in the 0G testnet economy.**
   - Storage Node (`run-a-node/storage-node.md`) — PoRA-style mining rewards
   - DA Node (`run-a-node/da-node.md`) — farming rewards, 10 OG testnet stake
   - Validator Node (`run-a-node/validator-node.md`) — Cosmos-style validator
   - Real testnet participation, not "compute provider"

4. **Wait for Training tier.**
   - Per overview: 🔜 Coming
   - May or may not still gate on TDX+H100; ask 0G Discord directly

### My recommendation

Pick (1) + (3) as a combo: train on own GPU, write artifacts to 0G Storage so
*outputs* live on 0G, run a Storage Node on the same PC for testnet rewards.
Ship a small open-source "RL → 0G Storage anchoring" tool — real contribution that
fits the stack as it exists, no faked attestations, ready for Training tier when
it ships.

What I would NOT do: build a custom broker and try to register from non-TEE
hardware. Architecture won't be accepted by verifying clients; testnet rewards
earned that way are at risk of clawback.

---

## Round 3 — Full architecture pitch

### 440hz — Federated training arenas for tuning LLMs

#### 1. Summary

To build highly capable, agentic AI, foundation models must move beyond static text
prediction and practice in interactive environments using Reinforcement Learning
inside custom-built sandboxes for frontier labs, addressing the needs of deep-tech
enterprises bound by data privacy.

440hz is the first decentralized, federated RLAIF (Reinforcement Learning from AI
Feedback) platform. Built natively on 0G's ecosystem, 440hz connects model tuners,
domain-expert environment designers, and decentralized hardware providers. This
allows LLMs to train on highly sensitive, proprietary data inside verifiable TEEs,
guaranteeing zero IP leakage and undercutting centralized cloud compute costs.

#### 2. The Problem

- **Data Privacy Silo:** Most valuable training data locked behind corporate firewalls.
- **Cloud Bandwidth Bottleneck:** Uploading TBs to centralized AWS/GCP for AI
  training incurs massive egress fees and latency.
- **Knowledge Bottleneck:** "Data wall" forcing shift to synthetic data and
  interactive environments.

#### 3. The Solution

- **No-Code Gym UI:** Drag-drop builder for Gymnasium environments
- **Federated Edge Compute:** QLoRA pushes base models down to data; only updated
  parameters move
- **AI-Overseer Verification (RLAIF):** Small LLMs (Mistral Small / "MiMo-v2-flash")
  as reward function

#### 4. User Process Flow

1. **Design & Register:** Gym built in 440hz UI → compiled container → 0G Storage
2. **Intent Matching:** Startup submits training intent on 0G Chain, locks USDC
   in escrow, selects base model + Gym
3. **Data Routing:** 0G DA streams encrypted base model + Gym container to matched
   0G Compute node (or enterprise local edge server)
4. **RLAIF Loop:** Inside TEE, LLM interacts with Gym; AI Overseer scores actions;
   raw data never leaves container
5. **Adapter Upload:** LoRA adapter extracted, encrypted, uploaded to 0G Storage
6. **Federated Aggregation:** Flower.ai pulls LoRA weights, FedAvg into global update
7. **Settlement & Merging:** 0G Chain verifies TEE attestation, pays providers,
   440hz spins up final TEE to bake LoRA into base LLM for download

#### Architecture Components

- **Orchestrator:** Receives job config, initializes components, manages workflow
- **Trainer:** Optimizes model using selected algorithm + env feedback
- **Environment Runner:** Executes custom training environment, provides obs/rewards
- **Supervisor:** Scores agent actions, provides feedback
- **Federation Manager:** Coordinates with other nodes, sends/receives updates
- **Aggregator:** Combines model updates into final unified model
- **Storage Manager:** Saves final model to decentralized storage

#### Key Features

- Supports GRPO, PPO, DPO algorithms
- Low-rank adapters for efficient FT and faster federated averaging
- Scales single-node to multi-node federated
- Automatic checkpointing
- Isolated containers with trustless execution verification

---

### My evaluation (Round 3)

**Headline: Real on the ML side, hand-wavy on the 0G side.**

The ML stack (GRPO/PPO/DPO + QLoRA + Flower.ai FedAvg + Gymnasium + RLAIF) is
**legitimate and current**. The architecture decomposition is sensible. Discount
the "LLM-spam" suspicion on the ML axis — this part shows real domain knowledge.

But several **0G integration claims are factually wrong**:

| Claim | Verified | Verdict |
|---|---|---|
| 0G Storage for containers + LoRA adapters | `storage/sdk.md` — arbitrary blobs with Merkle roots | ✅ Correct |
| **0G DA streams the base model + Gym container** | `concepts/da.md` — DA is for rollups/gaming/HFT availability proofs, NOT a CDN for model weights. That's Storage. | ❌ **Wrong** |
| **USDC in escrow on 0G Chain** | USDC not native; compute network priced in 0G tokens (`account-management.md`, `fine-tuning.md`). Would need bridging. | ⚠️ Possible, not "given" |
| **0G Chain verifies TEE attestation** | Per `inference.md` and `inference-provider.md` — verification is by client SDKs / Router / verifier scripts. Chain stores signer address; doesn't run TDX quote verification on-chain. | ❌ **Wrong** |
| Inside TEE, LLM trains on 0G Compute node | Real, but only on TDX + H100/H200. Fallback "or enterprise local edge server" silently drops TEE guarantee. | ⚠️ Conditional |
| "MiMo-v2-flash" as reward model | Unverified — could be Xiaomi MiMo derivative or fabricated | ⚠️ Verify |

#### Structural issue

Contradiction between value prop ("zero IP leakage via verifiable TEE") and
federated-edge story ("trains locally on edge hardware *or* within 0G TEEs"):

- Edge server path: only customer's own infra protects IP. Just normal on-prem
  training. 0G adds storage/coordination glue, not privacy.
- 0G TEE path: requires TDX + H100/H200, finite listed providers.

The "federated" framing lets them sell both under one banner, but the
cryptographic story only holds in path 2.

#### DA-vs-Storage mistake is the biggest tell

A builder who'd actually read `concepts/da.md` once would not write "0G DA streams
the model." That phrasing suggests the architecture was written from intuition
about what "DA" sounds like rather than from the docs.

#### Original "PC as compute provider" doesn't appear in this pitch

This pitch frames 440hz as a **platform orchestrating jobs across 0G providers +
edge nodes**, not as being a 0G provider. Two possibilities:
1. Original message was a sub-piece embedded in bigger 440hz vision
2. Builder pivoted between messages

Worth clarifying — being a *user* of 0G compute is fully viable on a PC; being a
*provider* is not.

### Suggested response (sent)

> Thanks — much more substantive pitch and the RL stack lines up with where
> federated LLM tuning is actually going. A few things to firm up:
>
> 1. **0G DA vs 0G Storage.** Pitch says "0G DA streams the encrypted base model
>    and Gym container." 0G DA is a data-availability layer for rollups/gaming
>    chains — availability proofs over blobs sampled by DA committees. Not designed
>    to deliver containers or model weights. That's 0G Storage's role.
>
> 2. **Settlement currency.** USDC in escrow — compute network priced in 0G tokens;
>    USDC isn't native on 0G Chain. Bridging/deploying yourselves, or settling in
>    0G tokens?
>
> 3. **Where attestation is verified.** Quote verification happens off-chain in
>    SDK / Router / verifier scripts; chain stores signer address. On-chain
>    attestation verification would be something you build, not a 0G primitive.
>
> 4. **Federated-edge trust story.** When training runs on enterprise's local
>    edge server (not 0G TEE), what's the cryptographic guarantee of "zero IP
>    leakage"? Or is TEE story only for 0G provider node path?
>
> 5. **Which 0G compute path?** (a) Customer of fine-tuning provider network,
>    (b) Register own broker as provider (TDX + H100/H200 required), or (c) 0G
>    only for storage + chain coordination, compute on edge hardware?
>
> If (c) for v1, realistic integration: 0G Storage for datasets/containers/adapters,
> 0G Chain for orchestration, run training off-network, anchor outputs to Storage.
> Works on commodity hardware today.

### Filter

If they come back having corrected DA/Storage and answered (5) → real builder, schedule call.
If they paper over corrections or repeat hand-waves → filter signal confirmed.
