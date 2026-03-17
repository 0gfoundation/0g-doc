import React from 'react';

declare global {
  interface Window {
    okxwallet?: any;
  }
}

interface OKXButtonProps {
  label?: string;
  chainId?: string | number;
  chainName?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimals?: number;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
}

export default function OKXButton({
  label = "Add 0G Mainnet",
  chainId: inputChainId = 16661,
  chainName = "0G Mainnet",
  tokenSymbol = "0G",
  tokenName = "0G",
  tokenDecimals = 18,
  rpcUrls = ["https://evmrpc.0g.ai"],
  blockExplorerUrls = ["https://chainscan.0g.ai/"]
}: OKXButtonProps): JSX.Element {
  const getChainID = (networkId: string | number): string => {
    const numeric = typeof networkId === 'string' ? parseInt(networkId) : networkId;
    return '0x' + Number(numeric).toString(16);
  };

  const addNetwork = async () => {
    if (typeof window.okxwallet === 'undefined') {
      alert('OKX Wallet is not installed! Please install OKX Wallet first.');
      return;
    }

    const chainId = getChainID(inputChainId);
    const currentChainId = await window.okxwallet.request({ method: 'eth_chainId' });
    if (currentChainId === chainId) {
      alert(`Already connected to ${chainName}!`);
      return;
    }

    try {
      await window.okxwallet.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.okxwallet.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId,
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
          backgroundColor: '#101D42', // OKX brand color
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
          src="/img/okx.svg"
          alt="OKX Wallet"
          style={{ height: '18px' }}
        />
        {label}
      </button>
    </div>
  );
}
