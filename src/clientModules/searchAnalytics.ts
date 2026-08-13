/**
 * Sends GA4 `search` events with the term users type into the local search
 * (navbar dropdown and /search page), so we can see what people actually
 * look for and fine-tune the docs.
 *
 * Listens via delegation because the search bar mounts/unmounts on
 * navigation. `window.gtag` only exists on production deploys (the gtag
 * plugin is gated on VERCEL_ENV === 'production' in docusaurus.config.ts),
 * so this is a no-op on staging, previews, and local builds.
 */

const SEARCH_INPUT_SELECTOR =
  'input.navbar__search-input, input[type="search"][name="q"]';
const DEBOUNCE_MS = 1000;
const MIN_TERM_LENGTH = 2;

if (typeof document !== 'undefined') {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastSent = '';

  const send = (rawTerm: string) => {
    const searchTerm = rawTerm.trim().toLowerCase();
    const gtag = (window as {gtag?: (...args: unknown[]) => void}).gtag;
    if (
      typeof gtag !== 'function' ||
      searchTerm.length < MIN_TERM_LENGTH ||
      searchTerm === lastSent
    ) {
      return;
    }
    lastSent = searchTerm;
    gtag('event', 'search', {search_term: searchTerm});
  };

  document.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    if (!target.matches?.(SEARCH_INPUT_SELECTOR)) {
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => send(target.value), DEBOUNCE_MS);
  });

  // Enter submits/navigates before the debounce fires — flush immediately.
  document.addEventListener('keydown', (event) => {
    const target = event.target as HTMLInputElement;
    if (event.key !== 'Enter' || !target.matches?.(SEARCH_INPUT_SELECTOR)) {
      return;
    }
    clearTimeout(timer);
    send(target.value);
  });
}

export {};
