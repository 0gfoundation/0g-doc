---
id: inference-provider
title: Inference Provider
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Become an Inference Provider

Transform your AI services into verifiable, revenue-generating endpoints on the 0G Compute Network. This guide covers setting up your service and connecting it through the provider broker.

## Why Become a Provider?

- **Monetize Your Infrastructure**: Turn idle GPU resources into revenue
- **Automated Settlements**: The broker handles billing and payments automatically
- **Trust Through Verification**: Offer verifiable services for premium rates

## Prerequisites
- Docker Compose 1.27+
- OpenAI-compatible model service
- Wallet with 0G tokens for gas fees

## Setup Process

### Prepare Your Model Service

#### Service Interface Requirements
Your AI service must implement the [OpenAI API Interface](https://platform.openai.com/docs/api-reference/chat) for compatibility. This ensures consistent user experience across all providers.

#### Verification Interfaces
To ensure the integrity and trustworthiness of services, different verification mechanisms are employed. Each mechanism comes with its own specific set of protocols and requirements to ensure service verification and security.

<Tabs>
<TabItem value="teeml" label="TEE Verification (TeeML)" default>
TEE (Trusted Execution Environment) verification ensures your computations are tamper-proof. Services running in TEE:
- Generate signing keys within the secure environment
- Provide CPU and GPU attestations
- Sign all inference results

These attestations should include the public key of the signing key, verifying its creation within the TEE. All inference results must be signed with this signing key.

### Hardware Requirements

- **CPU**: Intel TDX (Trusted Domain Extensions) enabled
- **GPU**: NVIDIA H100 or H200 with TEE support

### TEE Node Setup

There are two ways to start a TEE node for your inference service:

#### Method 1: Using Dstack

Follow the [Dstack Getting Started Guide](https://github.com/Dstack-TEE/dstack?tab=readme-ov-file#-getting-started) to prepare your TEE node using Dstack.

#### Method 2: Using Cryptopilot

Follow the [0G-TAPP README](https://github.com/0gfoundation/0g-tapp/blob/main/README.md) to set up your TEE node using Cryptopilot.

### Download and Configure Inference Broker

To register and manage TEE services, handle user request proxies, and perform settlements, you need to use the Inference Broker.

Please visit the [releases page](https://github.com/0gfoundation/0g-serving-broker/releases) to download and extract the latest version of the installation package. After extracting, use the executable `config` file to generate the configuration file and docker-compose.yml file according to your setup.

```bash
# Download from releases page
tar -xzf inference-broker.tar.gz
cd inference-broker

# Generate configuration files
./config
```


</TabItem>
<TabItem value="future" label="OPML, ZKML (Coming Soon)">
Support for additional verification methods including:
- **OPML**: Optimistic Machine Learning proofs
- **ZKML**: Zero-knowledge ML verification

Stay tuned for updates.
</TabItem>
</Tabs>


### Launch Provider Broker

Follow the instructions in [Dstack](https://github.com/Dstack-TEE/dstack?tab=readme-ov-file#-getting-started) or [0G-TAPP](https://github.com/0gfoundation/0g-tapp/blob/main/README.md) documentation to start the service using the config file and docker-compose.yml file generated in the previous step.

The broker will:
- Register your service on the network
- Handle user authentication and request routing
- Manage automatic settlement of payments

## Troubleshooting

<details>
<summary><b>Broker fails to start</b></summary>

- Verify Docker Compose is installed correctly
- Check port availability
- Ensure config.local.yaml syntax is valid
- Review logs: `docker compose logs`
</details>

<details>
<summary><b>Service not accessible</b></summary>

- Confirm firewall allows incoming connections
- Verify public IP/domain is correct
- Test local service: `curl http://localhost:8000/chat/completions`
</details>

<details>
<summary><b>Settlement issues</b></summary>

The automatic settlement engine handles payments. If issues occur:
- Check wallet has sufficient gas
- Verify network connectivity
- Monitor settlement logs in broker output
</details>

## Next Steps
- **Join Community** → [Discord](https://discord.gg/0glabs) for support
- **Explore Inference** → [Inference Documentation](./inference) for integration details