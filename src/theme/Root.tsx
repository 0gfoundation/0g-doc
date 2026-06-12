import React, {type ReactNode} from 'react';
import {AskAIWidget} from '@0gfoundation/ask-ai-widget';
import '@0gfoundation/ask-ai-widget/styles.css';

// Docusaurus Root wrapper — renders once around every page, so each page gets
// the floating "Ask AI" chat button (bottom-right). The widget talks to the
// build.0g.ai chat backend (0G Compute, same RAG knowledge index as
// build.0g.ai/ask); docs.0g.ai is in that backend's CORS allowlist.
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <AskAIWidget
        apiUrl="https://build.0g.ai/api/chat"
        turnstileSiteKey="1x00000000000000000000AA"
      />
    </>
  );
}
