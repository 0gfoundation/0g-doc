---
sidebar_position: 5
description: "Guide to running a 0G archival node for complete historical blockchain data storage, including setup and deployment steps."
---

# Archival Node
---

Running an Archival node for the **0G Galileo Testnet** means providing complete historical data storage and access for the network, maintaining the full blockchain history and state.

:::info **What You'll Need**
- Linux system with sufficient disk space for archive data
- `lz4` compression tool installed
- Public IP address for node connectivity
- Stable internet connection
:::

## Hardware Requirements

| Component  | Requirement |
|------------|-------------|
| Memory     | 64 GB       |
| CPU        | 8 cores     |
| Disk       | Large NVME SSD (for full archive data) |
| Bandwidth  | 100 MBps for Download / Upload |

## Prerequisites

### Required Files

1. **Node Package**: [galileo-archive.tar.gz](/binaries/galileo-archive.tar.gz)

### System Requirements

- Linux system with sufficient disk space for archive data
- `lz4` compression tool installed
- Public IP address for node connectivity

## Setup Guide

### 1. Download Node Package

Download the node package: [galileo-archive.tar.gz](/binaries/galileo-archive.tar.gz)

### 2. Extract Node Package

Unzip the file to your home directory

## Deployment Steps

### 1. Copy Files and Set Permissions

```bash
cd galileo-v1.2.0
cp -r 0g-home {your data path}
sudo chmod 777 ./bin/geth
sudo chmod 777 ./bin/0gchaind
```

### 2. Initialize Geth

```bash
./bin/geth init --state.scheme=hash --db.engine=pebble --datadir /{your data path}/0g-home/geth-home ./genesis.json
```

### 3. Initialize 0gchaind with Temporary Directory

```bash
./bin/0gchaind init {node name} --home /{your data path}/tmp
```

### 4. Copy Node Files to 0gchaind Home

```bash
cp /{your data path}/tmp/data/priv_validator_state.json /{your data path}/0g-home/0gchaind-home/data/
cp /{your data path}/tmp/config/node_key.json /{your data path}/0g-home/0gchaind-home/config/
cp /{your data path}/tmp/config/priv_validator_key.json /{your data path}/0g-home/0gchaind-home/config/
```

### 5. Start 0gchaind

```bash
cd galileo-v1.2.0
nohup ./bin/0gchaind start \
    --rpc.laddr tcp://0.0.0.0:26657 \
    --chaincfg.chain-spec devnet \
    --chaincfg.kzg.trusted-setup-path=kzg-trusted-setup.json \
    --chaincfg.engine.jwt-secret-path=jwt-secret.hex \
    --chaincfg.kzg.implementation=crate-crypto/go-kzg-4844 \
    --chaincfg.block-store-service.enabled \
    --chaincfg.node-api.enabled \
    --chaincfg.node-api.logging \
    --chaincfg.node-api.address 0.0.0.0:3500 \
    --pruning=nothing \
    --home /{your data path}/0g-home/0gchaind-home \
    --p2p.seeds 85a9b9a1b7fa0969704db2bc37f7c100855a75d9@8.218.88.60:26656 \
    --p2p.external_address {your node ip}:26656 > /{your data path}/0g-home/log/0gchaind.log 2>&1 &
```

### 6. Start Geth

```bash
cd galileo-v1.2.0
nohup ./bin/geth \
    --config geth-archive-config.toml \
    --nat extip:{your node ip} \
    --bootnodes enode://de7b86d8ac452b1413983049c20eafa2ea0851a3219c2cc12649b971c1677bd83fe24c5331e078471e52a94d95e8cde84cb9d866574fec957124e57ac6056699@8.218.88.60:30303 \
    --datadir /{your data path}/0g-home/geth-home \
    --state.scheme=hash \
    --gcmode archive \
    --networkid 16601 > /{your data path}/0g-home/log/geth.log 2>&1 &
```

### 7. Verify Setup

Check the logs to ensure the node is running properly:

```bash
# Check Geth logs
tail -f /{your data path}/0g-home/log/geth.log

# Check 0gchaind logs
tail -f /{your data path}/0g-home/log/0gchaind.log
```

:::success **Success Indicators**
- 0gchaind should show "Committed state" messages
- Geth should show archive mode synchronization
- No error messages in either log
:::

## Important Configuration Notes

### Variables to Replace

- `{your data path}`: Your chosen data directory path
- `{node name}`: Your chosen node name
- `{your node ip}`: Your server's public IP address

### Directory Structure

After setup, your directory structure should look like:

```
{your data path}/
└── 0g-home/
    ├── geth-home/
    ├── 0gchaind-home/
    │   ├── config/
    │   │   ├── node_key.json
    │   │   └── priv_validator_key.json
    │   └── data/
    │       └── priv_validator_state.json
    └── log/
        ├── 0gchaind.log
        └── geth.log
```

### Network Ports

Ensure the following ports are open:

- **26657**: 0gchaind RPC
- **26656**: 0gchaind P2P
- **3500**: Node API
- **30303**: Geth network

## Archive Node Benefits

Archive nodes provide several key benefits to the 0G network:

- **Complete Historical Data**: Full access to all historical blockchain data and state
- **Enhanced Query Capabilities**: Support for complex historical queries and analytics
- **Network Resilience**: Backup and redundancy for the network's historical data
- **Developer Support**: Essential for applications requiring historical blockchain data

:::warning **Storage Requirements**
Archive nodes require significantly more storage space than regular nodes as they maintain the complete blockchain history. Ensure adequate disk space before setup.
:::