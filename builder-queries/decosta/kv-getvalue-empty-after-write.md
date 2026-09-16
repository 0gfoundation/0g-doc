# Builder query — Decosta (0G Storage KV)

**Date:** 2026-05-02
**Builder:** Decosta
**Issue:** `kv_getValue` returns `size: 0, version: 0` after a confirmed Batcher write

---

## Original question

> We're writing to stream `0x...f2bd` (in your node's holding list) via the SDK
> Batcher. Tx confirms on-chain (txSeq 65622, hash 0x44154c...0cde).
> But `kv_getValue` returns `size: 0` immediately after. Sync delay, or do we
> need to do something extra?

### What they're doing

- Storing worker profile JSON (name, skills, wallet addr) in 0G KV
- Key: lowercased wallet address, UTF-8 encoded
- SDK: `@0gfoundation/0g-ts-sdk` with Batcher, Indexer, getFlowContract
- Indexer: `https://indexer-storage-testnet-turbo.0g.ai`
- `indexer.selectNodes(1)` → flow address from `nodes[0].getStatus().networkIdentity.flowAddress`
- `new Batcher(1, nodes, flow, rpcUrl)` ← **replicas = 1** (root cause candidate)
- `batcher.streamDataBuilder.set(streamId, utf8(key), utf8(JSON.stringify(profile)))`
- Read: `new KvClient("http://178.238.236.119:6789")` → `client.getValue(streamId, utf8(walletAddress))`
- Result: `{ data: "", size: 0, version: 0 }`

### What they verified

- ✅ `kv_getHoldingStreamIds` includes their stream ID
- ✅ `kv_getFirst` returns old data from other projects (e.g., `0g-vault-manager` April 30 entries)
- ✅ Tx confirmed on-chain with valid txSeq
- ✅ Encoding consistent between write and read (raw curl with base64 produced same empty result)

---

## Diagnosis

### Smoking gun

`docs/run-a-node/storage-node.md:556` — the example KV node `config.toml`
literally lists `f2bd` in `stream_ids`. The public KV node at
`178.238.236.119:6789` is almost certainly running the example config.

This means:
- The stream IS monitored ✓
- But many devs share this same example stream → mingled test traffic
- The KV node depends on its `zgs_node_urls` peer list to fetch segments

### Why `version: 0` matters

Per RPC convention, `version: 0` = "I have not indexed any write to this key."
A real value comes back as `version >= 1`. So this is NOT a key-encoding bug
on the read side — it's a "no record exists in this KV node's DB" signal.

### KV indexing pipeline (where lag/failures happen)

After tx confirms on-chain, the `zgs_kv` process must:

1. See the log event (chain RPC polling)
2. Fetch the data segment from a storage node in its `zgs_node_urls`
3. Decode the stream KV operation
4. Write to its RocksDB (`kv_db_dir`)

If step 2 fails because no peer in `zgs_node_urls` has the segment, the KV node
will silently never index it. **This is the most likely cause** given:

- `replicas = 1` in their `Batcher(1, ...)` → segment landed on exactly one storage node
- The public KV node has a fixed `zgs_node_urls` list
- If those don't overlap → permanent indexing miss

This fits all observed symptoms.

---

## Things to ask Decosta to check (copy-pasteable)

Send this as the response. Each item is independently actionable.

---

### Reply (copy-paste)

> Yes, this is a sync issue, and most likely a **replication-vs-peering mismatch**
> rather than encoding or permissions. Quick rundown of what's happening and how
> to fix it.
>
> **Why `version: 0` confirms the diagnosis**
>
> A KV node returns `version: 0` only when it has zero indexed writes for that
> key. Real values come back with `version >= 1`. So your read path is correct;
> the KV node simply doesn't have your write in its DB.
>
> **Why the KV node may never index your write**
>
> KV nodes (`zgs_kv`) are separate from storage nodes. After your tx confirms,
> the KV node has to:
> 1. See the chain log event
> 2. Download the data segment from a storage node in its configured `zgs_node_urls`
> 3. Decode the stream op
> 4. Write to its RocksDB
>
> You called `new Batcher(1, nodes, flow, rpcUrl)` — replicas = 1 — so your
> segment is on exactly **one** storage node. The public KV node has a fixed
> peer list. If that one storage node isn't in the KV node's peer list, the
> segment will never be indexed. Silent failure mode. This fits all your symptoms
> (stream is monitored, old entries from other projects index fine, your write
> never appears).
>
> **Things to check / try, in order:**
>
> **1. Bump replicas to 3 (most likely fix)**
>
> ```ts
> // before
> const batcher = new Batcher(1, nodes, flow, rpcUrl);
>
> // after
> const batcher = new Batcher(3, nodes, flow, rpcUrl);
> ```
>
> Higher replica count → more storage nodes hold the segment → much higher chance
> the public KV node can pull it from a peer.
>
> **2. Wait and poll for 5–10 minutes**
>
> Even with good replication, KV indexing on testnet can lag the chain by minutes.
> Poll, don't expect immediate consistency:
>
> ```ts
> async function waitForKv(client, streamId, key, timeoutMs = 600_000) {
>   const start = Date.now();
>   while (Date.now() - start < timeoutMs) {
>     const v = await client.getValue(streamId, ethers.encodeBase64(key));
>     if (v && v.version > 0) return v;
>     await new Promise(r => setTimeout(r, 15_000));
>   }
>   throw new Error("KV value not indexed within timeout");
> }
> ```
>
> **3. Verify your read-side encoding matches the SDK example**
>
> Per the SDK docs (`storage/sdk.md`), the canonical pattern is to pass a
> **base64 string** to `KvClient.getValue`, not a raw `Uint8Array`:
>
> ```ts
> import { ethers } from 'ethers';
>
> const keyBytes = Uint8Array.from(Buffer.from(walletAddress.toLowerCase(), 'utf-8'));
> const value = await kvClient.getValue(streamId, ethers.encodeBase64(keyBytes));
> ```
>
> If you're passing `utf8(walletAddress)` (a `Uint8Array`) directly into
> `getValue` and your SDK version expects a base64 string, you'll get an empty
> result silently. Worth a quick double-check — the package was recently renamed
> from `@0glabs/0g-ts-sdk` to `@0gfoundation/0g-ts-sdk`; confirm you're on the
> latest version (`npm ls @0gfoundation/0g-ts-sdk`).
>
> **4. Confirm key consistency on the write path**
>
> Make sure both write and read use the *exact same byte sequence*. If `walletAddress`
> is `"0xABC..."`, `.toLowerCase()` it consistently both places. UTF-8 encoding of
> `"0xabc..."` is 42 bytes; if you ever switch to `ethers.getBytes(walletAddress)`
> it becomes 20 bytes — different key.
>
> ```ts
> // Both write and read MUST use the same line:
> const key = Uint8Array.from(Buffer.from(walletAddress.toLowerCase(), 'utf-8'));
> ```
>
> **5. Sanity test against a different stream / different KV node**
>
> Stream `0x...f2bd` is from our public example config — many projects share it.
> Pick a fresh random stream ID, write to it, and read back. If the new stream
> works but f2bd doesn't, you'll know it's stream-specific (unlikely but worth
> ruling out).
>
> ```ts
> // Generate a fresh 32-byte stream ID
> const streamId = ethers.hexlify(ethers.randomBytes(32));
> ```
>
> Also try a different KV node if the indexer returns multiple, to rule out
> single-node lag.
>
> **6. If guaranteed indexing matters: run your own KV node**
>
> The robust solution is to run your own `zgs_kv` (setup guide:
> [`run-a-node/storage-node.md`](https://docs.0g.ai/run-a-node/storage-node) — Storage KV section).
> Point its `zgs_node_urls` at the same storage nodes the indexer returned to
> your batcher (you have the `nodes` array — just `getStatus()` each and use
> their addresses). Eliminates the peering-gap problem entirely.
>
> ```toml
> # config.toml — your own zgs_kv
> stream_ids = ["<your-stream-id-without-0x>"]
> log_sync_start_block_number = 0   # or earlier than your first write block
> zgs_node_urls = "http://<node1>:5678,http://<node2>:5678,http://<node3>:5678"
> rpc_listen_address = "0.0.0.0:6789"
> ```
>
> **7. Things you do NOT need to do**
>
> - You don't need to "register as a writer" — streams are open-write by design.
> - You don't need to wait for any kind of finalization beyond chain confirmation
>   plus replication + KV index sync.
>
> **TL;DR ranking of likely cause**
>
> 1. (~70%) Replicas=1 + KV node peer mismatch → segment never reachable
> 2. (~15%) Indexing lag, just needs a few minutes
> 3. (~10%) Read-side base64 encoding skipped (passing raw bytes where SDK expects base64)
> 4. (~5%) Key encoding mismatch (utf-8 vs raw bytes between write and read)
>
> Try (1) first — change `new Batcher(1, ...)` to `new Batcher(3, ...)`, write again,
> wait 5 minutes, retry the read. If that doesn't fix it, run a local `zgs_kv`
> pointed at the storage nodes from your batcher's `nodes` array.

---

## Quick reference: checklist for them

- [ ] Increase `Batcher` replicas from 1 to 3+
- [ ] Wait 5–10 min and poll, not immediate read
- [ ] Use `ethers.encodeBase64(keyBytes)` when calling `KvClient.getValue` (not raw `Uint8Array`)
- [ ] Lowercase wallet address consistently on both write and read
- [ ] Confirm SDK version: `npm ls @0gfoundation/0g-ts-sdk` (post-rename from `@0glabs/...`)
- [ ] Try a fresh random stream ID instead of shared example `f2bd`
- [ ] Try other KV nodes from the indexer's node list
- [ ] If guaranteed: run own `zgs_kv` with `zgs_node_urls` pointed at the storage nodes the batcher used

## Internal followup for docs

Worth fixing/clarifying in our docs:
- The SDK example at `storage/sdk.md:284-313` shows `Batcher(1, ...)` without flagging that 1 replica is fragile for KV indexing. Consider adding a note recommending 3+ for KV writes that need to be readable via public KV nodes.
- The example `stream_ids = [..., f2bd, ...]` in `storage-node.md:556` is being copy-pasted by builders who think they're getting a "starter stream." It's a footgun — multiple projects writing to the same stream. Consider using clearly-labeled placeholder values like `<your-stream-id>` or document that example streams are shared.
