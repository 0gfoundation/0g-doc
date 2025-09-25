---
id: da-integration
title: DA Client Nodes
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 0G Data Availability (DA): Integration

To submit data to the 0G DA, you must run a DA Client node and the Encoder node. The DA client interfaces with the Encoder for data encoding and the Retriever for data access.

## Overview

### Maximum Blob Size
Users can submit data blobs up to 32,505,852 bytes in length, which are then processed, encoded, and distributed across a network of DA nodes. The system employs a sophisticated data processing flow that includes padding, matrix formation, redundant encoding, and signature aggregation.

### Fee Market
As the DA user, you pay a fee which is the (BLOB_PRICE) when submitting DA blob data.

### Submitting Data
See example here: https://github.com/0gfoundation/0g-da-example-rust/blob/main/src/disperser.proto

## Hardware Requirements

The following table outlines the hardware requirements for different types of DA Client nodes:

| Node Type | Memory | CPU | Disk | Bandwidth | Additional Notes |
|-----------|--------|-----|------|-----------|------------------|
| DA Client | 8 GB | 2 cores | - | 100 MBps | For Download / Upload |
| DA Encoder | - | - | - | - | NVIDIA Drivers: 12.04 on the RTX 4090* |
| DA Retriever | 8 GB | 2 cores | - | 100 MBps | For Download / Upload |

## Standing up DA Client, Encoder, Retriever

<Tabs>
<TabItem value="binary" label="DA Client" default>

## DA Client Node Installation

**1. Clone the DA Client Node Repo**

```bash
git clone https://github.com/0gfoundation/0g-da-client.git
```

**2. Build the Docker Image**

```bash
cd 0g-da-client
docker build -t 0g-da-client -f combined.Dockerfile .
```

**3. Set Environment Variables**

Create a file named `envfile.env` with the following content. Be sure you paste in your private key.

```bash
# envfile.env
COMBINED_SERVER_CHAIN_RPC=https://evmrpc-testnet.0g.ai
COMBINED_SERVER_PRIVATE_KEY=YOUR_PRIVATE_KEY
ENTRANCE_CONTRACT_ADDR=0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9

COMBINED_SERVER_RECEIPT_POLLING_ROUNDS=180
COMBINED_SERVER_RECEIPT_POLLING_INTERVAL=1s
COMBINED_SERVER_TX_GAS_LIMIT=2000000
COMBINED_SERVER_USE_MEMORY_DB=true
COMBINED_SERVER_KV_DB_PATH=/runtime/
COMBINED_SERVER_TimeToExpire=2592000
DISPERSER_SERVER_GRPC_PORT=51001
BATCHER_DASIGNERS_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001000
BATCHER_FINALIZER_INTERVAL=20s
BATCHER_CONFIRMER_NUM=3
BATCHER_MAX_NUM_RETRIES_PER_BLOB=3
BATCHER_FINALIZED_BLOCK_COUNT=50
BATCHER_BATCH_SIZE_LIMIT=500
BATCHER_ENCODING_INTERVAL=3s
BATCHER_ENCODING_REQUEST_QUEUE_SIZE=1
BATCHER_PULL_INTERVAL=10s
BATCHER_SIGNING_INTERVAL=3s
BATCHER_SIGNED_PULL_INTERVAL=20s
BATCHER_EXPIRATION_POLL_INTERVAL=3600
BATCHER_ENCODER_ADDRESS=DA_ENCODER_SERVER
BATCHER_ENCODING_TIMEOUT=300s
BATCHER_SIGNING_TIMEOUT=60s
BATCHER_CHAIN_READ_TIMEOUT=12s
BATCHER_CHAIN_WRITE_TIMEOUT=13s
```

**4. Run the Docker Node**

```bash
docker run -d --env-file envfile.env --name 0g-da-client -v ./run:/runtime -p 51001:51001 0g-da-client combined
```

## Configuration

| Field | Description |
|-------|-------------|
| `--chain.rpc` | JSON RPC node endpoint for the blockchain network. |
| `--chain.private-key` | Hex-encoded signer private key. |
| `--chain.receipt-wait-rounds` | Maximum retries to wait for transaction receipt. |
| `--chain.receipt-wait-interval` | Interval between retries when waiting for transaction receipt. |
| `--chain.gas-limit` | Transaction gas limit. |
| `--combined-server.use-memory-db` | Whether to use mem-db for blob storage. |
| `--combined-server.storage.kv-db-path` | Path for level db. |
| `--combined-server.storage.time-to-expire` | Expiration duration for blobs in level db. |
| `--combined-server.log.level-file` | File log level. |
| `--combined-server.log.level-std` | Standard output log level. |
| `--combined-server.log.path` | Log file path. |
| `--disperser-server.grpc-port` | Server listening port. |
| `--disperser-server.retriever-address` | GRPC host for retriever. |
| `--batcher.da-entrance-contract` | Hex-encoded da-entrance contract address. |
| `--batcher.da-signers-contract` | Hex-encoded da-signers contract address. |
| `--batcher.finalizer-interval` | Interval for finalizing operations. |
| `--batcher.finalized-block-count` | Default number of blocks between finalized block and latest block. |
| `--batcher.confirmer-num` | Number of Confirmer threads. |
| `--batcher.max-num-retries-for-sign` | Number of retries before signing fails. |
| `--batcher.batch-size-limit` | Maximum batch size in MiB. |
| `--batcher.encoding-request-queue-size` | Size of the encoding request queue. |
| `--batcher.encoding-interval` | Interval between blob encoding requests. |
| `--batcher.pull-interval` | Interval for pulling from the encoded queue. |
| `--batcher.signing-interval` | Interval between slice signing requests. |
| `--batcher.signed-pull-interval` | Interval for pulling from the signed queue. |
| `--encoder-socket` | GRPC host of the encoder. |
| `--encoding-timeout` | Total time to wait for a response from encoder. |
| `--signing-timeout` | Total time to wait for a response from signer. |

</TabItem>
<TabItem value="source" label="DA Encoder">

## Features

- `parallel`: Uses parallel algorithms for computations, maximizing CPU resource utilization.
- `cuda`: Uses GPU for computations, applicable only on platforms with NVIDIA GPUs.

:::note
GPU support is currently tested with NVIDIA 12.04 drivers on the RTX 4090. Other NVIDIA GPUs may require parameter adjustments and have not been tuned yet.
:::

## Preparation

### Install Rust

Ensure you have curl installed.

Run the following command to install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, add the cargo bin directory to your PATH environment variable:

```bash
source $HOME/.cargo/env
```

Verify the installation:

```bash
rustc --version
```

### Install other dependencies

```bash
# Install Protocol Buffers Compiler
sudo apt-get install -y protobuf-compiler

# Install a specific nightly Rust toolchain and rustfmt
rustup toolchain install nightly-2024-02-04-x86_64-unknown-linux-gnu
rustup component add --toolchain nightly-2024-02-04-x86_64-unknown-linux-gnu rustfmt

# Add the necessary Rust target
rustup target add x86_64-unknown-linux-gnu
```

### Install CUDA (for GPU feature)

Ensure you have an NVIDIA GPU with the required drivers. Then follow the instructions from [CUDA Toolkit](https://developer.nvidia.com/cuda-toolkit).

Verify the installation:

```bash
nvidia-smi
nvcc --version
```

## Building Public Parameters

The public parameters for the cryptographic protocol are built in two steps:

### 1. Download and process the perpetual power of tau

We use the challenge_0084 file from the nearly most recent submission.

```bash
curl https://pse-trusted-setup-ppot.s3.eu-central-1.amazonaws.com/challenge_0084 -o challenge_0084
```

### 2. Build the AMT parameters

You can either construct these parameters yourself or download pre-built files.

#### Choice 1: Download the pre-built files

```bash
./dev-support/download_params.sh
```

#### Choice 2: Construct the parameters yourself

```bash
./dev_support/build_params.sh challenge_0084
```

## Running the Server

Run the server with the following command:

```bash
cargo run -r -p server --features grpc/parallel,grpc/cuda -- --config run/config.toml
```

:::note
If you do not have a CUDA environment, remove the cuda feature.
:::

DA Encoder will serve on port 34000 with the specified gRPC interface.

## Using the Verification Logic

Add the following to `Cargo.toml` of your crate:

```toml
zg-encoder = { git = "https://github.com/0gfoundation/0g-da-encoder.git" }
```

Use the `zg_encoder::EncodedSlice::verify` function for verifying.

## Benchmark the Performance

Run the following task:

```bash
cargo bench -p grpc --features grpc/parallel,grpc/cuda --bench process_data --features zg-encoder/production_mode -- --nocapture
```

## Development and Testing

Run the following script for complete testing:

```bash
./dev_support/test.sh
```

</TabItem>
<TabItem value="docker" label="DA Retriever">

## DA Retriever Node Installation

**1. Clone the DA Retriever Node Repo**

```bash
git clone https://github.com/0gfoundation/0g-da-retriever.git
cd 0g-da-retriever
```

**2. Edit Files**

Add the following line to Dockerfile.dockerignore file:

```bash
!/run/config.toml
```

Replace Dockerfile with the following:

```dockerfile
# Dockerfile
FROM rust:alpine3.20 as builder

WORKDIR /0g-da-retriever
COPY . .

RUN apk update && apk add --no-cache make protobuf-dev musl-dev
RUN cargo build --release

FROM alpine:3.20

WORKDIR /0g-da-retriever

COPY --from=builder /0g-da-retriever/target/release/retriever /usr/local/bin/retriever
# Copy the config file into the container
COPY --from=builder /0g-da-retriever/run/config.toml ./run/config.toml

# Set the entrypoint to run the retriever binary
CMD ["/usr/local/bin/retriever"]
```

Replace the Config impl in `/retriever/src/config.rs` with the following:

```rust
impl Config {
    pub fn from_cli_file() -> Result<Self> {
        let matches = cli::cli_app().get_matches();
        let config_file = matches
            .get_one::<String>("config")
            .map(|s| s.as_str())
            .unwrap_or("/0g-da-retriever/run/config.toml");

        let c = RawConfig(
            config::Config::builder()
                .add_source(config::File::with_name(config_file))
                .build()?,
        );

        Ok(Self {
            log_level: c.get_string("log_level")?,
            eth_rpc_url: c.get_string("eth_rpc_endpoint")?,
            grpc_listen_address: c.get_string("grpc_listen_address")?,
            max_ongoing_retrieve_request: c.get_u64_opt("max_ongoing_retrieve_request")?,
        })
    }
}
```

**3. Update Configuration**

Update configuration file `run/config.toml` as needed with context below.

| Field | Description |
|-------|-------------|
| log_level | Set log level. |
| grpc_listen_address | Server listening address. |
| eth_rpc_endpoint | JSON RPC node endpoint for the blockchain network. |

**4. Build and Run the Docker Node**

```bash
docker build -t 0g-da-retriever . 
docker run -d --name 0g-da-retriever -p 34005:34005 0g-da-retriever
```

</TabItem>
</Tabs>

## Troubleshooting

<details>
<summary><b>DA Client connection issues</b></summary>

- Verify the RPC endpoint is accessible
- Check that your private key has sufficient funds for gas
- Ensure the contract addresses are correct for your network
- Review logs: `docker logs 0g-da-client`
</details>

<details>
<summary><b>Encoder GPU not detected</b></summary>

- Verify NVIDIA drivers are installed: `nvidia-smi`
- Check CUDA installation: `nvcc --version`
- Ensure Docker has GPU access if using containers
- Try running without cuda feature if the GPU is not available
</details>

<details>
<summary><b>Retriever fails to start</b></summary>

- Check that port 34005 is not already in use
- Verify the Ethereum RPC endpoint is accessible
- Ensure config.toml is properly formatted
- Review container logs for specific errors
</details>

## Next Steps

- **Integration Examples** → [DA Examples Repository](https://github.com/0gfoundation/0g-da-example-rust)
- **Join Community** → [Discord](https://discord.gg/0glabs) for support
- **Run a DA Node** → [DA Node Guide](/run-a-node/da-node)

---

*Ready to integrate 0G DA into your application? Start with the DA Client and connect to the network.*
