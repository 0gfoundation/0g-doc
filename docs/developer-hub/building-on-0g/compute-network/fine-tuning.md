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
# IMPORTANT: You must specify --service fine-tuning, otherwise funds go to the inference sub-account
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 2 --service fine-tuning
```

:::tip
If you see `MinimumDepositRequired` when creating a task, it means you haven't transferred funds to the provider's **fine-tuning** sub-account. Make sure to include `--service fine-tuning` in the `transfer-fund` command.
:::

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
└──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

- **Provider x:** The address of the provider.
- **Available:** Indicates if the provider is available. If `✓`, the provider is available. If `✗`, the provider is occupied.

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
| `distilbert-base-uncased` | Text Classification | DistilBERT model, smaller and faster than BERT. More details: [HuggingFace](https://huggingface.co/distilbert/distilbert-base-uncased) |
| `Qwen2.5-0.5B-Instruct` | Causal LM | Qwen 2.5 instruction-tuned model (0.5B parameters). More details: [HuggingFace](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct) |
| `Qwen3-32B` | Causal LM | Qwen 3 large language model (32B parameters). More details: [HuggingFace](https://huggingface.co/Qwen/Qwen3-32B) |

</details>

The output consists of two main sections:

- **Predefined Models:** Models provided by the system as predefined options. They are built-in, curated, and maintained to ensure quality and reliability.

- **Provider's Model:** Models offered by external service providers. Providers may customize or fine-tune models to address specific needs.

:::caution Model Name Format
Use model names **without** the `Qwen/` prefix when specifying the `--model` parameter. For example:
- ✅ `--model "Qwen2.5-0.5B-Instruct"`
- ❌ `--model "Qwen/Qwen2.5-0.5B-Instruct"`
:::

### Prepare Configuration File
Please download the parameter file template for the model you wish to fine-tune from the [releases page](https://github.com/0gfoundation/0g-serving-broker/releases) and modify it according to your needs.

Example training configuration (`config.json`):
```json
{
  "neftune_noise_alpha": 5,
  "num_train_epochs": 1,
  "per_device_train_batch_size": 2,
  "learning_rate": 0.0002,
  "max_steps": 3
}
```

:::tip
Use decimal notation for `learning_rate` (e.g., `0.0002` instead of `2e-4`). Some JSON parsers may not accept scientific notation.
:::

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

Upload your dataset to 0G Storage. The returned root hash will be used when creating a task.

```bash
0g-compute-cli fine-tuning upload --data-path <PATH_TO_DATASET>
```

Output:
```bash
Root hash: 0xabc123...
```

> **Save the root hash** — you will need it in the next step.

### Create Task

Create a fine-tuning task. The fee will be **automatically calculated** by the broker based on the actual token count of your dataset.

**Option A: Using dataset root hash (recommended)**

If you already uploaded your dataset with the `upload` command:

```bash
0g-compute-cli fine-tuning create-task \
  --provider <PROVIDER_ADDRESS> \
  --model <MODEL_NAME> \
  --dataset <DATASET_ROOT_HASH> \
  --config-path <PATH_TO_CONFIG_FILE>
```

**Option B: Using local dataset file**

The CLI will automatically upload the dataset to 0G Storage and create the task in one step:

```bash
0g-compute-cli fine-tuning create-task \
  --provider <PROVIDER_ADDRESS> \
  --model <MODEL_NAME> \
  --dataset-path <PATH_TO_DATASET> \
  --config-path <PATH_TO_CONFIG_FILE>
```

**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `--provider` | Address of the service provider |
| `--model` | Name of the pretrained model (without `Qwen/` prefix) |
| `--dataset` | Root hash of the dataset on 0G Storage (Option A) |
| `--dataset-path` | Path to local dataset file — mutually exclusive with `--dataset` (Option B) |
| `--config-path` | Path to the training configuration file |
| `--gas-price` | Gas price (optional) |

The output will be like:

```bash
Verify provider...
Provider verified
Creating task (fee will be calculated automatically)...
Fee will be automatically calculated by the broker based on actual token count
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
│ Fee (neuron)                      │ 82                                                                                  │
├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ Progress                          │ Delivered                                                                           │
└───────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────┘
```

**Field Descriptions:**
- **ID**: Unique identifier for your fine-tuning task
- **Pre-trained Model Hash**: Hash identifier for the base model being fine-tuned
- **Dataset Hash**: Hash identifier for your training dataset (0G Storage root hash)
- **Training Params**: Configuration parameters used during fine-tuning
- **Fee (neuron)**: Total cost for the fine-tuning task (automatically calculated based on token count)
- **Progress**: Task status. Possible values are:
  - `Init`: Task submitted
  - `SettingUp`: Provider is preparing the environment (downloading dataset, etc.)
  - `SetUp`: Provider is ready to start training
  - `Training`: Provider is training the model
  - `Trained`: Provider has finished training
  - `Delivering`: Provider is encrypting and uploading the model to 0G Storage
  - `Delivered`: Fine-tuning result is ready for download
  - `UserAcknowledged`: User has downloaded and confirmed the result
  - `Finished`: Provider has settled fees and shared decryption key — task is completed
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

### Download and Acknowledge Model

Use the [Check Task](#monitor-progress) command to view task status. When the status changes to `Delivered`, the provider has completed fine-tuning and the encrypted model is ready. Download and acknowledge the model:

```bash
0g-compute-cli fine-tuning acknowledge-model \
  --provider <PROVIDER_ADDRESS> \
  --task-id <TASK_ID> \
  --data-path <PATH_TO_SAVE_MODEL>
```

The CLI will automatically download the encrypted model from 0G Storage. If 0G Storage download fails, it will fall back to downloading directly from the provider's TEE.

:::tip
`--data-path` can be either a file path or a directory. If you provide a directory, the CLI will automatically create a file named `model_<TASK_ID>.bin` inside it.
:::

**Note:** The model file downloaded with the above command is encrypted, and additional steps are required for decryption.

### Decrypt Model

After acknowledging the model, the provider automatically settles the fees and uploads the decryption key to the contract (encrypted with your public key). Use the `get-task` command to check the task status. **When the status changes to `Finished`**, you can decrypt the model:

```bash
0g-compute-cli fine-tuning decrypt-model \
  --provider <PROVIDER_ADDRESS> \
  --task-id <TASK_ID> \
  --encrypted-model <PATH_TO_ENCRYPTED_MODEL> \
  --output <PATH_TO_SAVE_DECRYPTED_MODEL>
```

The above command performs the following operations:

- Gets the encrypted key from the contract uploaded by the provider
- Decrypts the key using the user's private key
- Decrypts the model with the decrypted key

:::caution Wait for Settlement
After `acknowledge-model`, the provider needs about **1 minute** to settle fees and upload the decryption key. If you decrypt too early (status is still `UserAcknowledged` instead of `Finished`), you may see an error like `second arg must be public key`. Simply wait and retry.
:::

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

Download the same base model that was used for fine-tuning from HuggingFace:

```bash
# Install huggingface-cli if not already installed
pip install huggingface_hub

# Download the model (use the full HuggingFace model name with Qwen/ prefix)
huggingface-cli download Qwen/Qwen2.5-0.5B-Instruct --local-dir ./base_model
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

#### Upload Dataset Separately

You can upload a dataset to 0G Storage before creating a task:

```bash
0g-compute-cli fine-tuning upload --data-path <PATH_TO_DATASET>
```

#### Download Data

You can download previously uploaded datasets from 0G Storage:

```bash
0g-compute-cli fine-tuning download --data-path <PATH_TO_SAVE_DATASET> --data-root <DATASET_ROOT_HASH>
```

#### View Task List

You can view the list of tasks submitted to a specific provider using the following command:

```bash
0g-compute-cli fine-tuning list-tasks  --provider <PROVIDER_ADDRESS>
```

#### Cancel a Task

You can cancel a task before it starts running using the following command:

```bash
0g-compute-cli fine-tuning cancel-task --provider <PROVIDER_ADDRESS> --task <TASK_ID>
```

**Note:** Tasks that are already in progress or completed cannot be canceled.

## Troubleshooting

<details>
<summary><b>Error: MinimumDepositRequired</b></summary>

This means the provider's fine-tuning sub-account has insufficient funds. Make sure to include `--service fine-tuning` when transferring funds:

```bash
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 2 --service fine-tuning
```

</details>

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
0g-compute-cli deposit --amount 3
0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 2 --service fine-tuning
```
</details>

<details>
<summary><b>Error: "second arg must be public key" when decrypting</b></summary>

This means the provider hasn't finished settlement yet. Wait about 1 minute after `acknowledge-model`, then check the task status:

```bash
0g-compute-cli fine-tuning get-task --provider <PROVIDER_ADDRESS> --task <TASK_ID>
```

When `Progress` shows `Finished`, retry the `decrypt-model` command.
</details>

<details>
<summary><b>Error: "Unexpected non-whitespace character after JSON" when creating task</b></summary>

Check your training configuration JSON file:
- Ensure valid JSON format
- Use decimal notation for numbers (e.g., `0.0002` instead of `2e-4`)
- Verify no trailing commas
</details>
