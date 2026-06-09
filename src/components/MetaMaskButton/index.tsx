import React, { useEffect, useRef, useState } from 'react';
import { getChainID, errorCode, isMobile, inAppBrowserName, consumeUrlFlag, WalletStatus } from '../walletUtils';

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

// Other wallets (OKX, Brave, etc.) frequently set isMetaMask = true to
// impersonate MetaMask, so that flag alone can't be trusted — only fall back
// to it after EIP-6963 discovery fails, and exclude known impersonators.
const isImpersonator = (p: any): boolean =>
  Boolean(p?.isOkxWallet || p?.isOKExWallet || p?.isCoinbaseWallet || p?.isTrust || p?.isTrustWallet || p?.isBraveWallet);

// Deep link that reopens the current page inside the MetaMask mobile app's
// in-app browser, where a provider IS injected. Format is link.metamask.io/dapp
// followed by the URL without its scheme. The `mmadd` flag tells the page to
// auto-resume the add once it reloads in MetaMask's browser. See:
// https://docs.metamask.io/sdk/guides/use-deeplinks/
const metamaskDeepLink = (): string => {
  const url = new URL(window.location.href);
  url.searchParams.set('mmadd', '1');
  return `https://link.metamask.io/dapp/${url.host}${url.pathname}${url.search}`;
};

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
  chainName = '0G Galileo Testnet',
  tokenSymbol = '0G',
  tokenName = '0G',
  tokenDecimals = 18,
  rpcUrls = ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls = ['https://chainscan-galileo.0g.ai/']
}: MetaMaskButtonProps): JSX.Element {
  // Inline, screen-reader-announced feedback (replaces alert()/console.log).
  const [status, setStatus] = useState<WalletStatus | null>(null);
  // Guards against double-clicks that would trigger MetaMask's -32002.
  const [busy, setBusy] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // Add the chain, then report the outcome. Used when a switch reveals the
  // chain isn't in the wallet yet.
  const addChain = async (provider: any, desiredChainHex: string) => {
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: desiredChainHex,
          chainName,
          nativeCurrency: { name: tokenName, symbol: tokenSymbol, decimals: tokenDecimals },
          rpcUrls,
          blockExplorerUrls,
        }],
      });
      setStatus({ kind: 'success', message: `${chainName} added to MetaMask.` });
    } catch (addError: any) {
      if (errorCode(addError) === 4001) {
        setStatus({ kind: 'info', message: 'Request cancelled.' });
      } else {
        setStatus({ kind: 'error', message: `Could not add ${chainName}. Please try again.` });
      }
    }
  };

  const addNetwork = async () => {
    if (busy) return;
    setStatus(null);

    const provider = resolveMetaMaskProvider();
    if (!provider) {
      // On mobile there's no extension to inject a provider, so reopen this
      // page in the MetaMask app's in-app browser, where the button works.
      // (Inside that browser a provider IS present, so we never reach here.)
      if (isMobile()) {
        // A social app's in-app browser can't hand off to MetaMask, and the
        // deep link would dead-end there — guide the user to a real browser.
        const webview = inAppBrowserName();
        if (webview) {
          setStatus({
            kind: 'info',
            message: `You're in ${webview}'s in-app browser, which can't open MetaMask. Open this page in your default browser (use the menu → "Open in browser"), then tap again.`,
          });
          return;
        }
        window.location.href = metamaskDeepLink();
        return;
      }
      setStatus({
        kind: 'error',
        message:
          'MetaMask not found. If you have multiple wallet extensions (e.g. OKX, Coinbase), set MetaMask as your default or disable the others, then try again.',
      });
      return;
    }

    const desiredChainHex = getChainID(inputChainId);
    setBusy(true);
    try {
      // Try to switch, and add the chain if it isn't there yet.
      try {
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: desiredChainHex }] });
        // MetaMask mobile can resolve the switch WITHOUT switching for an
        // unknown chain (returns null instead of throwing 4902), so verify the
        // active chain and fall through to add if it didn't actually switch.
        // https://github.com/MetaMask/metamask-mobile/issues/12502
        const current = await provider.request({ method: 'eth_chainId' });
        if (typeof current === 'string' && current.toLowerCase() === desiredChainHex.toLowerCase()) {
          setStatus({ kind: 'success', message: `Switched to ${chainName}.` });
          return;
        }
        await addChain(provider, desiredChainHex);
      } catch (switchError: any) {
        const code = errorCode(switchError);
        if (code === 4001) {
          setStatus({ kind: 'info', message: 'Request cancelled.' });
          return;
        }
        if (code === -32002) {
          setStatus({ kind: 'info', message: 'Check MetaMask — a request is already open.' });
          return;
        }
        // 4902 (in any shape) or anything else → the chain isn't added yet.
        await addChain(provider, desiredChainHex);
      }
    } finally {
      setBusy(false);
    }
  };

  // If we just returned from the mobile deep link (now inside MetaMask's in-app
  // browser), scroll to the button and auto-resume the add once the provider is
  // available — MetaMask has no deep link that adds a network directly.
  useEffect(() => {
    if (!consumeUrlFlag('mmadd')) return;
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (resolveMetaMaskProvider()) {
        window.clearInterval(id);
        buttonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        void addNetwork();
      } else if (tries >= 20) {
        window.clearInterval(id);
      }
    }, 150);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ margin: '20px 0' }}>
      <button
        ref={buttonRef}
        onClick={addNetwork}
        disabled={busy}
        aria-busy={busy}
        style={{
          backgroundColor: '#E2761B',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: busy ? 'wait' : 'pointer',
          opacity: busy ? 0.7 : 1,
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
        {busy ? 'Check MetaMask…' : label}
      </button>
      {status && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: '10px',
            fontSize: '14px',
            color: status.kind === 'error' ? '#b00020' : status.kind === 'success' ? '#1a7f37' : '#555',
          }}>
          {status.message}
        </div>
      )}
    </div>
  );
} 