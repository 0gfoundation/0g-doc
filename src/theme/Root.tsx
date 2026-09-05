import React, {type ReactNode} from 'react';
import {AskAIWidget} from '@0gfoundation/ask-ai-widget';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import '@0gfoundation/ask-ai-widget/styles.css';

// Docusaurus Root wrapper — renders once around every page, so each page gets
// the floating "Ask AI" chat button (bottom-right). The widget talks to the
// Ask Zed chat backend at 0g.ai/zed (0G Compute, same RAG knowledge index
// as build.0g.ai/ask); docs.0g.ai is in that backend's CORS allowlist.
export default function Root({children}: {children: ReactNode}): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const turnstileSiteKey = siteConfig.customFields?.turnstileSiteKey as string;
  return (
    <>
      {children}
      <AskAIWidget
        apiUrl="https://0g.ai/zed/api/chat"
        turnstileSiteKey={turnstileSiteKey}
      />
    </>
  );
}
