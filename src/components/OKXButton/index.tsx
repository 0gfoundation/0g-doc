import React, { useState } from 'react';
import { getChainID, errorCode, isMobile, inAppBrowserName, WalletStatus } from '../walletUtils';

declare global {
  interface Window {
    okxwallet?: any;
  }
}

// OKX's official universal link: reopen the current page in the OKX app's
// in-app browser (which injects window.okxwallet). The inner okx:// deep link
// is wrapped so OKX also offers its install page when the app isn't present.
// https://web3.okx.com/build/docs/waas/app-universal-link
const okxDeepLink = (): string => {
  const inner = 'okx://wallet/dapp/url?dappUrl=' + encodeURIComponent(window.location.href);
  return 'https://web3.okx.com/download?deeplink=' + encodeURIComponent(inner);
};

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
  label = "Add 0G Testnet",
  chainId: inputChainId = '16602',
  chainName = '0G-Testnet-Galileo',
  tokenSymbol = '0G',
  tokenName = '0G',
  tokenDecimals = 18,
  rpcUrls = ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls = ['https://chainscan-galileo.0g.ai/']
}: OKXButtonProps): JSX.Element {
  // Inline, screen-reader-announced feedback (replaces alert()/console.log).
  const [status, setStatus] = useState<WalletStatus | null>(null);
  // Guards against double-clicks that would trigger the wallet's -32002.
  const [busy, setBusy] = useState(false);

  // Add the chain, then report the outcome. Used when a switch reveals the
  // chain isn't in the wallet yet.
  const addChain = async (desiredChainHex: string) => {
    try {
      await window.okxwallet.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: desiredChainHex,
          chainName,
          nativeCurrency: { name: tokenName, symbol: tokenSymbol, decimals: tokenDecimals },
          rpcUrls,
          blockExplorerUrls,
        }],
      });
      setStatus({ kind: 'success', message: `${chainName} added to OKX Wallet.` });
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

    if (typeof window.okxwallet === 'undefined') {
      // On mobile there's no extension; hand off to the OKX app, whose in-app
      // browser injects window.okxwallet. A social app's in-app browser can't
      // do that handoff, so guide the user to a real browser instead.
      if (isMobile()) {
        const webview = inAppBrowserName();
        if (webview) {
          setStatus({
            kind: 'info',
            message: `You're in ${webview}'s in-app browser, which can't open OKX Wallet. Open this page in your default browser (use the menu → "Open in browser"), then tap again.`,
          });
          return;
        }
        window.location.href = okxDeepLink();
        return;
      }
      setStatus({
        kind: 'error',
        message: 'OKX Wallet not found. Install the OKX Wallet extension, then try again.',
      });
      return;
    }

    const desiredChainHex = getChainID(inputChainId);
    setBusy(true);
    try {
      try {
        await window.okxwallet.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: desiredChainHex }] });
        // Verify the active chain, since mobile can resolve a switch without
        // actually switching for an unknown chain (returns null, not 4902).
        const current = await window.okxwallet.request({ method: 'eth_chainId' });
        if (typeof current === 'string' && current.toLowerCase() === desiredChainHex.toLowerCase()) {
          setStatus({ kind: 'success', message: `Switched to ${chainName}.` });
          return;
        }
        await addChain(desiredChainHex);
      } catch (switchError: any) {
        const code = errorCode(switchError);
        if (code === 4001) {
          setStatus({ kind: 'info', message: 'Request cancelled.' });
          return;
        }
        if (code === -32002) {
          setStatus({ kind: 'info', message: 'Check OKX Wallet — a request is already open.' });
          return;
        }
        // 4902 (in any shape) or anything else → the chain isn't added yet.
        await addChain(desiredChainHex);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <button
        onClick={addNetwork}
        disabled={busy}
        aria-busy={busy}
        style={{
          backgroundColor: '#101D42', // OKX brand color
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
          src="/img/okx.svg"
          alt="OKX Wallet"
          style={{ height: '18px' }}
        />
        {busy ? 'Check OKX Wallet…' : label}
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
