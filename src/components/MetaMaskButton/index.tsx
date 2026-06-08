import React, { useEffect, useRef, useState } from 'react';
import RemoveNewtonModal from '../RemoveNewtonModal';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// EIP-6963: wallets announce themselves with a stable rdns identifier instead
// of racing to overwrite window.ethereum. MetaMask's is `io.metamask`.
interface EIP6963ProviderDetail {
  info: { uuid: string; name: string; icon: string; rdns: string };
  provider: any;
}

const METAMASK_RDNS = 'io.metamask';

// Other wallets (OKX, etc.) frequently set isMetaMask = true to impersonate
// MetaMask, so that flag alone can't be trusted — only fall back to it after
// EIP-6963 discovery fails, and exclude known impersonators.
const isImpersonator = (p: any): boolean =>
  Boolean(p?.isOkxWallet || p?.isOKExWallet || p?.isCoinbaseWallet || p?.isTrust || p?.isTrustWallet);

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
  label = "Add 0G Testnet",
  chainId: inputChainId = '16602',
  chainName = '0G-Testnet-Galileo',
  tokenSymbol = '0G',
  tokenName = '0G',
  tokenDecimals = 18,
  rpcUrls = ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls = ['https://chainscan-galileo.0g.ai/']
}: MetaMaskButtonProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Collect EIP-6963 provider announcements as they arrive.
  const providersRef = useRef<EIP6963ProviderDetail[]>([]);
  useEffect(() => {
    const onAnnounce = (event: Event) => {
      const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
      if (!detail?.info?.uuid) return;
      if (!providersRef.current.some((p) => p.info.uuid === detail.info.uuid)) {
        providersRef.current = [...providersRef.current, detail];
      }
    };
    window.addEventListener('eip6963:announceProvider', onAnnounce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    return () => window.removeEventListener('eip6963:announceProvider', onAnnounce);
  }, []);

  // Resolve the genuine MetaMask provider rather than trusting window.ethereum,
  // which may be any injected wallet when several extensions are installed.
  const resolveMetaMaskProvider = (): any | null => {
    // 1. EIP-6963 — the only reliable signal (rdns can't be spoofed by the page).
    const announced = providersRef.current.find((p) => p.info.rdns === METAMASK_RDNS);
    if (announced) return announced.provider;

    // 2. Legacy multi-provider array, excluding known impersonators.
    const eth = window.ethereum;
    if (Array.isArray(eth?.providers)) {
      const mm = eth.providers.find((p: any) => p?.isMetaMask && !isImpersonator(p));
      if (mm) return mm;
    }

    // 3. Single injected provider, only if it genuinely looks like MetaMask.
    if (eth?.isMetaMask && !isImpersonator(eth)) return eth;

    return null;
  };

  const getChainID = (networkId: string | number): string => {
    const numeric = typeof networkId === 'string' ? parseInt(networkId) : networkId;
    return '0x' + Number(numeric).toString(16);
  };

  const addNetwork = async () => {
    const provider = resolveMetaMaskProvider();
    if (!provider) {
      alert(
        'MetaMask not found. If you have multiple wallet extensions installed (e.g. OKX, Coinbase), set MetaMask as your default or disable the others, then try again.'
      );
      return;
    }

    const desiredChainHex = getChainID(inputChainId);

    // For Galileo Testnet specifically, keep the legacy migration helper
    if (String(inputChainId) === '16601') {
      const changedToGalileo = await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: desiredChainHex }] }).catch(async () => {
        const changedToOldGalileo = await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: getChainID('80087') }] }).catch(async () => {
          const params = [{
            chainId: desiredChainHex,
            chainName,
            nativeCurrency: {
              name: tokenName,
              symbol: tokenSymbol,
              decimals: tokenDecimals
            },
            rpcUrls,
            blockExplorerUrls
          }];

          await provider.request({
            method: 'wallet_addEthereumChain',
            params
          }).catch((error: any) => {
            console.log(error);
          });
          return true;
        });

        if (changedToOldGalileo) {
          return false;
        }

        setIsModalOpen(true);
        return true;
      });

      if (changedToGalileo) {
        return false;
      }

      const currentChainId = await provider.request({ method: 'eth_chainId' });
      if (currentChainId === desiredChainHex) {
        alert('0G Testnet added');
        return;
      }
      return;
    }

    // Generic flow for other networks (e.g., Mainnet)
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainHex }]
      });
      return;
    } catch (switchError: any) {
      if (switchError && switchError.code === 4902) {
        try {
          await provider.request({
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
      <RemoveNewtonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
} 