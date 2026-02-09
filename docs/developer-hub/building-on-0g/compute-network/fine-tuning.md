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
0g-compute-cli deposit --amount 3

# Transfer funds to a provider for fine-tuning
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 1
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

Your dataset should be in JSONL format. Each line is a JSON object representing one training example.

#### Supported Dataset Formats

**Format 1: Instruction-Input-Output**
```json
{"instruction": "Translate to French", "input": "Hello world", "output": "Bonjour le monde"}
{"instruction": "Translate to French", "input": "Good morning", "output": "Bonjour"}
{"instruction": "Summarize the text", "input": "Long article...", "output": "Brief summary"}
```

**Format 2: Chat Messages**
```json
{"messages": [{"role": "user", "content": "What is 2+2?"}, {"role": "assistant", "content": "2+2 equals 4."}]}
{"messages": [{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there! How can I help you?"}]}
```

**Format 3: Simple Text (for text completion)**
```json
{"text": "The quick brown fox jumps over the lazy dog."}
{"text": "Machine learning is a subset of artificial intelligence."}
```

#### Dataset Guidelines

- **Minimum examples**: At least 10 examples recommended for meaningful fine-tuning
- **Quality**: Ensure examples are accurate and representative of your use case
- **Consistency**: Use the same format throughout the dataset
- **Encoding**: UTF-8 encoding required

You can also download the dataset format specification and verification script from the [releases page](https://github.com/0gfoundation/0g-serving-broker/releases) to validate your dataset.

### Upload Dataset

You have two options for providing your dataset:

#### Option A: Upload to 0G Storage (Recommended for large datasets)

```bash
# Upload to 0G Storage
0g-compute-cli fine-tuning upload --data-path <PATH_TO_DATASET>

# Output: Root hash: 0xabc123... (save this!)
```
> Record the root hash of the dataset; it will be needed when creating the task.

#### Option B: Direct Upload to TEE (Simpler for small datasets)

You can skip the 0G Storage upload and provide the dataset directly when creating a task:

```bash
0g-compute-cli fine-tuning create-task \
  --provider <PROVIDER_ADDRESS> \
  --model <MODEL_NAME> \
  --dataset-path <PATH_TO_DATASET> \
  --config-path <PATH_TO_CONFIG_FILE> \
  --data-size <DATASET_SIZE>
```

This method uploads the dataset directly to the TEE (Trusted Execution Environment) during task creation. Use `--dataset-path` instead of `--dataset` when using this option.

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

#### Using 0G Storage (with root hash)

```bash
0g-compute-cli fine-tuning create-task \
  --provider <PROVIDER_ADDRESS> \
  --model <MODEL_NAME> \
  --dataset <DATASET_ROOT_HASH> \
  --config-path <PATH_TO_CONFIG_FILE> \
  --data-size <DATASET_SIZE>
```

#### Using Direct Upload (with local file)

```bash
0g-compute-cli fine-tuning create-task \
  --provider <PROVIDER_ADDRESS> \
  --model <MODEL_NAME> \
  --dataset-path <PATH_TO_LOCAL_DATASET> \
  --config-path <PATH_TO_CONFIG_FILE> \
  --data-size <DATASET_SIZE>
```

**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `--provider` | Address of the service provider |
| `--model` | Name of the pretrained model |
| `--dataset` | Root hash of the dataset on 0G Storage (use this OR `--dataset-path`) |
| `--dataset-path` | Path to local dataset file for direct TEE upload (use this OR `--dataset`) |
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

### Extract LoRA Adapter

After decryption, unzip the model to access the LoRA adapter files:

```bash
unzip model_output.zip -d ./lora_adapter/
```

The extracted folder will contain:

```
lora_adapter/
├── output_model/
│   ├── adapter_config.json       # LoRA configuration
│   ├── adapter_model.safetensors # LoRA weights
│   ├── tokenizer.json            # Tokenizer
│   ├── tokenizer_config.json
│   └── README.md
```

## Using the Fine-tuned Model

After fine-tuning, you receive a **LoRA adapter** (Low-Rank Adaptation), not a full model. To use it, you need to:

1. Download the base model
2. Load the LoRA adapter on top of the base model
3. Run inference

### Step 1: Download Base Model

Download the same base model that was used for fine-tuning:

**Option A: From HuggingFace (Recommended)**
```bash
# Install huggingface-cli if not already installed
pip install huggingface_hub

# Download the model
huggingface-cli download Qwen/Qwen2.5-0.5B-Instruct --local-dir ./base_model
```

**Option B: From 0G Storage**
```bash
# Use the model root hash from the task details
0g-compute-cli fine-tuning download \
  --data-path ./base_model \
  --data-root <MODEL_ROOT_HASH>
```

### Step 2: Load LoRA with Base Model

Use the following Python code to combine the LoRA adapter with the base model:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

# Paths
base_model_path = "./base_model"  # or "Qwen/Qwen2.5-0.5B-Instruct"
lora_adapter_path = "./lora_adapter/output_model"

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(lora_adapter_path)

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_path,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

# Load LoRA adapter
model = PeftModel.from_pretrained(base_model, lora_adapter_path)

# For inference (optional: merge for faster inference)
# model = model.merge_and_unload()

print("Model loaded successfully!")
```

### Step 3: Run Inference

```python
def generate_response(prompt, max_new_tokens=100):
    messages = [{"role": "user", "content": prompt}]
    
    # Apply chat template
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    # Tokenize
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    
    # Generate
    outputs = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        do_sample=True,
        temperature=0.7,
        top_p=0.9
    )
    
    # Decode
    response = tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)
    return response

# Example usage
response = generate_response("Hello, how are you?")
print(response)
```

### Optional: Merge and Save Full Model

If you want to create a standalone model without needing to load the adapter separately:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

# Load base model and LoRA
base_model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-0.5B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto"
)
model = PeftModel.from_pretrained(base_model, "./lora_adapter/output_model")

# Merge LoRA weights into base model
merged_model = model.merge_and_unload()

# Save the merged model
merged_model.save_pretrained("./merged_model")
tokenizer = AutoTokenizer.from_pretrained("./lora_adapter/output_model")
tokenizer.save_pretrained("./merged_model")

print("Merged model saved to ./merged_model")
```

### Requirements

Install the required Python packages:

```bash
pip install torch transformers peft accelerate
```

| Package | Minimum Version | Purpose |
|---------|-----------------|---------|
| `torch` | >= 2.0 | Deep learning framework |
| `transformers` | >= 4.40.0 | Model loading and inference |
| `peft` | >= 0.10.0 | LoRA adapter support |
| `accelerate` | >= 0.27.0 | Device management |

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
