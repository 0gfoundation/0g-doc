---
id: precompiles-dasigners
title: DASigners
description: "DASigners precompile reference for 0G Chain. Register signers, query quorums and epochs, and verify data availability via EVM smart contract calls."
---
## Overview

DAsigners is a wrapper for the `x/dasigners` module in the 0g chain, allowing querying the state of this module from EVM calls.

## Address

`0x0000000000000000000000000000000000001000`

## ABI

The ABI for encoding calls to the DASigners precompile (`0x0000000000000000000000000000000000001000`):

<details>
<summary>IDASigners ABI (JSON)</summary>

```json
[
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "signer", "type": "address" },
      {
        "components": [
          { "internalType": "uint256", "name": "X", "type": "uint256" },
          { "internalType": "uint256", "name": "Y", "type": "uint256" }
        ],
        "indexed": false,
        "internalType": "struct BN254.G1Point",
        "name": "pkG1",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "uint256[2]", "name": "X", "type": "uint256[2]" },
          { "internalType": "uint256[2]", "name": "Y", "type": "uint256[2]" }
        ],
        "indexed": false,
        "internalType": "struct BN254.G2Point",
        "name": "pkG2",
        "type": "tuple"
      }
    ],
    "name": "NewSigner",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "signer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "socket", "type": "string" }
    ],
    "name": "SocketUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "epochNumber",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_epoch", "type": "uint256" },
      { "internalType": "uint256", "name": "_quorumId", "type": "uint256" },
      { "internalType": "bytes", "name": "_quorumBitmap", "type": "bytes" }
    ],
    "name": "getAggPkG1",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "X", "type": "uint256" },
          { "internalType": "uint256", "name": "Y", "type": "uint256" }
        ],
        "internalType": "struct BN254.G1Point",
        "name": "aggPkG1",
        "type": "tuple"
      },
      { "internalType": "uint256", "name": "total", "type": "uint256" },
      { "internalType": "uint256", "name": "hit", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_epoch", "type": "uint256" },
      { "internalType": "uint256", "name": "_quorumId", "type": "uint256" }
    ],
    "name": "getQuorum",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_epoch", "type": "uint256" },
      { "internalType": "uint256", "name": "_quorumId", "type": "uint256" },
      { "internalType": "uint32", "name": "_rowIndex", "type": "uint32" }
    ],
    "name": "getQuorumRow",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address[]", "name": "_account", "type": "address[]" }],
    "name": "getSigner",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "signer", "type": "address" },
          { "internalType": "string", "name": "socket", "type": "string" },
          {
            "components": [
              { "internalType": "uint256", "name": "X", "type": "uint256" },
              { "internalType": "uint256", "name": "Y", "type": "uint256" }
            ],
            "internalType": "struct BN254.G1Point",
            "name": "pkG1",
            "type": "tuple"
          },
          {
            "components": [
              { "internalType": "uint256[2]", "name": "X", "type": "uint256[2]" },
              { "internalType": "uint256[2]", "name": "Y", "type": "uint256[2]" }
            ],
            "internalType": "struct BN254.G2Point",
            "name": "pkG2",
            "type": "tuple"
          }
        ],
        "internalType": "struct IDASigners.SignerDetail[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_account", "type": "address" }],
    "name": "isSigner",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "params",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "tokensPerVote", "type": "uint256" },
          { "internalType": "uint256", "name": "maxVotesPerSigner", "type": "uint256" },
          { "internalType": "uint256", "name": "maxQuorums", "type": "uint256" },
          { "internalType": "uint256", "name": "epochBlocks", "type": "uint256" },
          { "internalType": "uint256", "name": "encodedSlices", "type": "uint256" }
        ],
        "internalType": "struct IDASigners.Params",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_epoch", "type": "uint256" }],
    "name": "quorumCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "X", "type": "uint256" },
          { "internalType": "uint256", "name": "Y", "type": "uint256" }
        ],
        "internalType": "struct BN254.G1Point",
        "name": "_signature",
        "type": "tuple"
      }
    ],
    "name": "registerNextEpoch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "signer", "type": "address" },
          { "internalType": "string", "name": "socket", "type": "string" },
          {
            "components": [
              { "internalType": "uint256", "name": "X", "type": "uint256" },
              { "internalType": "uint256", "name": "Y", "type": "uint256" }
            ],
            "internalType": "struct BN254.G1Point",
            "name": "pkG1",
            "type": "tuple"
          },
          {
            "components": [
              { "internalType": "uint256[2]", "name": "X", "type": "uint256[2]" },
              { "internalType": "uint256[2]", "name": "Y", "type": "uint256[2]" }
            ],
            "internalType": "struct BN254.G2Point",
            "name": "pkG2",
            "type": "tuple"
          }
        ],
        "internalType": "struct IDASigners.SignerDetail",
        "name": "_signer",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "uint256", "name": "X", "type": "uint256" },
          { "internalType": "uint256", "name": "Y", "type": "uint256" }
        ],
        "internalType": "struct BN254.G1Point",
        "name": "_signature",
        "type": "tuple"
      }
    ],
    "name": "registerSigner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_account", "type": "address" },
      { "internalType": "uint256", "name": "_epoch", "type": "uint256" }
    ],
    "name": "registeredEpoch",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_socket", "type": "string" }],
    "name": "updateSocket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

</details>

## Interface

### Structs

#### `SignerDetail`
```solidity
struct SignerDetail {
    address signer;
    string socket;
    BN254.G1Point pkG1;
    BN254.G2Point pkG2;
}
```
- **Description**: Contains details of a signer, including the address, socket, and bn254 public keys (G1 and G2 points).

- **Fields**:
  - `signer`: The address of the signer.
  - `socket`: The socket associated with the signer.
  - `pkG1`: The G1 public key of the signer.
  - `pkG2`: The G2 public key of the signer.

#### `Params`
```solidity
struct Params {
    uint tokensPerVote;
    uint maxVotesPerSigner;
    uint maxQuorums;
    uint epochBlocks;
    uint encodedSlices;
}
```
- **Description**: Defines parameters for the DAsigners module.

- **Fields**:
  - `tokensPerVote`: The number of tokens required for one vote.
  - `maxVotesPerSigner`: The maximum number of votes a signer can cast.
  - `maxQuorums`: The maximum number of quorums allowed.
  - `epochBlocks`: The number of blocks in an epoch.
  - `encodedSlices`: The number of encoded slices in one DA blob.

---

### Functions

#### `params()`
```solidity
function params() external view returns (Params memory);
```
- **Description**: Retrieves the current parameters of the DAsigners module.
- **Returns**: `Params` structure containing the current module parameters.

---

#### `epochNumber()`
```solidity
function epochNumber() external view returns (uint);
```
- **Description**: Returns the current epoch number.
- **Returns**: `uint` representing the current epoch number.

---

#### `quorumCount(uint _epoch)`
```solidity
function quorumCount(uint _epoch) external view returns (uint);
```
- **Description**: Returns the number of quorums for a given epoch.
- **Parameters**: 
  - `_epoch`: The epoch number.
- **Returns**: `uint` representing the quorum count for the given epoch.

---

#### `isSigner(address _account)`
```solidity
function isSigner(address _account) external view returns (bool);
```
- **Description**: Checks if a given account is a registered signer.
- **Parameters**: 
  - `_account`: The address to check.
- **Returns**: `bool` indicating whether the account is a signer.

---

#### `getSigner(address[] memory _account)`
```solidity
function getSigner(
    address[] memory _account
) external view returns (SignerDetail[] memory);
```
- **Description**: Retrieves details for the signers of the provided addresses.
- **Parameters**: 
  - `_account`: An array of addresses to fetch the signer details for.
- **Returns**: An array of `SignerDetail` structures for each signer.

---

#### `getQuorum(uint _epoch, uint _quorumId)`
```solidity
function getQuorum(
    uint _epoch,
    uint _quorumId
) external view returns (address[] memory);
```
- **Description**: Returns the addresses of the members in a specific quorum for a given epoch.
- **Parameters**: 
  - `_epoch`: The epoch number.
  - `_quorumId`: The ID of the quorum.
- **Returns**: An array of addresses that are members of the quorum.

---

#### `getQuorumRow(uint _epoch, uint _quorumId, uint32 _rowIndex)`
```solidity
function getQuorumRow(
    uint _epoch,
    uint _quorumId,
    uint32 _rowIndex
) external view returns (address);
```
- **Description**: Retrieves a specific address from a quorum's row for a given epoch and quorum ID.
- **Parameters**: 
  - `_epoch`: The epoch number.
  - `_quorumId`: The quorum ID.
  - `_rowIndex`: The row index within the quorum.
- **Returns**: The address at the specified row index in the quorum.

---

#### `registerSigner(SignerDetail memory _signer, BN254.G1Point memory _signature)`
```solidity
function registerSigner(
    SignerDetail memory _signer,
    BN254.G1Point memory _signature
) external;
```
- **Description**: Registers a new signer with the provided details and signature.
- **Parameters**: 
  - `_signer`: The details of the signer to register.
  - `_signature`: The signature to verify the registration.

---

#### `updateSocket(string memory _socket)`
```solidity
function updateSocket(string memory _socket) external;
```
- **Description**: Updates the socket used by the module.
- **Parameters**: 
  - `_socket`: The new socket address to update.

---

#### `registeredEpoch(address _account, uint _epoch)`
```solidity
function registeredEpoch(
    address _account,
    uint _epoch
) external view returns (bool);
```
- **Description**: Checks if a specific account is registered in a given epoch.
- **Parameters**: 
  - `_account`: The address to check.
  - `_epoch`: The epoch number.
- **Returns**: `bool` indicating whether the account is registered for the specified epoch.

---

#### `registerNextEpoch(BN254.G1Point memory _signature)`
```solidity
function registerNextEpoch(BN254.G1Point memory _signature) external;
```
- **Description**: Registers the next epoch using the provided signature.
- **Parameters**: 
  - `_signature`: The signature used to register the next epoch.

---

#### `getAggPkG1(uint _epoch, uint _quorumId, bytes memory _quorumBitmap)`
```solidity
function getAggPkG1(
    uint _epoch,
    uint _quorumId,
    bytes memory _quorumBitmap
) external view returns (BN254.G1Point memory aggPkG1, uint total, uint hit);
```
- **Description**: Retrieves the aggregated public key for a given epoch and quorum ID.
- **Parameters**: 
  - `_epoch`: The epoch number.
  - `_quorumId`: The quorum ID.
  - `_quorumBitmap`: The quorum bitmap.
- **Returns**: 
  - `aggPkG1`: The aggregated public key.
  - `total`: The number of rows.
  - `hit`: The number of rows that contributed to the aggregation.
