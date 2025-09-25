---
id: precompiles-wrappedogbase
title: Wrapped OG Base
---

# Overview

WrappedOGBase is a wrapper for the `x/wrapped-og-base` module in the 0g chain. WA0GI is a wrapped ERC20 token for native OG. It supports quota-based mint/burn functions based on native OG transfers, on top of traditional wrapped token implementation. The minting/burning quota for each address will be determined through governance voting. `x/wrapped-og-base` is the module that supports and maintains the minting/burning quota.

In most cases this precompile should be only called by wrapped OG contract.

# Address

`0x0000000000000000000000000000000000001002`

# Interface

[https://github.com/0gfoundation/0g-chain/blob/dev/precompiles/interfaces/contracts/IWrappedA0GIBase.sol](https://github.com/0gfoundation/0g-chain/blob/dev/precompiles/interfaces/contracts/IWrappedA0GIBase.sol)

## Structs

### `Supply`
```solidity
struct Supply {
    uint256 cap;
    uint256 initialSupply;
    uint256 supply;
}
```
- **Description**: Defines the supply details of a minter, including the cap, initial supply, and the current supply.
  
- **Fields**:
  - `cap`: The maximum allowed mint supply for the minter.
  - `initialSupply`: The initial mint supply to the minter, equivalent to the initial allowed burn amount.
  - `supply`: The current mint supply used by the minter, set to `initialSupply` at the beginning.

---

## Functions

### `getWA0GI()`
```solidity
function getWA0GI() external view returns (address);
```
- **Description**: Retrieves the address of the wrapped OG (WA0GI) contract.
- **Returns**: `address` of the WOG contract.

---

### `minterSupply(address minter)`
```solidity
function minterSupply(address minter) external view returns (Supply memory);
```
- **Description**: Retrieves the mint supply details for a given minter.
- **Parameters**: 
  - `minter`: The address of the minter.
- **Returns**: A `Supply` structure containing the mint cap, initial supply, and current supply of the specified minter.

---

### `mint(address minter, uint256 amount)`
```solidity
function mint(address minter, uint256 amount) external;
```
- **Description**: Mints OG to WA0GI contract and adds the corresponding amount to the minter's mint supply. If the minter's final mint supply exceeds their mint cap, the transaction will revert.
- **Parameters**: 
  - `minter`: The address of the minter.
  - `amount`: The amount of OG to mint.
- **Restrictions**: Can only be called by the WA0GI contract.

---

### `burn(address minter, uint256 amount)`
```solidity
function burn(address minter, uint256 amount) external;
```
- **Description**: Burns the specified amount of OG in WA0GI contract on behalf of the minter and reduces the corresponding amount from the minter's mint supply.
- **Parameters**: 
  - `minter`: The address of the minter.
  - `amount`: The amount of OG to burn.
- **Restrictions**: Can only be called by the WOG contract.

---
