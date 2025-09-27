---
id: cli
title: Fine-tuning CLI
sidebar_position: 5
---

# Fine-tuning CLI

Customize AI models with your own data using 0G's distributed GPU network.

## Quick Start

### Prerequisites
Node version >= 22.0.0

### Install CLI

```bash
pnpm install @0glabs/0g-serving-broker -g
```

### Set Environment

```bash
export RPC_ENDPOINT=https://evmrpc-testnet.0g.ai  # Optional, this is default
export ZG_PRIVATE_KEY=your_private_key_here
```

### Create Account & Add Funds
The Fine-tuning CLI requires an account to pay for service fees via the 0G Compute Network. You can create an account with the following command:

```bash
# Create account with 0.1 OG
0g-compute-cli add-account --amount 0.1
```

### List Providers
```bash
0g-compute-cli list-providers
```
The output will be like:
```bash
┌──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Provider 1                                       │ 0xf07240Efa67755B5311bc75784a061eDB47165Dd       │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ Available                                        │ ✓                                                │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ Price Per Byte in Dataset (OG)                   │ 0.000000000000000001                             │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ Provider 2                                       │ ......                                           │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ ......                                           │ ......                                           │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

- **Provider x:** The address of the provider. The address of the official provider is ```0xf07240Efa67755B5311bc75784a061eDB47165Dd```.
- **Available:** Indicates if the provider is available. If ```✓```, the provider is available. If ```✗```, the provider is occupied.
- **Price Per Byte in Dataset (OG):** The service fee charged by the provider. The fee is currently based on the byte count of the dataset. Future versions may charge more accurately based on the token count of the dataset.

### List Models

```bash
# List available models
0g-compute-cli list-models
```

<details>
<summary><b>📋 Available Models Summary</b></summary>

The CLI displays two categories of models: predefined models available across all providers and provider-specific models with unique capabilities.

#### Predefined Models
These are standard models available across all providers:

| Model Name | Type | Description |
|------------|------|-------------|
| `distilbert-base-uncased` | Text Classification | DistilBERT is a transformers model, smaller and faster than BERT, which was pretrained on the same corpus in a self-supervised fashion, using the BERT base model as a teacher. More details: [HuggingFace](https://huggingface.co/distilbert/distilbert-base-uncased) |

</details>

The output consists of two main sections:

- **Predefined Models:** These are models that are provided by the system as predefined options. They are typically built-in, curated, and maintained to ensure quality, reliability, and broad applicability across common use cases.

- **Provider's Model:** These models are offered by external service providers. Providers may customize or fine-tune models to address specific needs, industries, or advanced use cases. The availability and quality of these models may vary depending on the provider.

*Note:* We currently offer the models listed above as presets. You can choose one of these models for fine-tuning. More models will be provided in future versions.

### Prepare Configuration File
Please download the parameter file template for the model you wish to fine-tune from the [releases page](https://github.com/0gfoundation/0g-serving-broker/releases) and modify it according to your needs.

*Note:* For custom models provided by third-party Providers, you can download the usage template including instructions on how to construct the dataset and training configuration using the following command:

```bash
0g-compute-cli model-usage --provider <PROVIDER_ADDRESS>  --model <MODEL_NAME>   --output <PATH_TO_SAVE_MODEL_USAGE>
```

### Prepare Your Data

Please download the dataset format specification and verification script from the [releases page](https://github.com/0gfoundation/0g-serving-broker/releases) to make sure your generated dataset complies with the requirements.

### Upload Dataset

```bash
# Upload to 0G Storage
0g-compute-cli upload --data-path <PATH_TO_DATASET>

# Output: Root hash: 0xabc123... (save this!)
```
> Record the root hash of the dataset; they will be needed in later steps.

### Calculate Dataset Size

After uploading the dataset to storage, you can calculate its size by running the following command:

```bash
0g-compute-cli calculate-token \
  --model <MODEL_NAME> \
  --dataset-path <PATH_TO_DATASET> \
  --provider <PROVIDER_ADDRESS>
```

### Create Task

After calculating the dataset size, you can create a task by running the following command:

```bash
0g-compute-cli create-task \
  --provider <PROVIDER_ADDRESS> \
  --model <MODEL_NAME> \
  --dataset <DATASET_ROOT_HASH> \
  --config-path <PATH_TO_CONFIG_FILE> \
  --data-size <DATASET_SIZE>
```

**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `--provider` | Address of the service provider |
| `--model` | Name of the pretrained model |
| `--dataset` | Root hash of the dataset on 0G Storage |
| `--config-path` | Path to the parameter file |
| `--data-size` | Size of the dataset |
| `--gas-price` | Gas price (optional) |

The output will be like:

```bash
Verify provider...
Provider verified
Creating task...
Created Task ID: 6b607314-88b0-4fef-91e7-43227a54de57
```

*Note:* When creating a task for the same provider, you must wait for the previous task to be completed (status `Finished`) before creating a new task. If the provider is currently running other tasks, you will be prompted to choose between adding your task to the waiting queue or canceling the request.

### Monitor Progress
You can monitor the progress of your task by running the following command:

```bash
0g-compute-cli get-task --provider <PROVIDER_ADDRESS> --task <TASK_ID>
```

The output will be like:

```bash
┌───────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────┐
│ Field                             │ Value                                                                               │
├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ ID                                │ beb6f0d8-4660-4c62-988d-00246ce913d2                                                │
├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ Created At                        │ 2025-03-11T01:20:07.644Z                                                            │
├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ Pre-trained Model Hash            │ 0xcb42b5ca9e998c82dd239ef2d20d22a4ae16b3dc0ce0a855c93b52c7c2bab6dc                  │
├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ Dataset Hash                      │ 0xaae9b4e031e06f84b20f10ec629f36c57719ea512992a6b7e2baea93f447a5fa                  │
├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ Training Params                   │ {......}                                                                            │
├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ Fee (neuron)                      │ 179668154                                                                           │
├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ Progress                          │ Delivered                                                                           │
└───────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────┘
```

**Field Descriptions:**
- **ID**: Unique identifier for your fine-tuning task
- **Pre-trained Model Hash**: Storage reference for the base model being fine-tuned
- **Dataset Hash**: Storage reference for your training dataset
- **Training Params**: Configuration parameters used during fine-tuning
- **Fee (neuron)**: Total cost for the fine-tuning task
- **Progress**: Task status. Possible values are Init, SettingUp, SetUp, Training, Trained, Delivering, Delivered, UserAcknowledged, Finished, Failed. These represent the following states, respectively:
  - `Init`: Task submitted
  - `SettingUp`: Provider is preparing the environment to run the task
  - `SetUp`: Provider is ready to start training the model
  - `Training`: Provider is training the model
  - `Trained`: provider has finished the training
  - `Delivering`: Provider is uploading the fine-tuning result to storage
  - `Delivered`: provider has uploaded the fine-tuning result
  - `UserAcknowledged`: User has confirmed the result is downloadable
  - `Finished`: Task is completed
  - `Failed`: Task failed

### View Task Logs

You can view the logs of your task by running the following command:

```bash
0g-compute-cli get-log --provider <PROVIDER_ADDRESS> --task <TASK_ID>
```

The output will be like:

```bash
creating task....
Step: 0, Logs: {'loss': ..., 'accuracy': ...}
...
Training model for task beb6f0d8-4660-4c62-988d-00246ce913d2 completed successfully
```

### Confirm Task Result

Use the [Check Task](#monitor-progress) command to view task status. When the status changes to `Delivered`, it indicates that the provider has completed the fine-tuning task and uploaded the result to storage. The corresponding root hash has also been saved to the contract. You can download the model with the following command; CLI will download the model based on the root hash submitted by the provider. If the download is successful, CLI updates the contract information to confirm the model is downloaded.

```bash
0g-compute-cli acknowledge-model --provider <PROVIDER_ADDRESS> --task-id <TASK_ID> --data-path <PATH_TO_SAVE_MODEL>
```

**Note:** The model file downloaded with the above command is encrypted, and additional steps are required for decryption.

### Decrypt Model

The provider will check the contract to verify if the user has confirmed the download, enabling the provider to settle fees successfully on the contract subsequently. Once the provider confirms the download, it uploads the key required for decryption to the contract, encrypted with the user's public key, and collects the fee. You can again use the `get-task` command to view the task status. When the status changes to `Finished`, it means the provider has uploaded the key. At this point, you can decrypt the model with the following command:

```bash
0g-compute-cli decrypt-model --provider <PROVIDER_ADDRESS> --task-id <TASK_ID> --encrypted-model <PATH_TO_ENCRYPTED_MODEL> --output <PATH_TO_SAVE_DECRYPTED_MODEL>
```

The above command performs the following operations:

- Gets the encrypted key from the contract uploaded by the provider
- Decrypts the key using the user's private key
- Decrypts the model with the decrypted key

**Note:** The decrypted result will be saved as a zip file. Ensure that the `<PATH_TO_SAVE_DECRYPTED_MODEL>` ends with .zip (e.g., model_output.zip). After downloading, unzip the file to access the decrypted model.

### Account Management

#### View Account

```bash
0g-compute-cli get-account
```

Possible output:

```
  Overview
┌──────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────┐
│ Balance                                          │ Value (OG)                                                                      │
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Total                                            │ 0.999999999820331942                                                            │
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Locked (transferred to sub-accounts)             │ 0.000000000179668154                                                            │
└──────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────┘

  Fine-tuning sub-accounts (Dynamically Created per Used Provider)
┌──────────────────────────────────────────────────┬──────────────────────────────┬──────────────────────────────────────────────────┐
│ Provider                                         │ Balance (OG)                 │ Requested Return to Main Account (OG)            │
├──────────────────────────────────────────────────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC       │ 0.000000000179668154         │ 0.000000000000000000                             │
├──────────────────────────────────────────────────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ ......                                           │ ......                       │ ......                                           │
└──────────────────────────────────────────────────┴──────────────────────────────┴──────────────────────────────────────────────────┘
```

**Overview:** Provides a general overview of the account's balance.

- **Total:** The current balance of the account
- **Locked:** The cumulative amount locked in all sub-accounts

**Fine-tuning sub-accounts:** Information about sub-accounts, with each sub-account corresponding to a provider for paying the provider's service fee. Each sub-account is dynamically created when tasks are submitted.

- **Provider:** Address of the provider corresponding to the sub-account
- **Balance:** Balance of the sub-account, which is an amount transferred from the main account to the sub-account based on the task fee whenever a task is created.
- **Requested Return to Main Account:** Amount requested to be returned from sub-accounts to the main account. If the amount in the sub-account goes unspent for any reason, such as a task failure, you can use the return-funds command to return the balance to the main account. However, it won't return immediately and will only be available after a lock-in period. For details, refer to [Retrieving Funds](#retrieve-funds).

**Note:** For more information about sub-accounts, refer to [View Sub-Account](#view-sub-account).

#### Deposit

You can deposit into your account using the following command.

```bash
0g-compute-cli deposit --amount <AMOUNT>
```

#### Withdrawal

You can withdraw to your wallet with the following command:

```bash
0g-compute-cli refund --amount <AMOUNT>
```

**Note:** You can't withdraw the "Lock" amount in the account; only the "Total-Lock" portion can be withdrawn.

#### View Sub-Account

Sub-accounts are dynamically created when tasks are submitted and used to pay provider service fees. You can view sub-account information with the following command:

```bash
0g-compute-cli get-sub-account --provider <PROVIDER_ADDRESS>
```

Possible output:

```
  Overview
┌──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Field                                            │ Value                                            │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ Provider                                         │ 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC       │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ Balance (OG)                                     │ 0.000000000179668154                             │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ Funds Applied for Return to Main Account (OG)    │ 0.000000000179668154                             │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘

  Details of Each Amount Applied for Return to Main Account
┌──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Amount (OG)                                      │ Remaining Locked Time                            │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ 0.000000000179668154                             │ 23h 58min 34s                                    │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘

  Deliverables
┌───────────────────────────────────────────────────────────────────────────┬─────────────────────────┐
│ Root Hash                                                                 │ Access Confirmed         │
├───────────────────────────────────────────────────────────────────────────┼─────────────────────────┤
│ 0x24951e897b1203e8aa1692736837f089a95b70390cc02723505e41ebf9              │ ✓                       │
│ cac70c                                                                    │                         │
├───────────────────────────────────────────────────────────────────────────┼─────────────────────────┤
│ 0x85b3869bcf14569bb41c3d7d499c9a8eb441e6d606bbe3e10e0fac90e5              │                         │
│ 7d36a4                                                                    │                         │
└───────────────────────────────────────────────────────────────────────────┴─────────────────────────┘
```

**Overview:** An overview of the account

- **Provider:** Address of the provider corresponding to the sub-account
- **Balance:** Balance of the sub-account. The main account transfers a certain amount to the sub-account based on the task fee every time a task is created.
- **Funds Applied for Return to Main Account:** Amount in the sub-account requested to be returned to the main account

**Details of Each Amount Applied for Return to Main Account:** Detailed information about amounts requested to be returned to the main account

- **Amount:** Amount requested to be returned to the main account
- **Remaining Locked Time:** Remaining locked time for the return amount to be available in the main account

**Deliverables:** Deliverables issued by the provider after task completion

- **Root Hash:** Root hash of the model uploaded to storage
- **Access Confirmed:** Indicates whether the user has confirmed download access to the model based on the root hash

#### Retrieve Funds

The retrieve funds operation returns the balance from sub-accounts to the main account. This operation is asynchronous and will execute after a specific locking period of 24 hours. The lock time ensures provider rights protection, preventing the user from immediately returning the balance to the main account after provider services are rendered and stopping the provider from getting paid.

```bash
0g-compute-cli retrieve-fund
```

The above command requests the balance from all sub-accounts to be returned to the main account. After the lock-in period elapses, execute the retrieve-fund command again to refund all the amounts whose locking period has concluded to the main account. Check the refund status using the View Sub-Account command.

### Other Commands

#### View Task List

You can view the list of tasks submitted to a specific provider using the following command:

```bash
0g-compute-cli list-tasks  --provider <PROVIDER_ADDRESS>
```

#### Download Data

You can download previously uploaded datasets using the command below:

```bash
0g-compute-cli download --data-path <PATH_TO_SAVE_DATASET> --data-root <DATASET_ROOT_HASH>
```

#### Cancel a Task

You can cancel a task before it starts running using the following command:

```bash
0g-compute-cli cancel-task --provider <PROVIDER_ADDRESS> --task <TASK_ID>
```

**Note:** Tasks that are already in progress or completed cannot be canceled.

## Troubleshooting

<details>
<summary><b>Error: Provider busy</b></summary>

The provider is processing another task. Options:
1. Wait and retry later
2. Use a different provider: `0g-compute-cli list-providers`
3. Queue your task (you'll be prompted)
</details>

<details>
<summary><b>Error: Insufficient balance</b></summary>

Add more funds:
```bash
0g-compute-cli deposit --amount 0.1
```
</details>
