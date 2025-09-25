# Storage Node
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In the 0G network, storage nodes play a vital role in maintaining the system's decentralized storage layer. They are responsible for storing and serving data, ensuring data availability and reliability across the network. By running a storage node, you actively contribute to the network and earn rewards for your participation.
This guide details the process of running a storage node, including hardware specifications and interaction with on-chain contracts.

### Hardware Requirements

| Component | Storage Node | Storage KV |
|-----------|--------------|------------|
| Memory    | 32 GB RAM    | 32 GB RAM  |
| CPU       | 8 cores      | 8 cores    |
| Disk      | 500GB / 1TB NVMe SSD | Size matches the KV streams it maintains |
| Bandwidth | 100 Mbps (Download / Upload) | - |

:::note
- For Storage Node: The NVMe SSD ensures fast read/write operations, critical for efficient blob storage and retrieval.
- For Storage KV: The disk size requirement is flexible and should be adjusted based on the volume of KV streams you intend to maintain.
:::
### Next Steps
For detailed instructions on setting up and operating your Storage Node or Storage KV, please refer to our comprehensive setup guides below:

<Tabs>
  <TabItem value="binary" label="Storage Node" default>

## Prerequisites

Before setting up your storage node:

- Understand that 0G Storage interacts with on-chain contracts for blob root confirmation and PoRA mining.
- Check [here](../developer-hub/testnet/testnet-overview.md) for deployed contract addresses.


## Install Dependencies
Start by installing all the essential tools and libraries required to build the 0G storage node software.

<Tabs
  defaultValue="linux"
  values={[
    {label: 'Linux', value: 'linux'},
    {label: 'Mac', value: 'mac'},
    ]}>
  <TabItem value="linux">

        ```bash
        sudo apt-get update
        sudo apt-get install clang cmake build-essential pkg-config libssl-dev protobuf-compiler
        ```
</TabItem>
  <TabItem value="mac">
        ```bash
        brew install llvm cmake
        ```
</TabItem>
</Tabs>
**Install `rustup`**: rustup is the Rust toolchain installer, necessary as the 0G node software is written in Rust.

    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```   

 **Download the Source Code**: 

    ```bash
    git clone -b <latest_tag> https://github.com/0gfoundation/0g-storage-node.git
    ```

**Build the Source Code**

    ```bash
    cd 0g-storage-node

    # Build in release mode
    cargo build --release
    ```

This compiles the Rust code into an executable binary. The `--release` flag optimizes the build for performance.

## Configuration

Navigate to the run directory and open config.toml for editing. Follow the steps below. 

1. Edit the configuration file:

```bash
cd run
nano config.toml
```

2. Update configuration with your preferred settings:


Below is just an example configuration for illustration purposes.
For official default values, copy over the `config-testnet-turbo.toml` file to your `config.toml` file.


```
# Peer nodes: A list of peer nodes to help your node join the network. Check inside 0g-storage/run directory for suggested configurations.
network_boot_nodes = []

# Contract addresses
log_contract_address = "CONTRACT_ADDRESS" #flow contract address, see testnet information
mine_contract_address = "CONTRACT_ADDRESS" #Address of the smart contract on the host blockchain that manages mining.

# L1 host blockchain RPC endpoint URL. See testnet information page for RPC endpoints
blockchain_rpc_endpoint = "RPC_ENDPOINT"

# Start sync block number: The block number from which your node should start synchronizing the log data.
log_sync_start_block_number = BLOCK_NUMBER

# Your private key (64 chars, no '0x' prefix, include leading zeros): Your private key (without the `0x` prefix) if you want to participate in PoRA mining and earn rewards.
miner_key = "YOUR_PRIVATE_KEY"

# Max chunk entries in db (affects storage size): The maximum number of chunk entries (each 256 bytes) to store in the database. This effectively limits the database size.
db_max_num_chunks = MAX_CHUNKS

# ENR address: Your node's public IP address, essential for other nodes to discover and connect to you. Currently automatically set by the node.
# network_enr_address = ""
```

## Running the Storage Node

1. Check configuration options:
```bash
../target/release/zgs_node -h
```

2. Run the storage service:
```bash
cd run
../target/release/zgs_node --config config.toml --miner-key <your_private_key>
```

## Snapshot 
Make sure to only include `flow_db` and delete `data_db` under `db` folder when you use a snapshot from a 3rd party !
> Using others' `data_db` will make the node mine for others!

**Additional Notes**
*   **Security:** Keep your private key (`miner_key`) safe and secure. Anyone with access to it can control your node and potentially claim your mining rewards.

*   **Network Connectivity:** Ensure your node has a stable internet connection and that the necessary ports are open for communication with other nodes.

*   **Monitoring:** Monitor your node's logs and resource usage to ensure it's running smoothly.

*   **Updates:** Stay informed about updates to the 0G storage node software and follow the project's documentation for any changes in the setup process.

**Remember:** Running a storage node is a valuable contribution to the 0G network. You'll be helping to maintain its decentralization and robustness while earning rewards for your efforts.

  </TabItem>
  <TabItem value="docker" label="Storage KV Node">

## Overview
  0G Storage KV is a key-value store built on top of the 0G Storage system. This guide provides detailed steps to deploy and run a 0G Storage KV node.

## Prerequisites

Before setting up your 0G Storage KV node:

- Understand that 0G KV interacts with on-chain contracts and storage nodes to simulate KV data streams.
- For official deployed contract addresses, visit the [testnet information page](../developer-hub/testnet/testnet-overview.md).

## Install Dependencies

Follow the same steps to install dependencies and Rust as in the storage node setup:
<Tabs>
  <TabItem value="linux">

        ```bash
        sudo apt-get update
        sudo apt-get install clang cmake build-essential pkg-config libssl-dev protobuf-compiler
        ```
</TabItem>
  <TabItem value="mac">
        ```bash
        brew install llvm cmake
        ```
</TabItem>
</Tabs>
**Install `rustup`**: rustup is the Rust toolchain installer, necessary as the 0G node software is written in Rust.

    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```   

#### 1. Download the Source Code

```bash
git clone -b <latest_tag> https://github.com/0gfoundation/0g-storage-kv.git
```

#### 2. Build the Source Code

```bash
cd 0g-storage-kv

# Build in release mode
RUSTFLAGS="-C target-cpu=native" cargo build --release
```

## Configuration

1. Copy the example configuration file and update it:

```bash
cp config_example.toml config.toml
nano config.toml
```

2. Update the following fields in `config.toml`:

```toml
#######################################################################
###                   Key-Value Stream Options                      ###
#######################################################################

# Streams to monitor.
stream_ids = ["000000000000000000000000000000000000000000000000000000000000f2bd", "000000000000000000000000000000000000000000000000000000000000f009", "0000000000000000000000000000000000000000000000000000000000016879", "0000000000000000000000000000000000000000000000000000000000002e3d"]

#######################################################################
###                     DB Config Options                           ###
#######################################################################

# Directory to store data.
db_dir = "db"
# Directory to store KV Metadata.
kv_db_dir = "kv.DB"

#######################################################################
###                     Log Sync Config Options                     ###
#######################################################################

blockchain_rpc_endpoint = "BLOCKCHAIN_RPC_ENDPOINT" #rpc endpoint, see testnet information
log_contract_address = "LOG_CONTRACT_ADDRESS" #flow contract address, see testnet information
# log_sync_start_block_number should be earlier than the block number of the first transaction that writes to the stream being monitored.
log_sync_start_block_number = 0

#######################################################################
###                     RPC Config Options                          ###
#######################################################################

# Whether to provide RPC service.
rpc_enabled = true

# HTTP server address to bind for public RPC.
rpc_listen_address = "0.0.0.0:6789"

# Zerog storage nodes to download data from.
zgs_node_urls = "http://127.0.0.1:5678,http://127.0.0.1:5679"

#######################################################################
###                     Misc Config Options                         ###
#######################################################################

log_config_file = "log_config"
```

## Running the Storage KV Node

1. Navigate to the `run` directory:
```bash
cd run
```

2. Run the KV service:
```bash
../target/release/zgs_kv --config config.toml
```

For long-running sessions, consider using `tmux` or `screen` to run the node in the background.

## Monitoring and Maintenance

1. Check logs:
   The node outputs logs based on the `log_config` file specified in your configuration.

2. Updating the node:

 To update to the latest version, pull the latest changes from the repository and rebuild:
  
 ```bash
   git pull
   cargo build --release
   ```

## Troubleshooting

If you encounter issues:

1. Check the logs for any error messages.
2. Ensure your node meets the hardware requirements.
3. Verify that your `config.toml` file is correctly formatted and contains valid settings.
4. Check your internet connection and firewall settings.
5. Ensure the specified blockchain RPC endpoint and contract addresses are correct and accessible.

## Getting Help

If you need assistance:

1. Check the [GitHub Issues](https://github.com/0gfoundation/0g-storage-kv/issues) for known problems and solutions.
2. Join the 0G community channels (Discord, Telegram, etc.) for community support.
3. For critical issues, consider reaching out to the 0G team directly.

## Conclusion

Running a 0G Storage KV node is an important part of the 0G ecosystem, providing key-value storage capabilities. By following this guide, you should be able to set up and operate your node successfully. Remember to keep your node updated and monitor its performance regularly to ensure optimal operation.
</TabItem>
</Tabs>
