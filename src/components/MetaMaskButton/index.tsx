import React from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface MetaMaskButtonProps {
  label?: string;
  chainId?: string | number;
  chainName?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimals?: number;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
}

export default function MetaMaskButton({
  label = "Add 0G Mainnet",
  chainId: inputChainId = 16661,
  chainName = "0G Mainnet",
  tokenSymbol = "0G",
  tokenName = "0G",
  tokenDecimals = 18,
  rpcUrls = ["https://evmrpc.0g.ai"],
  blockExplorerUrls = ["https://chainscan.0g.ai/"]
}: MetaMaskButtonProps): JSX.Element {
  const getChainID = (networkId: string | number): string => {
    const numeric = typeof networkId === 'string' ? parseInt(networkId) : networkId;
    return '0x' + Number(numeric).toString(16);
  };

  const addNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed! Please install MetaMask first.');
      return;
    }

    const desiredChainHex = getChainID(inputChainId);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainHex }]
      });
      return;
    } catch (switchError: any) {
      if (switchError && switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: desiredChainHex,
              chainName,
              nativeCurrency: {
                name: tokenName,
                symbol: tokenSymbol,
                decimals: tokenDecimals
              },
              rpcUrls,
              blockExplorerUrls
            }]
          });
          alert(`${chainName} added`);
          return;
        } catch (addError) {
          console.log(addError);
        }
      } else {
        console.log(switchError);
      }
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <button
        onClick={addNetwork}
        style={{
          backgroundColor: '#E2761B',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px'
        }}>
        <img
          src="/img/metamask.svg"
          alt="MetaMask Fox"
          style={{ height: '18px' }}
        />
        {label}
      </button>
    </div>
  );
}
