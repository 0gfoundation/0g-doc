---
sidebar_position: 4
title: Data Availability Node
description: "Step-by-step guide to setting up a 0G Data Availability node, including Docker and source builds, BLS key generation, and signer registration."
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

While there are various approaches to running a DA (Data Availability) node, this guide outlines our recommended method and the necessary hardware specifications. DA Nodes perform the core functions of verifying, signing, and storing encoded blob data. 

To operate effectively, your DA signer needs to run a DA node to verify encoded blob data, sign it, and store it for future farming and rewards. Currently, to run a DA Node on Testnet, users must stake 10 OG tokens. These can be obtained through our [faucet](https://faucet.0g.ai/) or via rewards from running Storage Nodes or Validator Nodes. You can also reach out to our technical moderators on [Discord](https://discord.com/invite/0glabs).

## Hardware Requirements

| Node Type | Memory | CPU | Disk | Bandwidth | Additional Notes |
|-----------|--------|-----|------|-----------|------------------|
| DA Node | 16 GB | 8 cores | 1 TB NVMe SSD | 100 MBps | For Download/Upload |

## Standing up a DA Node and DA Signer
<Tabs>

  <TabItem value="Da-node-docker" label="Run with Docker" default>

**1. Clone the DA Node Repo:** 

   ```
   git clone https://github.com/0gfoundation/0g-da-node.git
   cd 0g-da-node
   ```

**2. Generate BLS Private Key (if needed):**

If you don't have a BLS private key, generate one:

```
cargo run --bin key-gen
```

Keep the generated BLS private key secure.

**3. Set up config.toml:**

1. Create a configuration file named `config.toml` in the project root directory.
2. Add the following content to the file, adjusting values as needed:

   ```toml
   log_level = "info"

   data_path = "/data"

   # path to downloaded params folder
   encoder_params_dir = "/params"

   # grpc server listen address
   grpc_listen_address = "0.0.0.0:34000"
   # chain eth rpc endpoint
   eth_rpc_endpoint = "https://evmrpc-testnet.0g.ai"
   # public grpc service socket address to register in DA contract
   # ip:34000 (keep same port as the grpc listen address)
   # or if you have dns, fill your dns
   socket_address = "<public_ip/dns>:34000"

   # data availability contract to interact with
   da_entrance_address = "0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9" # testnet config
   # deployed block number of da entrance contract
   start_block_number = 940000 # testnet config

   # signer BLS private key
   signer_bls_private_key = ""
   # signer eth account private key
   signer_eth_private_key = ""
   # miner eth account private key, (could be the same as `signer_eth_private_key`, but not recommended)
   miner_eth_private_key = ""

   # whether to enable data availability sampling
   enable_das = "true"
   ```

   Make sure to fill in the `signer_bls_private_key`, `signer_eth_private_key`, and `miner_eth_private_key` fields with your actual private keys.

**4. Build and Start the Docker Container:**

   ```
   docker build -t 0g-da-node .
   docker run -d --name 0g-da-node 0g-da-node
   ```
**5. Verify the Node is Running**

On the first run, the DA node will register the signer information in the DA contract. You can monitor the console output to ensure the node is running correctly and has successfully registered.

### Node Operations

As a DA node operator, your node will perform the following tasks:
- Encoded blob data verification
- Signing of verified data
- Storing blob data for further farming
- Receiving rewards for these operations

### Troubleshooting

- If you encounter any issues, check the console output for error messages.
- Ensure that the ports specified in your `config.toml` file are not being used by other applications.
- Verify that you have the latest stable version of Rust installed.
- Make sure your system meets the minimum hardware requirements.

### Conclusion

You have now successfully set up and run a 0g DA node as a DA Signer. For more advanced configuration options and usage instructions, please refer to the [Official GitHub repository](https://github.com/0gfoundation/0g-da-node).

Remember to keep your private keys secure and regularly update your node software to ensure optimal performance and security.

  </TabItem>

<TabItem value="Da-node" label="Build from Source" default>



## Step 1: Clone and Build the Repository

1. Install dependencies:

   ```
   sudo apt-get update && sudo apt-get install clang cmake build-essential pkg-config libssl-dev protobuf-compiler llvm llvm-dev
   ```

2. Clone the repository and checkout the specific version:

   ```
   git clone https://github.com/0gfoundation/0g-da-node.git
   cd 0g-da-node
   ```

3. Build the project:

   ```
   cargo build --release
   ```

4. Download necessary parameters:

   ```
   ./dev_support/download_params.sh
   ```

## Step 2: Generate BLS Private Key (if needed)

If you don't have a BLS private key, generate one:

```
cargo run --bin key-gen
```

**Keep the generated BLS private key secure.**

## Step 3: Configure the Node

1. Create a configuration file named `config.toml` in the project root directory.
2. Add the following content to the file, adjusting values as needed:

   ```toml
   log_level = "info"

   data_path = "./db/"

   # path to downloaded params folder
   encoder_params_dir = "params/" 

   # grpc server listen address
   grpc_listen_address = "0.0.0.0:34000"
   # chain eth rpc endpoint
   eth_rpc_endpoint = "https://evmrpc-testnet.0g.ai"
   # public grpc service socket address to register in DA contract
   # ip:34000 (keep same port as the grpc listen address)
   # or if you have dns, fill your dns
   socket_address = "<public_ip/dns>:34000"

   # data availability contract to interact with
   da_entrance_address = "0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9" # testnet config and see testnet page for the latest info

   # deployed block number of da entrance contract
   start_block_number = 940000 # testnet config

   # signer BLS private key
   signer_bls_private_key = ""
   # signer eth account private key
   signer_eth_private_key = ""
   # miner eth account private key, (could be the same as `signer_eth_private_key`, but not recommended)
   miner_eth_private_key = ""

   # whether to enable data availability sampling
   enable_das = "true"
   ```

   Make sure to fill in the `signer_bls_private_key`, `signer_eth_private_key`, and `miner_eth_private_key` fields with your actual private keys.

## Step 4: Run the Node

Start the 0g DA node using the following command:

```
./target/release/server --config config.toml
```

This will start the node using the configuration file you created.

## Step 5: Verify the Node is Running

On the first run, the DA node will register the signer information in the DA contract. You can monitor the console output to ensure the node is running correctly and has successfully registered.

## Node Operations

As a DA node operator, your node will perform the following tasks:
- Encoded blob data verification
- Signing of verified data
- Storing blob data for further farming
- Receiving rewards for these operations

## Troubleshooting

- If you encounter any issues, check the console output for error messages.
- Ensure that the ports specified in your `config.toml` file are not being used by other applications.
- Verify that you have the latest stable version of Rust installed.
- Make sure your system meets the minimum hardware requirements.

## Conclusion

You have now successfully set up and run a 0g DA node as a DA Signer. For more advanced configuration options and usage instructions, please refer to the [Official GitHub repository](https://github.com/0gfoundation/0g-da-node).

Remember to keep your private keys secure and regularly update your node software to ensure optimal performance and security.
  </TabItem>



<TabItem value="signer" label="Become a Signer">

## Overview

The DASigners contract is an interface through which Solidity contracts can interact with the 0G chain module DASigners. It is registered as a precompiled contract, similar to other precompiled EVM extensions.

## Becoming a DA Signer

To become a DA signer, you must meet the following requirements:

1. Delegation Requirement: To become a signer, an address must receive enough delegations, equivalent to at least the TokensPerVote amount of OG tokens (30 tokens per vote in the testnet), registered in the DASigners module.

2. Node Operation: Each signer needs to run a DA (Data Availability) node that verifies blob encoding and generates BLS signatures for signed blobs.

3. Registration: Signers must register their information using the registerSigner function. This includes providing their address, node socket address, BLS public key, and a signature signed by their BLS private key.

4. Epoch Participation: Signers must submit a registration message (using the registerNextEpoch function) with a signature for each epoch they wish to participate in. This is necessary for joining quorums in the next epoch.

5. Voting Power: Each signer’s voting power is determined by the number of tokens delegated to them. Signers can have up to 1024 votes, and the votes are distributed randomly into quorums.

6. Quorum Responsibilities: Each signer in a quorum is responsible for validating, signing, and storing a specific row of encoded blob data during an epoch.

## Prerequisites

Ensure you have the following installed on your system:

- Git
- Rust (latest stable version)
- Cargo (comes with Rust)

## Contract Details

**Address**: `0x0000000000000000000000000000000000001000`

### Contract Params (Testnet)

```
TokensPerVote = 30
MaxVotesPerSigner = 1024
MaxQuorums = 10
EpochBlocks = 5760
EncodedSlices = 3072
```

## Terminology

### Signer

A Signer is an address with sufficient delegations (at least `TokensPerVote` OG) registered in the DASigners module. Each signer should run a DA node to verify DA blob encoding and generate BLS signatures for signed blobs. The BLS curve used is BN254, and the public keys of signers are registered in the contract.

**Note**: For accounts with delegations to more than 10 validators, only 10 of these delegations are counted and accumulated.

### Epoch

The consecutive blocks in the 0g chain are divided into groups of `EpochBlocks`, and each group is an epoch.

### Quorum

In an epoch, there can be up to `MaxQuorums` quorums. Each quorum is a list of signer addresses with size `EncodedSlices`. The i-th signer in the quorum is responsible for validating, signing, and storing the i-th row of the encoded blob data assigned to this quorum.

### Vote

Signers can submit their signatures on a registration message to request joining the quorums in the next epoch. At the start of each epoch, the DASigners module calculates the voting power for registered signers based on their delegated token amounts. Each delegated `TokensPerVote` OG counts as one vote, and each signer can have up to `MaxVotesPerSigner` votes. All votes are then randomly ordered and distributed into quorums.

## Interface

Find the Solidity interface in the [0g-da-contract repo](https://github.com/0gfoundation/0g-da-contract).

## ABI

Find the ABI on the [DASigners precompile page](/developer-hub/building-on-0g/contracts-on-0g/precompiles/precompiles-dasigners#abi).

## Transactions

### registerSigner

Register signer's information, including signer address, DA node service socket address, signer BLS public key on G1 and G2 group, and a signature signed by the BLS private key of the following message:

```
Keccak256(signerAddress, chainID, "0G_BN254_Pubkey_Registration")
```

Here `chainID` is left-padded to 32 bytes by zeros.

```solidity
function registerSigner(
    SignerDetail memory _signer, 
    BN254.G1Point memory _signature
) external;
```

### updateSocket

Update signer's socket address.

```solidity
function updateSocket(string memory _socket) external;
```

### registerNextEpoch

Register to join the quorums in the next epoch. The signer needs to submit a signature signed by their BLS private key:

```
Keccak256(signerAddress, epoch, chainID)
```

Here `chainID` is left-padded to 32 bytes by zeros and `epoch` is an unsigned 64-bit number in big-endian format.

```solidity
function registerNextEpoch(BN254.G1Point memory _signature) external;
```

## Queries

### epochNumber

Get the current epoch number.

```solidity
function epochNumber() external view returns (uint);
```

### quorumCount

Get the number of quorums for a given epoch.

```solidity
function quorumCount(uint _epoch) external view returns (uint);
```

### isSigner

Check if a given address is a registered signer.

```solidity
function isSigner(address _account) external view returns (bool);
```

### getSigner

Get the information of given signers.

```solidity
function getSigner(address[] memory _account) external view returns (SignerDetail[] memory);
```

### getQuorum

Get the signer list of a given epoch and quorum id.

```solidity
function getQuorum(uint _epoch, uint _quorumId) external view returns (address[] memory);
```

### getQuorumRow

Get the signer of a specific row in a given epoch and quorum id.

```solidity
function getQuorumRow(uint _epoch, uint _quorumId, uint32 _rowIndex) external view returns (address);
```

### registeredEpoch

Check if a given address is registered to join the given epoch.

```solidity
function registeredEpoch(address _account, uint _epoch) external view returns (bool);
```

### getAggPkG1

Get the aggregated G1 public key for a given signers set. The signers set is specified by the epoch, quorum id, and a bitmap. The bitmap has `EncodedSlices` bits, and each bit denotes whether the row is chosen or not.

```solidity
function getAggPkG1(
    uint _epoch,
    uint _quorumId,
    bytes memory _quorumBitmap
) external view returns (BN254.G1Point memory aggPkG1, uint total, uint hit);
```
  </TabItem>
</Tabs>
