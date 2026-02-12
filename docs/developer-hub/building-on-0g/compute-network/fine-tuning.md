---
id: fine-tuning
title: Fine-tuning
sidebar_position: 5
---

# Fine-tuning

Customize AI models with your own data using 0G's distributed GPU network.

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
# Setup network
0g-compute-cli setup-network
```

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
│ Provider 1                                       │ 0x940b4a101CaBa9be04b16A7363cafa29C1660B0d       │
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

| Model Name | Type | Price per Million Tokens | Description |
|------------|------|--------------------------|-------------|
| `Qwen2.5-0.5B-Instruct` | Causal LM | 0.5 0G | Qwen 2.5 instruction-tuned model (0.5B parameters). More details: [HuggingFace](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct) |
| `Qwen3-32B` | Causal LM | 4 0G | Qwen 3 large language model (32B parameters). More details: [HuggingFace](https://huggingface.co/Qwen/Qwen3-32B) |

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

Use the standard configuration template below and **only modify the parameter values** as needed. Do not add additional parameters.

#### Standard Configuration Template

```json
{
  "neftune_noise_alpha": 5,
  "num_train_epochs": 1,
  "per_device_train_batch_size": 2,
  "learning_rate": 0.0002,
  "max_steps": 3
}
```

:::caution Important Configuration Rules
1. **Use the template above** - Copy the entire template
2. **Only modify parameter values** - Do not add or remove parameters
3. **Use decimal notation** - Write `0.0002` instead of `2e-4` for `learning_rate`

**Common mistakes to avoid:**
- ❌ Adding extra parameters (e.g., `"fp16": true`, `"bf16": false`)
- ❌ Removing existing parameters
- ❌ Using scientific notation like `2e-4`
:::

#### Adjustable Parameters

You can modify these parameter values based on your training needs:

| Parameter | Description | Notes |
|-----------|-------------|-------|
| `neftune_noise_alpha` | Noise injection for fine-tuning | 0-10 (0 = disabled), typical: 5 |
| `num_train_epochs` | Number of complete passes through the dataset | Positive integer, typical: 1-3 for fine-tuning |
| `per_device_train_batch_size` | Training batch size | 1-4, reduce to 1 if out of memory |
| `learning_rate` | Learning rate (use decimal notation) | 0.00001-0.001, typical: 0.0002 |
| `max_steps` | Maximum training steps | -1 (use epochs) or positive integer |

:::tip GPU Memory Management
- If you encounter out-of-memory errors, **reduce batch size to 1**
- The provider automatically handles mixed precision training with `bf16`
:::

*Note:* For custom models provided by third-party Providers, you can download the usage template including instructions on how to construct the dataset and training configuration using the following command:

```bash
0g-compute-cli fine-tuning model-usage --provider <PROVIDER_ADDRESS>  --model <MODEL_NAME>   --output <PATH_TO_SAVE_MODEL_USAGE>
```

### Prepare Your Data

Your dataset must be in **JSONL format** with a **`.jsonl` file extension**. Each line is a JSON object representing one training example.

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

- **File format**: Must be a `.jsonl` file (JSONL format)
- **Minimum examples**: At least 10 examples recommended for meaningful fine-tuning
- **Quality**: Ensure examples are accurate and representative of your use case
- **Consistency**: Use the same format throughout the dataset
- **Encoding**: UTF-8 encoding required

### Create Task

Create a fine-tuning task. The fee will be **automatically calculated** by the broker based on the actual token count of your dataset.

**Option A: Using local dataset file (Recommended)**

The CLI will automatically upload the dataset to 0G Storage and create the task in one step:

```bash
0g-compute-cli fine-tuning create-task \
  --provider <PROVIDER_ADDRESS> \
  --model <MODEL_NAME> \
  --dataset-path <PATH_TO_DATASET> \
  --config-path <PATH_TO_CONFIG_FILE>
```

**Option B: Using dataset root hash**

If you prefer to upload the dataset separately first, or need to reuse the same dataset:

1. Upload your dataset to 0G Storage:

```bash
0g-compute-cli fine-tuning upload --data-path <PATH_TO_DATASET>
```

Output:
```bash
Root hash: 0xabc123...
```

2. Create the task using the root hash:

```bash
0g-compute-cli fine-tuning create-task \
  --provider <PROVIDER_ADDRESS> \
  --model <MODEL_NAME> \
  --dataset <DATASET_ROOT_HASH> \
  --config-path <PATH_TO_CONFIG_FILE>
```

**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `--provider` | Address of the service provider |
| `--model` | Name of the pretrained model (without `Qwen/` prefix) |
| `--dataset-path` | Path to local dataset file — automatically uploads to 0G Storage (Option A) |
| `--dataset` | Root hash of the dataset on 0G Storage — mutually exclusive with `--dataset-path` (Option B) |
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

### Fee Calculation

The fine-tuning service fee is **automatically calculated** based on your dataset size and training configuration. The fee consists of two components:

#### Formula

```
Total Fee = Training Fee + Storage Reserve Fee
```

Where:
- **Training Fee** = `(tokenSize / 1,000,000) × pricePerMillionTokens × trainEpochs`
- **Storage Reserve Fee** = Fixed amount based on model size

#### Components Explained

| Component | Description |
|-----------|-------------|
| `tokenSize` | Total number of tokens in your dataset (automatically counted) |
| `pricePerMillionTokens` | Price per million tokens (model-specific, see [Predefined Models](#predefined-models)) |
| `trainEpochs` | Number of training epochs (from your config) |
| `Storage Reserve Fee` | Fixed fee to reserve storage for the fine-tuned model:<br/>• Qwen3-32B (~900 MB LoRA): 0.09 0G<br/>• Qwen2.5-0.5B-Instruct (~100 MB LoRA): 0.01 0G |

#### Example

For a dataset with 10,000 tokens, trained for 3 epochs on Qwen2.5-0.5B-Instruct:
- Price per million tokens = 0.5 0G (see [Predefined Models](#predefined-models))
- Training Fee = (10,000 / 1,000,000) × 0.5 × 3 = 0.015 0G
- Storage Reserve Fee = 0.01 0G (for Qwen2.5-0.5B-Instruct)
- **Total Fee = 0.025 0G**

:::tip
The actual fee is calculated during the setup phase after your dataset is analyzed. You can view the final fee using the [`get-task`](#monitor-progress) command before training begins.
:::

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
  --data-path <PATH_TO_SAVE_MODEL_FILE>
```

The CLI will automatically download the encrypted model from 0G Storage. If 0G Storage download fails, it will fall back to downloading directly from the provider's TEE.

:::danger 48-Hour Deadline
**You must download and acknowledge the model within 48 hours after the task status changes to `Delivered`.**

If you fail to acknowledge within 48 hours:
- The provider will **force settlement** automatically
- You will **lose access to the fine-tuned model**
- **30% of the total task fee** will be deducted as compensation for the provider's compute resources

**Action required:** Monitor your task status and download promptly when it reaches `Delivered`.
:::

:::caution File Path Required
`--data-path` **must be a file path**, not a directory.

**Example:**
```bash
0g-compute-cli fine-tuning acknowledge-model \
  --provider <PROVIDER_ADDRESS> \
  --task-id 0e91ef3d-ac0d-422e-a38c-9d42a28c4412 \
  --data-path /workspace/output/encrypted_model.bin
```
:::

:::tip Data Integrity Verification
The `acknowledge-model` command performs automatic data integrity verification to ensure the downloaded model matches the root hash that the provider submitted to the blockchain contract. This guarantees you receive the authentic model without corruption or tampering.
:::

**Note:** The model file downloaded with the above command is encrypted, and additional steps are required for decryption.

### Decrypt Model

After acknowledging the model, the provider automatically settles the fees and uploads the decryption key to the contract (encrypted with your public key). Use the `get-task` command to check the task status. **When the status changes to `Finished`**, you can decrypt the model:

```bash
0g-compute-cli fine-tuning decrypt-model \
  --provider <PROVIDER_ADDRESS> \
  --task-id <TASK_ID> \
  --encrypted-model <PATH_TO_ENCRYPTED_MODEL_FILE> \
  --output <PATH_TO_SAVE_DECRYPTED_MODEL>
```

**Example:**
```bash
# Use the same file path you specified in acknowledge-model
0g-compute-cli fine-tuning decrypt-model \
  --provider <PROVIDER_ADDRESS> \
  --task-id 0e91ef3d-ac0d-422e-a38c-9d42a28c4412 \
  --encrypted-model /workspace/output/encrypted_model.bin \
  --output /workspace/output/model_output.zip
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

# For Qwen2.5-0.5B-Instruct
huggingface-cli download Qwen/Qwen2.5-0.5B-Instruct --local-dir ./base_model

# For Qwen3-32B (requires ~65GB disk space)
# huggingface-cli download Qwen/Qwen3-32B --local-dir ./base_model
```

### Step 2: Load LoRA with Base Model

Use the following Python code to combine the LoRA adapter with the base model.

**For Qwen2.5-0.5B-Instruct:**

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

print("Model loaded successfully!")
```

**For Qwen3-32B (requires 40GB+ VRAM):**

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

# Paths
base_model_path = "./base_model"  # or "Qwen/Qwen3-32B"
lora_adapter_path = "./lora_adapter/output_model"

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(lora_adapter_path)

# Load base model with optimizations for large models
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_path,
    torch_dtype=torch.float16,      # Use fp16 to reduce memory
    device_map="auto",               # Automatically distribute across GPUs
    low_cpu_mem_usage=True,          # Reduce CPU memory usage during loading
    trust_remote_code=True           # Required for some Qwen models
)

# Load LoRA adapter
model = PeftModel.from_pretrained(base_model, lora_adapter_path)

print("Model loaded successfully!")
```

:::tip Memory Optimization for Large Models
If you encounter out-of-memory errors with Qwen3-32B, you can use quantization:

```python
# 8-bit quantization (requires bitsandbytes)
from transformers import BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(load_in_8bit=True)

base_model = AutoModelForCausalLM.from_pretrained(
    base_model_path,
    quantization_config=quantization_config,
    device_map="auto",
    trust_remote_code=True
)
```
:::

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

#### For GPU Environments (Recommended)

If you have an NVIDIA GPU, install PyTorch with CUDA support. **Important:** Match the CUDA version to your environment.

```bash
# For CUDA 12.1 (check your CUDA version with: nvidia-smi)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# For CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install other ML libraries
pip install transformers peft accelerate
```

#### For CPU-Only Environments

```bash
pip install torch transformers peft accelerate
```

#### Package Requirements

| Package | Minimum Version | Purpose |
|---------|-----------------|---------|
| `torch` | >= 2.0 | Deep learning framework |
| `transformers` | >= 4.40.0 | Model loading and inference |
| `peft` | >= 0.10.0 | LoRA adapter support |
| `accelerate` | >= 0.27.0 | Device management |

:::tip Verify GPU Support
After installation, verify that PyTorch can detect your GPU:
```bash
python3 -c "import torch; print('PyTorch version:', torch.__version__); print('CUDA available:', torch.cuda.is_available())"
```
If `CUDA available: False`, you may need to reinstall PyTorch with the correct CUDA version.
:::

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
