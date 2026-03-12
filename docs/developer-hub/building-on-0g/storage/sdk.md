---
id: sdk
title: Storage SDK
description: "Integrate 0G decentralized storage using Go and TypeScript SDKs. Upload, download, and manage files with key-value storage and browser support."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 0G Storage SDKs

Build decentralized storage into your applications with our powerful SDKs designed for modern development workflows.

## Available SDKs

- **Go SDK**: Ideal for backend systems and applications built with Go
- **TypeScript SDK**: Perfect for frontend development and JavaScript-based projects

## Core Features

Both SDKs provide a streamlined interface to interact with the 0G Storage network:

- **Upload and Download Files**: Securely store and retrieve data of various sizes and formats
- **Manage Data**: List uploaded files, check their status, and control access permissions
- **Leverage Decentralization**: Benefit from the 0G network's distributed architecture for enhanced data availability, immutability, and censorship resistance

## Quick Start Resources

:::tip Starter Kits Available
Get up and running quickly with our comprehensive starter kits:

- **[TypeScript Starter Kit](https://github.com/0gfoundation/0g-storage-ts-starter-kit)** - Complete examples with Express.js server and CLI tool
- **[Go Starter Kit](https://github.com/0gfoundation/0g-storage-go-starter-kit)** - Ready-to-use examples with Gin server and CLI tool

Both repositories include working examples, API documentation, and everything you need to start building.
:::

<Tabs>
<TabItem value="go" label="Go SDK" default>

## Installation

Install the 0G Storage Client library:

```bash
go get github.com/0gfoundation/0g-storage-client
```

## Setup

### Import Required Packages

```go
import (
    "context"
    "github.com/0gfoundation/0g-storage-client/common/blockchain"
    "github.com/0gfoundation/0g-storage-client/common"
    "github.com/0gfoundation/0g-storage-client/indexer"
    "github.com/0gfoundation/0g-storage-client/transfer"
    "github.com/0gfoundation/0g-storage-client/core"
)
```

### Initialize Clients

Create the necessary clients to interact with the network:

```go
// Create Web3 client for blockchain interactions
w3client := blockchain.MustNewWeb3(evmRpc, privateKey)
defer w3client.Close()

// Create indexer client for node management
indexerClient, err := indexer.NewClient(indRpc, indexer.IndexerClientOption{
    LogOption: common.LogOption{},
})
if err != nil {
    // Handle error
}
```

**Parameters:**
`evmRpc` is the chain RPC endpoint, `privateKey` is your signer key, and `indRpc` is the indexer RPC endpoint. Use the current values published in the network overview docs for your network.

## Core Operations

### Node Selection

Select storage nodes before performing file operations:

```go
nodes, err := indexerClient.SelectNodes(ctx, expectedReplicas, droppedNodes, method, fullTrusted)
if err != nil {
    // Handle error
}
```

**Parameters:**
`ctx` is the context for the operation. `expectedReplicas` is the number of replicas to maintain. `droppedNodes` is a list of nodes to exclude, `method` can be `min`, `max`, `random`, or a positive number string, and `fullTrusted` limits selection to trusted nodes.

### File Upload

Upload files to the network with the indexer client:

```go
file, err := core.Open(filePath)
if err != nil {
    // Handle error
}
defer file.Close()

fragmentSize := int64(4 * 1024 * 1024 * 1024)
opt := transfer.UploadOption{
    ExpectedReplica:  1,
    TaskSize:         10,
    SkipTx:           true,
    FinalityRequired: transfer.TransactionPacked,
    FastMode:         true,
    Method:           "min",
    FullTrusted:      true,
}

txHashes, roots, err := indexerClient.SplitableUpload(ctx, w3client, file, fragmentSize, opt)
if err != nil {
    // Handle error
}
```

`fragmentSize` controls the split size for large files. The returned `roots` contain the merkle root(s) to download later.

### File Hash Calculation

Calculate a file's Merkle root hash for identification:

```go
rootHash, err := core.MerkleRoot(filePath)
if err != nil {
    // Handle error
}
fmt.Printf("File hash: %s\n", rootHash.String())
```

:::info Important
Save the root hash - you'll need it to download the file later!
:::

### File Download

Download files from the network:

```go
rootHex := rootHash.String()
err = indexerClient.Download(ctx, rootHex, outputPath, withProof)
if err != nil {
    // Handle error
}
```

`withProof` enables merkle proof verification during download.

## Best Practices

1. **Error Handling**: Implement proper error handling and cleanup
2. **Context Management**: Use contexts for operation timeouts and cancellation
3. **Resource Cleanup**: Always close clients when done using `defer client.Close()`
4. **Verification**: Enable proof verification for sensitive files
5. **Monitoring**: Track transaction status for important uploads

## Additional Resources

- [Go SDK Repository](https://github.com/0gfoundation/0g-storage-client)
- [Go Starter Kit](https://github.com/0gfoundation/0g-storage-go-starter-kit)

</TabItem>
<TabItem value="typescript" label="TypeScript SDK">

## Installation

Install the SDK and its peer dependency:

```bash
npm install @0gfoundation/0g-ts-sdk ethers
```

:::note
`ethers` is a required peer dependency for blockchain interactions
:::

## Setup

### Import Required Modules

```javascript
import { ZgFile, Indexer, Batcher, KvClient } from '@0gfoundation/0g-ts-sdk';
import { ethers } from 'ethers';
```

### Initialize Configuration

```javascript
// Network Constants - Choose your network
// Use the current endpoints from the network overview docs
const RPC_URL = '<blockchain_rpc_endpoint>';
const INDEXER_RPC = '<storage_indexer_endpoint>';

// Initialize provider and signer
const privateKey = 'YOUR_PRIVATE_KEY'; // Replace with your private key
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(privateKey, provider);

// Initialize indexer
const indexer = new Indexer(INDEXER_RPC);
```

## Core Operations

### File Upload

Complete upload workflow:

```javascript
async function uploadFile(filePath) {
  // Create file object from file path
  const file = await ZgFile.fromFilePath(filePath);

  // Generate Merkle tree for verification
  const [tree, treeErr] = await file.merkleTree();
  if (treeErr !== null) {
    throw new Error(`Error generating Merkle tree: ${treeErr}`);
  }

  // Get root hash for future reference
  console.log("File Root Hash:", tree?.rootHash());

  // Upload to network
  const [tx, uploadErr] = await indexer.upload(file, RPC_URL, signer);
  if (uploadErr !== null) {
    throw new Error(`Upload error: ${uploadErr}`);
  }

  console.log("Upload successful! Transaction:", tx);

  // Always close the file when done
  await file.close();

  return { rootHash: tree?.rootHash(), txHash: tx };
}
```

### File Download

Download with optional verification:

```javascript
async function downloadFile(rootHash, outputPath) {
  // withProof = true enables Merkle proof verification
  const err = await indexer.download(rootHash, outputPath, true);
  if (err !== null) {
    throw new Error(`Download error: ${err}`);
  }
  console.log("Download successful!");
}
```

### Key-Value Storage

Store and retrieve key-value data:

```javascript
// Upload data to 0G-KV
async function uploadToKV(streamId, key, value) {
  const [nodes, err] = await indexer.selectNodes(1);
  if (err !== null) {
    throw new Error(`Error selecting nodes: ${err}`);
  }

  const batcher = new Batcher(1, nodes, flowContract, RPC_URL);

  const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
  const valueBytes = Uint8Array.from(Buffer.from(value, 'utf-8'));
  batcher.streamDataBuilder.set(streamId, keyBytes, valueBytes);

  const [tx, batchErr] = await batcher.exec();
  if (batchErr !== null) {
    throw new Error(`Batch execution error: ${batchErr}`);
  }

  console.log("KV upload successful! TX:", tx);
}

// Download data from 0G-KV
async function downloadFromKV(streamId, key) {
  const kvClient = new KvClient("http://3.101.147.150:6789");
  const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
  const value = await kvClient.getValue(streamId, ethers.encodeBase64(keyBytes));
  return value;
}
```

### Browser Support

For browser environments, use the ESM build:

```html
<script type="module">
  import { Blob, Indexer } from "./dist/zgstorage.esm.js";

  // Create file object from blob
  const file = new Blob(blob);
  const [tree, err] = await file.merkleTree();
  if (err === null) {
    console.log("File Root Hash:", tree.rootHash());
  }
</script>
```

### Stream Support

Work with streams for efficient data handling:

```typescript
import { Readable } from 'stream';

// Upload from stream
async function uploadStream() {
  const stream = new Readable();
  stream.push('Hello, 0G Storage!');
  stream.push(null);

  const file = await ZgFile.fromStream(stream, 'hello.txt');
  const [tx, err] = await indexer.upload(file, RPC_URL, signer);

  if (err === null) {
    console.log("Stream uploaded!");
  }
}

// Download as stream
async function downloadStream(rootHash) {
  const stream = await indexer.downloadFileAsStream(rootHash);
  stream.pipe(fs.createWriteStream('output.txt'));
}
```

## Best Practices

1. **Initialize Once**: Create the indexer once and reuse it for multiple operations
2. **Handle Errors**: Always implement proper error handling for network issues
3. **Use Appropriate Methods**: Use `ZgFile.fromFilePath` for Node.js and `Blob` for browsers
4. **Secure Keys**: Never expose private keys in client-side code
5. **Close Resources**: Remember to call `file.close()` after operations

## Additional Resources

- [TypeScript SDK Repository](https://github.com/0gfoundation/0g-ts-sdk)
- [TypeScript Starter Kit](https://github.com/0gfoundation/0g-storage-ts-starter-kit)

</TabItem>
</Tabs>

---

*Need more control? Consider running your own [storage node](/run-a-node/storage-node) to participate in the network and earn rewards.*
