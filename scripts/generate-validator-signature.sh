#! /bin/bash

set -e

if [ ! -e "./bin/0gchaind" ]; then
    echo "./bin/0gchaind not exit"
    exit 1
fi

echo "Please input HOMEDIR(default is ./0g-home/0gchaind-home)"
read HOMEDIR
if [ -z $HOMEDIR ]; then
    HOMEDIR=./0g-home/0gchaind-home
fi
# echo $HOMEDIR

echo "Please input CHAIN_SPEC(default is testnet)"
read CHAIN_SPEC
if [ -z $CHAIN_SPEC ] || [ "$CHAIN_SPEC" == "devnet" ] || [ "$CHAIN_SPEC" == "testnet" ]; then
    CHAIN_SPEC=devnet
    RPC_URL=https://evmrpc-testnet.0g.ai
    STAKING_CONTRACT_ADDRESS=0xea224dBB52F57752044c0C86aD50930091F561B9
    VALIDATOR_INITIAL_DELEGATION_IN_GWEI=32000000000
else
    echo "$CHAIN_SPEC not supported"
    exit 1
fi
# echo $CHAIN_SPEC
# echo $RPC_URL

echo "Please input VALIDATOR_INITIAL_DELEGATION_IN_ETHER(default is 32)"
read VALIDATOR_INITIAL_DELEGATION_IN_ETHER
if [ -z $VALIDATOR_INITIAL_DELEGATION_IN_ETHER ]; then
    VALIDATOR_INITIAL_DELEGATION_IN_GWEI=32000000000
elif [[ "$VALIDATOR_INITIAL_DELEGATION_IN_ETHER" =~ ^[0-9]+$ ]]; then
    VALIDATOR_INITIAL_DELEGATION_IN_GWEI=$(echo "$VALIDATOR_INITIAL_DELEGATION_IN_ETHER * 1000000000" | bc)
else
    echo "$VALIDATOR_INITIAL_DELEGATION_IN_ETHER not a integer"
    exit 1
fi
# echo $VALIDATOR_INITIAL_DELEGATION_IN_GWEI

validator_keys=$(./bin/0gchaind deposit validator-keys --home $HOMEDIR --chaincfg.chain-spec=$CHAIN_SPEC)
pubkey=${validator_keys: -98}
# echo $pubkey

result=$(curl -s -X POST ${RPC_URL} \
-H "Content-Type: application/json" \
-d '{
    "jsonrpc":"2.0",
    "method":"eth_call", 
    "params":[{
        "to": "'${STAKING_CONTRACT_ADDRESS}'",
        "data": "0x1ab06aa700000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030'${pubkey:2:96}'00000000000000000000000000000000"
    }, "latest"],
    "id":1
}' | jq .result)
validator_address=0x${result:27:40}
# echo $validator_address


validator_deposit=$(./bin/0gchaind deposit create-validator \
    $validator_address \
    $VALIDATOR_INITIAL_DELEGATION_IN_GWEI \
    $HOMEDIR/config/genesis.json \
    --home $HOMEDIR \
    --chaincfg.chain-spec=$CHAIN_SPEC)
signature=${validator_deposit: -194}

echo "✅ Staking message created successfully!\n"

echo "pubkey: $pubkey"
echo "validator_address: $validator_address"
echo "signature: $signature\n"

echo "To initialize the validator, you need to call the createAndInitializeValidatorIfNecessary function with the pubkey and signature."
