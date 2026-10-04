---
id: migrate-geth-to-reth
title: Migrating from geth to reth
sidebar_position: 5
description: "Run a 0G node with reth: geth vs reth comparison, a fresh reth setup, and a step-by-step geth to reth migration."
keywords: [0g, reth, geth, execution client, validator, migration, node]
---

# Migrating from geth to reth

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

A 0G node runs two clients in tandem: a **consensus layer (CL)**, `0gchaind`, and an **execution layer (EL)**. The execution layer has historically been **geth**; 0G is now standardizing on **reth** as the recommended execution client.

:::info This migration is optional
You are **not** required to move to reth to stay on the network — the official release packages continue to ship a geth binary, and a geth node remains a fully valid node. reth is the **recommended** client going forward for better performance, but you can migrate on your own schedule. Do **not** rush a migration to meet an unrelated upgrade deadline; plan it as its own maintenance window.
:::

## Why reth

| | geth (`0g-geth`) | reth (`0g-reth`) |
| --- | --- | --- |
| Language | Go | Rust |
| On-disk database | LevelDB | MDBX |
| Status on 0G | Supported | **Recommended going forward** |
| Sync & storage | Baseline | Faster sync, more efficient storage layout |
| Switching cost | — | EL data must be rebuilt (no in-place conversion) |

What **does not** change when you migrate:

- The **consensus layer** (`0gchaind` / `0gchaind-home`) is untouched — your validator keys, consensus state, and node identity are all preserved.
- Your chain data is preserved at the consensus level; only the **execution-layer database** is rebuilt.

:::warning Validator keys and double-signing
The consensus layer holds your validator key. During any migration you will stop and restart `0gchaind`. **Never run the same `priv_validator_key.json` on two machines at once** — fully stop the old process before starting the new one, or you risk a [double-sign slashing penalty](/run-a-node/validator-node#slashing).
:::

This guide covers both **Testnet (Galileo)** and **Mainnet (Aristotle)** and has two parts:

1. **[Fresh reth setup](#fresh-reth-setup)** — for a brand-new node, or one you are rebuilding from scratch.
2. **[Migrating an existing geth node to reth](#migrating-an-existing-geth-node-to-reth)** — to switch an already-running node while preserving consensus state.

The node runs:

- **Consensus Layer (CL):** `0gchaind`
- **Execution Layer (EL):** `reth`

---

## Fresh reth setup

### Hardware requirements

| Component | Requirement |
| --- | --- |
| Memory | 64 GB |
| CPU | 8 cores |
| Disk | 4 TB NVME SSD |
| Bandwidth | 100 MBps Download / Upload |

### Required files

The binaries and configuration files below ship in the official release package. After extracting the release, confirm they are present in your working directory:

| File | Description |
| --- | --- |
| `bin/0gchaind` | Consensus layer binary |
| `bin/reth` | Execution layer binary |
| `0g-home/0gchaind-home/config/genesis.json` | CL genesis configuration |
| `geth-genesis.json` | EL genesis configuration |
| `kzg-trusted-setup.json` | KZG trusted setup for the CL |

One more file is required but is **not** in the package:

| File | Description |
| --- | --- |
| `jwt.hex` | Shared secret authenticating the CL to the EL engine API. You generate it, see the initialize step below. |

`jwt.hex` is local to your node rather than a network value, so there is no official copy to download. If you already run a 0G node, reuse its existing `jwt.hex`. The secret is not tied to the execution client, so the one you used with geth works unchanged with reth.

<Tabs>
  <TabItem value="mainnet" label="Mainnet (Aristotle)" default>

### Download the package (Mainnet)

```bash
wget -O aristotle.tar.gz https://github.com/0gfoundation/0gchain-Aristotle/releases/download/v1.0.7/aristotle-v1.0.7.tar.gz
tar -xzvf aristotle.tar.gz -C ~
cd ~/aristotle-v1.0.7
```

:::note Version Information
Latest Aristotle mainnet release: v1.0.7. It is an RPC-only release that corrects `eth_estimateGas` on reth and changes only the `reth` binary, so `geth` and `0gchaind` are identical to v1.0.6. Check the [releases page](https://github.com/0gfoundation/0gchain-Aristotle/releases) for newer versions.
:::

The consensus client requires an **Ethereum mainnet** RPC endpoint to read Symbiotic restaking contract state (e.g. QuickNode, Alchemy, Infura):

```bash
export ETH_RPC_URL="https://<your-ethereum-mainnet-rpc-endpoint>"
```

### Initialize the node (Mainnet)

:::warning Run once
Run this once before the first start. Do not re-run on an already-initialized node — it will overwrite existing state.
:::

Set the data directory:

```bash
export DATA_DIR=/data/0g-home   # or your preferred path
mkdir -p $DATA_DIR/log
```

Initialize the consensus layer (`0gchaind`):

```bash
./bin/0gchaind init 0G-mainnet-aristotle-rpc \
    --chain-id 0G-mainnet-aristotle \
    --chaincfg.chain-spec=mainnet \
    --home $DATA_DIR/0gchaind-home
```

| Parameter | Description |
| --- | --- |
| `0G-mainnet-aristotle-rpc` | Your node's display name (moniker). Customize as needed. |
| `--chain-id 0G-mainnet-aristotle` | Chain identifier (mainnet EVM chain ID is `16661`). |
| `--chaincfg.chain-spec=mainnet` | Loads mainnet consensus parameters. Required for mainnet validators. |
| `--home` | CL data directory. |

Copy the genesis file into the CL config directory:

```bash
cp -f 0g-home/0gchaind-home/config/genesis.json $DATA_DIR/0gchaind-home/config
```

Generate the JWT secret and place it in the working directory. The CL and EL must read the
same file, and the start commands below pass a relative path, so it has to sit next to `bin/`:

```bash
./bin/0gchaind jwt generate --home $DATA_DIR/0gchaind-home --chaincfg.chain-spec mainnet

cp -f $DATA_DIR/0gchaind-home/config/jwt.hex ./
```

:::note Migrating an existing node
Reuse your current `jwt.hex` instead of generating a new one. Copy it into the working
directory in place of the commands above.
:::

Initialize the execution layer (`reth`):

```bash
./bin/reth init --chain geth-genesis.json \
    --datadir $DATA_DIR/reth-home
```

Verify both data directories were created:

```bash
ls $DATA_DIR/0gchaind-home/config/
# Expected: app.toml  client.toml  config.toml  genesis.json  jwt.hex  node_key.json

ls $DATA_DIR/reth-home/
# Expected: db/  and other reth state directories
```

### Start the node (Mainnet)

**Start reth first, wait for the engine API to be ready, then start `0gchaind`.**

```bash
export DATA_DIR=/data/0g-home
export ETH_RPC_URL="https://<your-ethereum-mainnet-rpc-endpoint>"
export MY_NODE_IP="<your-public-ip>"   # e.g. 1.2.3.4
```

Start the execution layer (reth):

```bash
nohup ./bin/reth node \
    --chain geth-genesis.json \
    --http \
    --http.addr 0.0.0.0 \
    --http.api eth,net,admin \
    --authrpc.addr 0.0.0.0 \
    --authrpc.jwtsecret jwt.hex \
    --datadir $DATA_DIR/reth-home \
    --ipcpath $DATA_DIR/reth-home/eth-engine.ipc \
    --engine.persistence-threshold 0 \
    --engine.memory-block-buffer-target 0 \
    --bootnodes="enode://2bf74c837a98c94ad0fa8f5c58a428237d2040f9269fe622c3dbe4fef68141c28e2097d7af6ebaa041194257543dc112514238361a6498f9a38f70fd56493f96@8.221.140.134:30303" \
    --nat extip:$MY_NODE_IP \
    >> $DATA_DIR/log/reth.log 2>&1 &
```

Confirm the engine API is listening before starting the CL:

```bash
ss -tlnp | grep 8551
```

Start the consensus layer (`0gchaind`):

```bash
nohup ./bin/0gchaind start \
    --rpc.laddr tcp://0.0.0.0:26657 \
    --chaincfg.kzg.trusted-setup-path=kzg-trusted-setup.json \
    --chaincfg.engine.jwt-secret-path=jwt.hex \
    --chaincfg.block-store-service.enabled \
    --chaincfg.restaking.enabled \
    --chaincfg.restaking.symbiotic-get-logs-block-range 1 \
    --chaincfg.restaking.symbiotic-rpc-dial-url $ETH_RPC_URL \
    --home $DATA_DIR/0gchaind-home \
    --p2p.external_address $MY_NODE_IP:26656 \
    >> $DATA_DIR/log/0gchaind.log 2>&1 &
```

  </TabItem>
  <TabItem value="testnet" label="Testnet (Galileo)">

### Download the package (Testnet)

```bash
wget -O galileo.tar.gz https://github.com/0gfoundation/0gchain-NG/releases/latest/download/Galileo-latest.tar.gz
tar -xzvf galileo.tar.gz -C ~
cd Galileo-<version>
```

:::note Version Information
Check the [Galileo releases page](https://github.com/0gfoundation/0gchain-NG/releases) for the latest version tag, and confirm the package contains `bin/reth`.
:::

The consensus client requires an Ethereum **HoleSky testnet** RPC endpoint to read Symbiotic restaking contract state (e.g. QuickNode, Alchemy, Infura):

```bash
export ETH_RPC_URL="https://<your-holesky-rpc-endpoint>"
```

### Initialize the node (Testnet)

:::warning Run once
Run this once before the first start. Do not re-run on an already-initialized node — it will overwrite existing state.
:::

Set the data directory:

```bash
export DATA_DIR=/data/0g-home   # or your preferred path
mkdir -p $DATA_DIR/log
```

Initialize the consensus layer (`0gchaind`):

```bash
./bin/0gchaind init 0G-testnet-galileo-rpc \
    --chain-id 0G-testnet-galileo \
    --chaincfg.chain-spec=testnet \
    --home $DATA_DIR/0gchaind-home
```

Copy the genesis file into the CL config directory:

```bash
cp -f 0g-home/0gchaind-home/config/genesis.json $DATA_DIR/0gchaind-home/config
```

Generate the JWT secret and place it in the working directory. The CL and EL must read the
same file, and the start commands below pass a relative path, so it has to sit next to `bin/`:

```bash
./bin/0gchaind jwt generate --home $DATA_DIR/0gchaind-home --chaincfg.chain-spec testnet

cp -f $DATA_DIR/0gchaind-home/config/jwt.hex ./
```

:::note Migrating an existing node
Reuse your current `jwt.hex` instead of generating a new one. Copy it into the working
directory in place of the commands above.
:::

Initialize the execution layer (`reth`):

```bash
./bin/reth init --chain geth-genesis.json \
    --datadir $DATA_DIR/reth-home
```

### Start the node (Testnet)

```bash
export DATA_DIR=/data/0g-home
export ETH_RPC_URL="https://<your-holesky-rpc-endpoint>"
export MY_NODE_IP="<your-public-ip>"   # e.g. 1.2.3.4
```

Start the consensus layer (`0gchaind`):

```bash
nohup ./bin/0gchaind start \
    --rpc.laddr tcp://0.0.0.0:26657 \
    --chaincfg.kzg.trusted-setup-path=kzg-trusted-setup.json \
    --chaincfg.engine.jwt-secret-path=jwt.hex \
    --chaincfg.block-store-service.enabled \
    --chaincfg.restaking.enabled \
    --chaincfg.restaking.symbiotic-get-logs-block-range 1000 \
    --chaincfg.restaking.symbiotic-rpc-dial-url $ETH_RPC_URL \
    --home $DATA_DIR/0gchaind-home \
    --p2p.external_address $MY_NODE_IP:26656 \
    >> $DATA_DIR/log/0gchaind.log 2>&1 &
```

Wait until the CL log shows it initializing or connecting to peers, then start the execution layer (reth):

```bash
nohup ./bin/reth node \
    --chain geth-genesis.json \
    --http \
    --http.addr 0.0.0.0 \
    --http.api eth,net,admin \
    --authrpc.addr 0.0.0.0 \
    --authrpc.jwtsecret jwt.hex \
    --datadir $DATA_DIR/reth-home \
    --ipcpath $DATA_DIR/reth-home/eth-engine.ipc \
    --engine.persistence-threshold 0 \
    --engine.memory-block-buffer-target 0 \
    --bootnodes="enode://4f70c6c95329427be4af2a233c9c2305896d37c21bca8c21e7efc36634a862bd5b96b0c4a8a9bb5787b53eb01472fe895aad170d0923f6ea56ebc5f94825c4f7@34.105.23.36:30303" \
    --nat extip:$MY_NODE_IP \
    >> $DATA_DIR/log/reth.log 2>&1 &
```

  </TabItem>
</Tabs>

### Key startup parameters

| Parameter | Description |
| --- | --- |
| `--chain geth-genesis.json` | EL genesis file (must match init). |
| `--http` / `--http.addr` / `--http.api` | Enables JSON-RPC over HTTP, exposed on all interfaces. |
| `--authrpc.addr` / `--authrpc.jwtsecret` | Engine API (CL–EL communication) address and JWT secret. Must match the `jwt.hex` used by the CL. |
| `--datadir` | EL data directory (must match init). |
| `--ipcpath` | IPC socket path for local engine API access. |
| `--engine.persistence-threshold 0` | Persist all blocks immediately. |
| `--engine.memory-block-buffer-target 0` | Minimize in-memory block buffering. |
| `--bootnodes` | Official network bootnode. Do not modify. |
| `--nat extip:$MY_NODE_IP` | Your node's public IP for NAT traversal. Replace with your own IP. |

### Verify the node

```bash
# CL logs — look for "Committed state" or peer connection messages
tail -f $DATA_DIR/log/0gchaind.log

# EL logs — look for "Starting consensus engine" or syncing messages
tail -f $DATA_DIR/log/reth.log

# Sync status — fully synced when "catching_up" is false
curl http://localhost:26657/status | jq '.result.sync_info'
```

---

## Migrating an existing geth node to reth

This section applies when a node is already running with `0gchaind + geth` and you want to switch the EL to reth.

### Background

geth and reth use incompatible database formats (LevelDB vs MDBX). **There is no in-place migration path** — the EL data directory must be rebuilt from scratch. The approach is to export geth's chain data as an RLP file and import it into reth.

| Component | Impact |
| --- | --- |
| CL (`0gchaind-home`) | ✅ No change, data is preserved |
| EL (`geth-home`) | ❌ Replaced by `reth-home` |
| Downtime | Node will miss blocks during migration |

### Known limitations

Before proceeding, be aware of the following:

- **geth and reth P2P incompatibility:** reth cannot establish peer connections with geth nodes. `connected_peers=0` is expected until a reth-compatible peer is available on the network.
- **`reth import` does not support resume:** if the import is interrupted, it cannot resume. It will fail with `block number X does not match parent block number Y`. Use the trimming script (Step 6) to re-export from the correct height.
- **State root mismatches:** reth may reject certain blocks from the geth export with `mismatched block state root`. This is a compatibility issue between 0G's geth fork and reth fork. If this occurs, **report the block number and state root values to the 0G development team** — do not attempt to skip the block manually.
- **Do not start `0gchaind` until reth has fully synced.** Starting the CL while reth is still syncing will cause a `-38002 Invalid forkchoice state` panic.

### Step 1: Back up existing data

```bash
BACKUP_DIR="$DATA_DIR/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# CL data (small, required for rollback)
cp -r $DATA_DIR/0gchaind-home $BACKUP_DIR/0gchaind-home

# geth EL data (large, skip if disk space is tight —
# but without this backup you cannot roll back to geth)
cp -r $DATA_DIR/geth-home $BACKUP_DIR/geth-home
```

### Step 2: Get the current chain head, then stop the node

**Read the current chain head from geth logs while geth is still running:**

```bash
grep -i "number=" $DATA_DIR/log/geth.log | tail -5
```

Look for a line like `number=39048765` — that is the current head. Note it down for Step 3.

Then stop CL first, then EL:

```bash
pkill -f 0gchaind
while pgrep -f 0gchaind > /dev/null; do echo "Waiting for 0gchaind..."; sleep 3; done

pkill -f geth
while pgrep -f geth > /dev/null; do echo "Waiting for geth..."; sleep 3; done

pgrep -f 0gchaind || echo "CL stopped"
pgrep -f geth || echo "EL stopped"
```

### Step 3: Export geth chain data

Export the full chain from block 1 to the current chain head. Both the `<first>` and `<last>` block numbers are required by geth export (replace `<chain_head>` with the value from Step 2):

```bash
./bin/geth export \
  --datadir $DATA_DIR/geth-home \
  /data/0g-home/chain-export.rlp \
  1 <chain_head>
```

:::note
This takes a long time depending on chain height and disk speed. Run it in a `screen` or `tmux` session.
:::

### Step 4: Clear the geth data directory

```bash
rm -rf $DATA_DIR/geth-home
```

:::warning Destructive step
Only run this after confirming the Step 1 backup is complete.
:::

### Step 5: Initialize reth

Confirm the new release package contains `./bin/reth`, then initialize:

```bash
./bin/reth init --chain geth-genesis.json \
    --datadir $DATA_DIR/reth-home
```

### Step 6: Trim the RLP export (skip the genesis block)

reth cannot import block 0 (genesis) from the RLP file — it conflicts with the genesis already written during `reth init`. Use the following script to strip block 0 from the export file. The same script can trim to any arbitrary start height, which is needed if the import is interrupted and must resume (see Step 7).

Save as `trim_export.py`:

```python
import sys

input_file = "/data/0g-home/chain-export.rlp"
output_file = "/data/0g-home/chain-export-from-{start}.rlp"

start_block = int(sys.argv[1]) if len(sys.argv) > 1 else 1
output_file = output_file.format(start=start_block)

print(f"Trimming blocks before {start_block}, output: {output_file}")

def read_rlp_length(f):
    first = f.read(1)
    if not first:
        return None, 0
    b = first[0]
    if b < 0xc0:
        return None, 0
    elif b <= 0xf7:
        return first, b - 0xc0
    else:
        len_bytes_count = b - 0xf7
        len_bytes = f.read(len_bytes_count)
        return first + len_bytes, int.from_bytes(len_bytes, 'big')

def get_block_number(block_data):
    offset = 0
    b = block_data[offset]
    offset += 1 if b <= 0xf7 else 1 + (b - 0xf7)
    b = block_data[offset]
    offset += 1 if b <= 0xf7 else 1 + (b - 0xf7)
    for _ in range(8):
        b = block_data[offset]
        if b <= 0x80:
            offset += 1
        elif b <= 0xb7:
            offset += 1 + (b - 0x80)
        elif b <= 0xbf:
            n = b - 0xb7
            offset += 1 + n + int.from_bytes(block_data[offset+1:offset+1+n], 'big')
        elif b <= 0xf7:
            offset += 1 + (b - 0xc0)
        else:
            n = b - 0xf7
            offset += 1 + n + int.from_bytes(block_data[offset+1:offset+1+n], 'big')
    b = block_data[offset]
    if b == 0x80: return 0
    if b < 0x80: return b
    length = b - 0x80
    return int.from_bytes(block_data[offset+1:offset+1+length], 'big')

block_count = 0
skipped = 0

with open(input_file, "rb") as fin, open(output_file, "wb") as fout:
    while True:
        header_bytes, length = read_rlp_length(fin)
        if header_bytes is None:
            break
        block_body = fin.read(length)
        if len(block_body) < length:
            break
        full_block = header_bytes + block_body
        try:
            block_number = get_block_number(full_block)
        except Exception as e:
            print(f"Warning: could not parse block at index {block_count + skipped}, writing anyway: {e}")
            fout.write(full_block)
            block_count += 1
            continue
        if block_number < start_block:
            skipped += 1
            if skipped % 100000 == 0:
                print(f"Skipped {skipped} blocks (current: {block_number})...")
        else:
            fout.write(full_block)
            block_count += 1
            if block_count % 100000 == 0:
                print(f"Written {block_count} blocks (current: {block_number})...")

print(f"Done. Skipped {skipped}, wrote {block_count} blocks to {output_file}")
```

Run (skip genesis only):

```bash
python3 trim_export.py 1
```

Run (resume from a specific height, e.g. after an interrupted import):

```bash
python3 trim_export.py <resume_height>
```

:::note
The script processes the file as a stream and uses minimal memory. The output filename includes the start block, e.g. `chain-export-from-1.rlp`.
:::

### Step 7: Import into reth

Run in the background:

```bash
nohup ./bin/reth import \
  --chain geth-genesis.json \
  --datadir $DATA_DIR/reth-home \
  /data/0g-home/chain-export-from-1.rlp \
  >> $DATA_DIR/log/reth-import.log 2>&1 &
```

Monitor progress:

```bash
tail -f $DATA_DIR/log/reth-import.log
```

**If the import fails mid-way** with `block number X does not match parent block number Y`, the database has partially written data up to height Y. Re-trim the export from Y+1 and re-run:

```bash
# Check what height reth rolled back to
grep "latest_block" $DATA_DIR/log/reth-import.log | tail -3

# Re-trim from that height
python3 trim_export.py <Y+1>

# Re-run import with the new trimmed file
nohup ./bin/reth import \
  --chain geth-genesis.json \
  --datadir $DATA_DIR/reth-home \
  /data/0g-home/chain-export-from-<Y+1>.rlp \
  >> $DATA_DIR/log/reth-import.log 2>&1 &
```

**If the import fails with `mismatched block state root`,** reth's EVM execution produced a different state root than geth recorded — a code-level incompatibility in 0G's fork. Record the failing block number and state root values from the log and report to the 0G development team. Do not attempt to skip the block manually.

### Step 8: Verify the import is complete

Once the import finishes, confirm reth's block height matches the chain head **before** starting `0gchaind`:

```bash
# Check reth height
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  | jq -r '.result' | xargs printf "%d\n"

# Check current chain head (testnet endpoint shown; use your network's public RPC)
curl -s -X POST https://evmrpc-testnet.0g.ai \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  | jq -r '.result' | xargs printf "%d\n"
```

The two values should be equal or within a few blocks. If reth is still behind, it will catch up via P2P after `0gchaind` is started.

:::danger Wait for reth to sync
Do **not** proceed until reth height is at or near chain head. Starting `0gchaind` while reth is still syncing will cause a `-38002 Invalid forkchoice state` panic.
:::

### Step 9: Start reth, then 0gchaind

Start reth using the start command from the [Fresh reth setup](#start-the-node-mainnet) section for your network, confirm the engine API is listening (`ss -tlnp | grep 8551`), then start `0gchaind`.

```bash
tail -f $DATA_DIR/log/0gchaind.log
# Expected: "Committed state" messages, no "-38002" errors
```

### Rollback to geth (if migration fails)

If the migration fails and you need to restore geth:

```bash
# Stop all processes
pkill -f 0gchaind
pkill -f reth

# Restore geth data from backup
rm -rf $DATA_DIR/geth-home
cp -r $BACKUP_DIR/geth-home $DATA_DIR/geth-home

# Start geth and 0gchaind using the previous startup commands
```

---

## Troubleshooting

**CL fails to start with "missing priv_validator_state.json"** — create an empty state file:

```bash
echo '{}' > $DATA_DIR/0gchaind-home/data/priv_validator_state.json
```

**EL and CL not communicating (engine API errors)** — confirm `jwt.hex` in the working directory is the same file used by both `--chaincfg.engine.jwt-secret-path` and `--authrpc.jwtsecret`. They must be identical.

**No peers connecting** — ensure port `26656` (CL P2P) and port `30303` (EL P2P) are open on your firewall, and that `--p2p.external_address` / `--nat extip` reflect your correct public IP. Note that reth cannot peer with geth nodes.

**`-38002 Invalid forkchoice state`** — reth is still syncing when `0gchaind` started. Stop `0gchaind`, wait for reth to reach chain head, then restart `0gchaind`.

---

## Reference

- [Validator Node guide](/run-a-node/validator-node)
- [Aristotle release page](https://github.com/0gfoundation/0gchain-Aristotle/releases)
- [Galileo release page](https://github.com/0gfoundation/0gchain-NG/releases)
