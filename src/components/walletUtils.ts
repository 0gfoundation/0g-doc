// Shared helpers for the wallet "Add network" buttons (MetaMaskButton, OKXButton).
// Keep wallet-agnostic logic here so the two buttons can't drift apart.

export type WalletStatus = { kind: 'success' | 'error' | 'info'; message: string };

// Chain id as the 0x-prefixed hex string the wallet RPC methods expect.
export const getChainID = (networkId: string | number): string => {
  const numeric = typeof networkId === 'string' ? parseInt(networkId) : networkId;
  return '0x' + Number(numeric).toString(16);
};

// MetaMask/OKX mobile nest the EIP-1193 error code under data.originalError.code
// instead of exposing it at the top level (e.g. 4902 for an unknown chain), so
// read both. https://github.com/MetaMask/metamask-mobile/issues/3312
export const errorCode = (e: any): number | undefined => e?.code ?? e?.data?.originalError?.code;

// A normal mobile browser can't expose a wallet extension, so there's no
// injected provider to talk to. Detect mobile (incl. iPadOS, which reports a
// desktop UA but is touch-capable) so callers can hand off to the wallet app.
export const isMobile = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Android|iPhone|iPod/i.test(ua) || /iPad/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
};

// Social apps' in-app browsers (WKWebView/Android WebView) don't reliably hand
// universal links off to a wallet app, so a deep link dead-ends there. Detect
// the common ones so callers can guide the user to a real browser instead.
// https://github.com/MetaMask/metamask-mobile/issues/4025
export const inAppBrowserName = (): string | null => {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent || '';
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return 'Facebook';
  if (/Instagram/.test(ua)) return 'Instagram';
  if (/Twitter/.test(ua)) return 'X';
  if (/Line\//.test(ua)) return 'LINE';
  if (/MicroMessenger/.test(ua)) return 'WeChat';
  if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) return 'TikTok';
  if (/Telegram/i.test(ua)) return 'Telegram';
  if (/Snapchat/.test(ua)) return 'Snapchat';
  if (/LinkedInApp/.test(ua)) return 'LinkedIn';
  return null;
};
