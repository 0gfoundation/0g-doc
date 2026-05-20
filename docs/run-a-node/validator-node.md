---
sidebar_position: 4
description: "Guide to running a 0G validator node — secure the network, process transactions, and earn rewards by staking 0G tokens."
---

# Validator Node
---

Running a Validator node means providing validator services for the network, processing transactions and maintaining consensus.

:::info **What You'll Need**
- Linux/macOS system with adequate hardware
- Stable internet connection
- Ethereum RPC endpoint (mainnet for Aristotle, HoleSky testnet for Galileo)
:::

## Hardware Requirements

| Component  | Mainnet (Aristotle) | Testnet (Galileo) |
|------------|---------|----------|
| Memory     | 64 GB   | 64 GB    |
| CPU        | 8 cores | 8 cores  |
| Disk       | 1 TB NVME SSD | 4 TB NVME SSD |
| Bandwidth  | 100 MBps for Download / Upload | 100 MBps for Download / Upload |

## Restaking RPC Configuration

- **Validator Nodes**: When running your consensus client, add the following flags to enable restaking and configure the Symbiotic RPC:

```bash
--chaincfg.restaking.enabled \
--chaincfg.restaking.symbiotic-rpc-dial-url ${ETH_RPC_URL} \
--chaincfg.restaking.symbiotic-get-logs-block-range ${BLOCK_NUM}
```

- **ETH_RPC_URL**: The RPC endpoint for the Symbiotic network.
  - **Mainnet (Aristotle)**: Use an Ethereum Mainnet RPC endpoint (e.g., `https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY`)
  - **Testnet (Galileo)**: Use an Ethereum HoleSky RPC endpoint
- **BLOCK_NUM**: The maximum block number range per call when syncing restaking events. Default is 1. Adjust based on your RPC provider limits.

- **Non-Validator Nodes**: No restaking-related configuration is required; you can keep your current startup parameters unchanged.

This enables staking in Symbiotic contracts on Ethereum (mainnet: Ethereum, testnet: HoleSky) to participate in 0G Chain consensus. Validators must be able to read the Ethereum contract state to generate and verify new blocks. You can run your own node or use a third-party RPC provider such as QuickNode or Infura for `${ETH_RPC_URL}`.

:::tip Non-Validator Nodes
Restaking configuration is NOT required for non-validator nodes. Do not add the `--chaincfg.restaking.*` flags when running non-validator nodes.
:::

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="mainnet" label="Mainnet (Aristotle)" default>

## Mainnet (Aristotle) Setup Guide

### 1. Download Package

Download the latest Aristotle mainnet package:

```bash
wget -O aristotle.tar.gz https://github.com/0gfoundation/0gchain-Aristotle/releases/download/1.0.4/aristotle-v1.0.4.tar.gz
```

:::note Version Information
Latest Aristotle mainnet release: v1.0.4. Check [releases page](https://github.com/0gfoundation/0gchain-Aristotle/releases) for newer versions.
:::

### 2. Extract Package

Extract the Aristotle node package to your home directory:

```bash
tar -xzvf aristotle-v1.0.4.tar.gz -C ~
```

### 3. Create Data Directory and Copy Configuration

Create your data directory and copy the default configuration:

```bash
cd Aristotle-v1.0.4

cp -r 0g-home {your data path}
sudo chmod 777 ./bin/geth
sudo chmod 777 ./bin/0gchaind
```

### 4. Initialize Geth

Initialize the Geth execution client with the genesis configuration:

```bash
./bin/geth init --datadir {your data path}/0g-home/geth-home ./geth-genesis.json
```

**Expected output:** "Successfully wrote genesis state"

### 5. Initialize 0gchaind for Mainnet

Create a temporary initialization with the mainnet chain specification:

```bash
./bin/0gchaind init {node name} --home {your data path}/tmp --chaincfg.chain-spec mainnet
```

⚠️ **Important:** The `--chaincfg.chain-spec mainnet` flag is REQUIRED for validators

### 6. Copy Node Keys and Validator Keys

Copy all necessary keys to the permanent directory:

```bash
cp {your data path}/tmp/data/priv_validator_state.json {your data path}/0g-home/0gchaind-home/data/
cp {your data path}/tmp/config/node_key.json {your data path}/0g-home/0gchaind-home/config/
cp {your data path}/tmp/config/priv_validator_key.json {your data path}/0g-home/0gchaind-home/config/
```

### 7. Generate JWT Authentication Token

Generate a JWT token with mainnet specification for secure communication:

```bash
./bin/0gchaind jwt generate --home {your data path}/0g-home/0gchaind-home --chaincfg.chain-spec mainnet

cp -f {your data path}/0g-home/0gchaind-home/config/jwt.hex ./
```

### 8. Configure Node Name

Update the node moniker in the configuration file:

```bash
sed -i 's/moniker = "0G-mainnet-aristotle-node"/moniker = "{your node name}"/' {your data path}/0g-home/0gchaind-home/config/config.toml
```

### 9. Verify Configuration Files

Ensure all required configuration files are present:

```bash
ls -la {your data path}/0g-home/0gchaind-home/config/
```

**Should display:**
- `app.toml`
- `client.toml`
- `config.toml`
- `genesis.json`
- `jwt.hex`
- `node_key.json`
- `priv_validator_key.json`

### 10. Set Environment Variables

Configure required environment variables for Symbiotic restaking:

```bash
# Set your Ethereum RPC endpoint (mainnet)
export ETH_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"

# Set block range for syncing (adjust based on your RPC limits)
export BLOCK_NUM=1
```

### 11. Start 0gchaind

Launch the 0gchaind consensus client with validator-specific parameters:

```bash
cd Aristotle-v1.0.4

nohup ./bin/0gchaind start \
    --rpc.laddr tcp://0.0.0.0:26657 \
    --chaincfg.kzg.trusted-setup-path=kzg-trusted-setup.json \
    --chaincfg.engine.jwt-secret-path=jwt.hex \
    --chaincfg.block-store-service.enabled \
    --chaincfg.restaking.enabled \
    --chaincfg.restaking.symbiotic-rpc-dial-url ${ETH_RPC_URL} \
    --chaincfg.restaking.symbiotic-get-logs-block-range ${BLOCK_NUM} \
    --home {your data path}/0g-home/0gchaind-home \
    --p2p.external_address {your node ip}:26656 > {your data path}/0g-home/log/0gchaind.log 2>&1 &
```

**Validator-Specific Parameters:**
- `--chaincfg.restaking.enabled`: Enables restaking functionality
- `--chaincfg.restaking.symbiotic-rpc-dial-url`: Ethereum RPC for Symbiotic protocol
- `--chaincfg.restaking.symbiotic-get-logs-block-range`: Block range per sync call

### 12. Start Geth

Launch the Geth execution client:

```bash
cd Aristotle-v1.0.4

nohup ./bin/geth \
    --config geth-config.toml \
    --nat extip:{your node ip} \
    --datadir {your data path}/0g-home/geth-home \
    --networkid 16661 > {your data path}/0g-home/log/geth.log 2>&1 &
```

### 13. Verify Node Status

Check that both services are running correctly:

```bash
# Check 0gchaind logs
tail -f {your data path}/0g-home/log/0gchaind.log

# Check geth logs
tail -f {your data path}/0g-home/log/geth.log
```

  </TabItem>
  <TabItem value="testnet" label="Testnet (Galileo)">

## Testnet (Galileo) Setup Guide

### 1. Download Package

Download the latest Galileo testnet package:

```bash
wget -O galileo.tar.gz https://github.com/0gfoundation/0gchain-NG/releases/download/v3.0.4/Galileo-v3.0.4.tar.gz
```

:::note Version Information
Latest Galileo testnet release: v3.0.4. Check [releases page](https://github.com/0gfoundation/0gchain-NG/releases) for newer versions.
:::

### 2. Extract Package

Extract the package to your home directory:

```bash
tar -xzvf Galileo-v3.0.4.tar.gz -C ~
```

### 3. Create Data Directory and Copy Configuration

Copy the configuration files and set proper permissions:

```bash
cd Galileo-v3.0.4

cp -r 0g-home {your data path}
sudo chmod 777 ./bin/geth
sudo chmod 777 ./bin/0gchaind
```

### 4. Initialize Geth

Initialize the Geth execution client with the genesis file:

```bash
./bin/geth init --datadir {your data path}/0g-home/geth-home ./geth-genesis.json
```

**Expected output:** "Successfully wrote genesis state"

### 5. Initialize 0gchaind for Testnet

Create a temporary directory for initial configuration with testnet chain specification:

```bash
./bin/0gchaind init {node name} --home {your data path}/tmp --chaincfg.chain-spec testnet
```

⚠️ **Important:** The `--chaincfg.chain-spec testnet` flag is REQUIRED for testnet validators

### 6. Generate JWT Authentication Token

Generate a JWT token with testnet specification for secure communication:

```bash
./bin/0gchaind jwt generate --home {your data path}/0g-home/0gchaind-home --chaincfg.chain-spec testnet

cp -f {your data path}/0g-home/0gchaind-home/config/jwt.hex ./
```

### 7. Copy Node Files

Move the generated keys to the proper location:

```bash
cp {your data path}/tmp/data/priv_validator_state.json {your data path}/0g-home/0gchaind-home/data/
cp {your data path}/tmp/config/node_key.json {your data path}/0g-home/0gchaind-home/config/
cp {your data path}/tmp/config/priv_validator_key.json {your data path}/0g-home/0gchaind-home/config/
```

> Note: The temporary directory can be deleted after this step.

### 8. Set Environment Variables

Configure required environment variables for Symbiotic restaking:

```bash
# Set your Ethereum HoleSky RPC endpoint (testnet)
export ETH_RPC_URL="https://holesky-rpc.g.alchemy.com/v2/YOUR_API_KEY"

# Set block range for syncing (adjust based on your RPC limits)
export BLOCK_NUM=1
```

### 9. Start 0gchaind

Launch the 0gchaind consensus client with testnet parameters:

```bash
cd ~/Galileo-v3.0.4

nohup ./bin/0gchaind start \
    --rpc.laddr tcp://0.0.0.0:26657 \
    --chaincfg.chain-spec testnet \
    --chaincfg.kzg.trusted-setup-path=kzg-trusted-setup.json \
    --chaincfg.engine.jwt-secret-path=jwt.hex \
    --chaincfg.block-store-service.enabled \
    --chaincfg.restaking.enabled \
    --chaincfg.restaking.symbiotic-rpc-dial-url ${ETH_RPC_URL} \
    --chaincfg.restaking.symbiotic-get-logs-block-range ${BLOCK_NUM} \
    --home {your data path}/0g-home/0gchaind-home \
    --p2p.external_address {your node ip}:26656 > {your data path}/0g-home/log/0gchaind.log 2>&1 &
```

### 10. Start Geth

Launch the Geth execution client:

```bash
cd ~/Galileo-v3.0.4

nohup ./bin/geth \
    --config geth-config.toml \
    --nat extip:{your node ip} \
    --datadir {your data path}/0g-home/geth-home \
    --networkid 16602 > {your data path}/0g-home/log/geth.log 2>&1 &
```

### 11. Verify Setup

Check the logs to confirm your node is running properly:

```bash
# Check 0gchaind logs
tail -f {your data path}/0g-home/log/0gchaind.log

# Check geth logs
tail -f {your data path}/0g-home/log/geth.log
```

:::success **Success Indicators**
- 0gchaind should show "Committed state" messages
- No error messages in either log
- Validator is participating in consensus
:::

  </TabItem>
</Tabs>

---

## Validator Operations

### Initialize Your Validator

Once your validator node is running and fully synced (`catching_up: false`), you need to initialize your validator on the blockchain to start validating transactions.

**Next Step:** Follow the **[Validator Initialization Guide](../developer-hub/building-on-0g/contracts-on-0g/staking-interfaces#validator-initialization)** to:
1. Generate validator signature
2. Prepare validator description and settings
3. Execute the initialization transaction
4. Verify your validator activation (typically 30-60 minutes)

---

### Monitor Consensus Participation

```bash
# Check if your validator is in the active set
curl http://localhost:26657/validators | jq
```

### Check Sync Status

```bash
# Should show "catching_up": false when fully synced
curl http://localhost:26657/status | jq '.result.sync_info'
```

### Key Management

⚠️ **Critical Security Notice:**

- **Backup your validator keys immediately**: `priv_validator_key.json` and `node_key.json`
- **Never share your private validator key** with anyone
- Store backups in multiple secure locations
- Test recovery process in a non-production environment first

<details>
<summary>Backup & Recovery</summary>

These files are essential for validator recovery and must be backed up securely:

```bash
# Essential validator keys
/{your data path}/0g-home/0gchaind-home/config/
```

#### Recovery Process

To restore your validator from backup:

1. **Stop running services**:
   ```bash
   pkill 0gchaind
   pkill geth
   ```

2. **Restore key files**:
   ```bash
   cp ~/validator-backup/node_key.json /{your data path}/0g-home/0gchaind-home/config/
   cp ~/validator-backup/priv_validator_key.json /{your data path}/0g-home/0gchaind-home/config/
   ```

3. **Restart services** following the appropriate setup guide steps.

</details>

<details>
<summary>Upgrade Validator</summary>

### Step 1: Extract New Release

```bash
# For Testnet (Galileo)
wget -O galileo.tar.gz https://github.com/0gfoundation/0gchain-NG/releases/download/v3.0.4/Galileo-v3.0.4.tar.gz
tar -xzvf Galileo-v3.0.4.tar.gz -C ~

# For Mainnet (Aristotle)
wget -O aristotle.tar.gz https://github.com/0gfoundation/0gchain-Aristotle/releases/download/1.0.4/aristotle-v1.0.4.tar.gz
tar -xzvf aristotle-v1.0.4.tar.gz -C ~

# Verify extraction
ls -la {network}-v{version}/
```

### Step 2: Stop Services

```bash
# Stop consensus layer (0gchaind)
pkill 0gchaind

# Stop execution layer (geth)
pkill geth
```

### Step 3: Backup Your Data

```bash
# Create backup directory with timestamp
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup execution layer data (geth-home)
cp -r {your_geth_datadir} $BACKUP_DIR/geth-backup

# Backup consensus layer data (0gchaind-home)
cp -r {your_0gchaind_home} $BACKUP_DIR/0gchaind-backup
```

### Step 4: Start Node 

If you get error while starting node due to missing `priv_validator_state.json`, create an empty `priv_validator_state.json` file in that directory with `{}`.

For testnet (Galileo), use `--chaincfg.chain-spec testnet`:

```bash
nohup ./bin/0gchaind start \
    --rpc.laddr tcp://0.0.0.0:26657 \
    --chaincfg.chain-spec testnet \
    --chaincfg.restaking.enabled \
    --chaincfg.restaking.symbiotic-rpc-dial-url ${ETH_RPC_URL} \
    --chaincfg.restaking.symbiotic-get-logs-block-range ${BLOCK_NUM} \
    --chaincfg.kzg.trusted-setup-path=kzg-trusted-setup.json \
    --chaincfg.engine.jwt-secret-path=jwt.hex \
    --chaincfg.block-store-service.enabled \
    --home {your_cl_home} \
    --p2p.external_address {your_node_ip}:26656 > {your_log_path}/0gchaind.log 2>&1 &
```

For mainnet (Aristotle), use `--chaincfg.chain-spec mainnet`:

```bash
nohup ./bin/0gchaind start \
    --rpc.laddr tcp://0.0.0.0:26657 \
    --chaincfg.chain-spec mainnet \
    --chaincfg.restaking.enabled \
    --chaincfg.restaking.symbiotic-rpc-dial-url ${ETH_RPC_URL} \
    --chaincfg.restaking.symbiotic-get-logs-block-range ${BLOCK_NUM} \
    --chaincfg.kzg.trusted-setup-path=kzg-trusted-setup.json \
    --chaincfg.engine.jwt-secret-path=jwt.hex \
    --chaincfg.block-store-service.enabled \
    --home {your_cl_home} \
    --p2p.external_address {your_node_ip}:26656 > {your_log_path}/0gchaind.log 2>&1 &
```

Then start Geth:

```bash
nohup ./bin/geth --config geth-config.toml \
     --nat extip:{your_node_ip} \
     --datadir {your_geth_datadir} \
     --networkid {network_id} > {your_log_path}/geth.log 2>&1 &
```

### Step 5: Verify Upgrade Success

```bash
# Monitor consensus layer logs
tail -f {your_log_path}/0gchaind.log

# Monitor execution layer logs
tail -f {your_log_path}/geth.log
```

</details>

## Next Steps

### Staking Integration

Once your validator node is running, you can interact with the staking system programmatically using smart contracts:

- **[Staking Interfaces Guide](../developer-hub/building-on-0g/contracts-on-0g/staking-interfaces)** - Complete documentation for integrating with 0G Chain staking smart contracts

