import React, {useEffect, useState, type ReactNode} from 'react';
import {AskAIWidget} from '@0gfoundation/ask-ai-widget';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import '@0gfoundation/ask-ai-widget/styles.css';

type SiteTheme = 'light' | 'dark' | 'auto';

// Docusaurus writes the chosen colour mode to <html data-theme="...">. Root
// sits above the theme's providers, so useColorMode() isn't available here;
// watching the attribute is what keeps the widget in step with the site's
// toggle rather than the OS setting.
function useSiteTheme(): SiteTheme {
  const [theme, setTheme] = useState<SiteTheme>('auto');
  useEffect(() => {
    const root = document.documentElement;
    const read = () => {
      const value = root.getAttribute('data-theme');
      setTheme(value === 'dark' || value === 'light' ? value : 'auto');
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, {attributes: true, attributeFilter: ['data-theme']});
    return () => observer.disconnect();
  }, []);
  return theme;
}

// Docusaurus Root wrapper — renders once around every page, so each page gets
// the floating "Ask AI" chat button (bottom-right). The widget talks to the
// Ask Zed chat backend at 0g.ai/zed (0G Compute, same RAG knowledge index
// as build.0g.ai/ask); docs.0g.ai is in that backend's CORS allowlist.
export default function Root({children}: {children: ReactNode}): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const turnstileSiteKey = siteConfig.customFields?.turnstileSiteKey as string;
  const theme = useSiteTheme();
  return (
    <>
      {children}
      <AskAIWidget
        apiUrl="https://0g.ai/zed/api/chat"
        turnstileSiteKey={turnstileSiteKey}
        theme={theme}
      />
    </>
  );
}
