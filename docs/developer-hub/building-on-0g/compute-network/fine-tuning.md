---
id: fine-tuning
title: Fine-tuning
sidebar_position: 5
---

# Fine-tuning

Customize AI models with your own data using 0G's distributed GPU network (currently available on testnet only).

## Quick Start

### Prerequisites
Node version >= 22.0.0

### Install CLI

```bash
pnpm install @0glabs/0g-serving-broker -g
```

### Set Environment

#### Choose Network
```bash
# Setup network (fine-tuning currently supports testnet only)
0g-compute-cli setup-network
```

**Important**: Fine-tuning services are currently available on **testnet only**. Mainnet support will be added in future releases.

#### Login with Wallet
Enter your wallet private key when prompted.
```bash
# Login with your wallet private key
0g-compute-cli login
```

### Create Account & Add Funds
The Fine-tuning CLI requires an account to pay for service fees via the 0G Compute Network.

**For detailed account management instructions, see [Account Management](./account-management).**

```bash
# Deposit funds to your account
0g-compute-cli deposit --amount 0.1

# Transfer funds to a provider for fine-tuning
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 0.1
```

### List Providers
```bash
0g-compute-cli fine-tuning list-providers
```
The output will be like:
```bash
┌──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Provider 1                                       │ 0xf07240Efa67755B5311bc75784a061eDB47165Dd       │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ Available                                        │ ✓                                                │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ Price Per Byte in Dataset (0G)                   │ 0.000000000000000001                             │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ Provider 2                                       │ ......                                           │
├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ ......                                           │ ......                                           │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

- **Provider x:** The address of the provider. The address of the official provider is ```0xf07240Efa67755B5311bc75784a061eDB47165Dd```.
- **Available:** Indicates if the provider is available. If ```✓```, the provider is available. If ```✗```, the provider is occupied.
- **Price Per Byte in Dataset (0G):** The service fee charged by the provider. The fee is currently based on the byte count of the dataset. Future versions may charge more accurately based on the token count of the dataset.

### List Models

```bash
# List available models
0g-compute-cli fine-tuning list-models
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
0g-compute-cli fine-tuning model-usage --provider <PROVIDER_ADDRESS>  --model <MODEL_NAME>   --output <PATH_TO_SAVE_MODEL_USAGE>
```

### Prepare Your Data

Please download the dataset format specification and verification script from the [releases page](https://github.com/0gfoundation/0g-serving-broker/releases) to make sure your generated dataset complies with the requirements.

### Upload Dataset

```bash
# Upload to 0G Storage
0g-compute-cli fine-tuning upload --data-path <PATH_TO_DATASET>

# Output: Root hash: 0xabc123... (save this!)
```
> Record the root hash of the dataset; they will be needed in later steps.

### Calculate Dataset Size

After uploading the dataset to storage, you can calculate its size by running the following command:

```bash
0g-compute-cli fine-tuning calculate-token \
  --model <MODEL_NAME> \
  --dataset-path <PATH_TO_DATASET> \
  --provider <PROVIDER_ADDRESS>
```

### Create Task

After calculating the dataset size, you can create a task by running the following command:

```bash
0g-compute-cli fine-tuning create-task \
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
0g-compute-cli fine-tuning get-task --provider <PROVIDER_ADDRESS> --task <TASK_ID>
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
0g-compute-cli fine-tuning get-log --provider <PROVIDER_ADDRESS> --task <TASK_ID>
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
0g-compute-cli fine-tuning acknowledge-model --provider <PROVIDER_ADDRESS> --task-id <TASK_ID> --data-path <PATH_TO_SAVE_MODEL>
```

**Note:** The model file downloaded with the above command is encrypted, and additional steps are required for decryption.

### Decrypt Model

The provider will check the contract to verify if the user has confirmed the download, enabling the provider to settle fees successfully on the contract subsequently. Once the provider confirms the download, it uploads the key required for decryption to the contract, encrypted with the user's public key, and collects the fee. You can again use the `get-task` command to view the task status. When the status changes to `Finished`, it means the provider has uploaded the key. At this point, you can decrypt the model with the following command:

```bash
0g-compute-cli fine-tuning decrypt-model --provider <PROVIDER_ADDRESS> --task-id <TASK_ID> --encrypted-model <PATH_TO_ENCRYPTED_MODEL> --output <PATH_TO_SAVE_DECRYPTED_MODEL>
```

The above command performs the following operations:

- Gets the encrypted key from the contract uploaded by the provider
- Decrypts the key using the user's private key
- Decrypts the model with the decrypted key

**Note:** The decrypted result will be saved as a zip file. Ensure that the `<PATH_TO_SAVE_DECRYPTED_MODEL>` ends with .zip (e.g., model_output.zip). After downloading, unzip the file to access the decrypted model.

### Account Management

For comprehensive account management, including viewing balances, managing sub-accounts, and handling refunds, see [Account Management](./account-management).

Quick CLI commands:
```bash
# Check balance
0g-compute-cli get-account

# View sub-account for a provider
0g-compute-cli get-sub-account --provider <PROVIDER_ADDRESS>

# Request refund from sub-accounts
0g-compute-cli retrieve-fund
```

### Other Commands

#### View Task List

You can view the list of tasks submitted to a specific provider using the following command:

```bash
0g-compute-cli fine-tuning list-tasks  --provider <PROVIDER_ADDRESS>
```

#### Download Data

You can download previously uploaded datasets using the command below:

```bash
0g-compute-cli fine-tuning download --data-path <PATH_TO_SAVE_DATASET> --data-root <DATASET_ROOT_HASH>
```

#### Cancel a Task

You can cancel a task before it starts running using the following command:

```bash
0g-compute-cli fine-tuning cancel-task --provider <PROVIDER_ADDRESS> --task <TASK_ID>
```

**Note:** Tasks that are already in progress or completed cannot be canceled.

## Troubleshooting

<details>
<summary><b>Error: Provider busy</b></summary>

The provider is processing another task. Options:
1. Wait and retry later
2. Use a different provider: `0g-compute-cli fine-tuning list-providers`
3. Queue your task (you'll be prompted)
</details>

<details>
<summary><b>Error: Insufficient balance</b></summary>

Add more funds:
```bash
0g-compute-cli deposit --amount 0.1
```
</details>
