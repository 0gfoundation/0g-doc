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
- Wallet with OG tokens for gas fees (see [Testnet Details](/docs/developer-hub/testnet/testnet-overview.md))

## Setup Process

### Prepare Your Model Service

#### Service Interface Requirements
Your AI service must implement the [OpenAI API Interface](https://platform.openai.com/docs/api-reference/chat) for compatibility. This ensures a consistent user experience across all providers.

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

### Implementation

#### 1. Attestation Download Interface

Expose this endpoint:
```
GET https://{PUBLIC_IP}/attestation/report
```

Return format:
```json
{
  "signing_address": "0x...",
  "nvidia_payload": "..."
}
```

> *Note*: The nvidia_payload must be verifiable via NVIDIA's GPU Attestation API. Support for decentralized TEE attestation is planned for the future, and relevant interfaces will be provided. Stay tuned.

#### 2. Signature Download Interface

For each response with a unique ID:
```
GET https://{PUBLIC_IP}/signature/{response_id}
```

Requirements:
- Use ECDSA algorithm for signatures
- Signatures must be verifiable with the signing address
- Include both request and response content in signature

</TabItem>
<TabItem value="future" label="OPML, ZKML (Coming Soon)">
Support for additional verification methods including:
- **OPML**: Optimistic Machine Learning proofs
- **ZKML**: Zero-knowledge ML verification

Stay tuned for updates.
</TabItem>
</Tabs>



### Download and Configure Inference Broker
To register and manage services, handle user request proxies, and perform settlements, you need to use the Inference Broker.

Please visit the [releases page](https://github.com/0gfoundation/0g-serving-broker/releases) to download and extract the latest version of the installation package.

```bash
# Download from releases page
wget https://github.com/0gfoundation/0g-serving-broker/releases/download/v0.2.0/inference-broker.tar.gz
tar -xzf inference-broker.tar.gz
cd inference-broker

# Copy configuration template
cp config.example.yaml config.local.yaml
```

Edit `config.local.yaml`:
```yaml
servingUrl: "https://your-public-ip:8080"    # Public endpoint
privateKeys: "YOUR_WALLET_PRIVATE_KEY"       # For settlements
targetUrl: "http://localhost:8000"           # Your model service
model: "llama-3.3-70b-instruct"              # Model identifier
```
:::info Serving URL
Serving URL must be publicly accessible from the internet.
:::

### Configure Docker Port

Configure the Docker port to match your `servingUrl` port from `config.local.yaml`. Replace `#PORT#` in the `docker-compose.yml` file with the same port you specified in your `servingUrl`.

For example, if your `servingUrl` is `"https://your-public-ip:8080"`, use port `8080`:

```bash
# Replace #PORT# with your service port (must match servingUrl)
sed -i 's/#PORT#/8080/g' docker-compose.yml
```

:::warning Port Consistency
Ensure the port in `docker-compose.yml` matches the port in your `servingUrl` from `config.local.yaml`. Mismatched ports will prevent the service from being accessible.
:::

### Launch Provider Broker

```bash
# Start the broker service
docker compose -f docker-compose.yml up -d

# Monitor logs
docker compose logs -f
```

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
- **Explore SDK** → [SDK Documentation](./sdk) for integration details
