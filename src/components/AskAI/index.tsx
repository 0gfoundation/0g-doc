import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const lang = (className || '').replace(/^language-/, '') || 'code';
  const text = React.Children.toArray(children)
    .map((c) => (typeof c === 'string' ? c : ''))
    .join('');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };
  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.codeLang}>{lang}</span>
        <button className={styles.codeCopyBtn} onClick={copy} aria-label={copied ? 'Copied' : 'Copy code'}>
          {copied ? '✓ copied' : '⧉ copy'}
        </button>
      </div>
      <pre>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

const MARKDOWN_COMPONENTS = {
  code({ className, children, ...props }: any) {
    const isBlock = /language-/.test(className || '');
    if (!isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  pre({ children }: any) {
    return <>{children}</>;
  },
  a({ href, children, ...props }: any) {
    const isInternal = typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');
    if (isInternal) {
      return (
        <Link to={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
        {children}
      </a>
    );
  },
};

type Role = 'user' | 'assistant';
type Msg = { role: Role; content: string; chatId?: string };
type LinkCard = { path: string; title: string; description?: string };

const TG_HELP_URL = 'https://t.me/zgcommunity';
const WELCOME: Msg = {
  role: 'assistant',
  content:
    "Hi — I'm the 0G docs assistant. Ask me anything about this page or 0G in general. If I can't help, I'll hand off to a GitHub issue.",
};
const DOCS_LINK_RE = /\/(concepts|developer-hub|run-a-node|introduction|resources|node-sale)\/[A-Za-z0-9/_-]+/g;
const MAX_TEXTAREA_PX = 160;
const COLLAPSE_THRESHOLD_CHARS = 400;
const MIN_PANEL = { w: 320, h: 420 };
const MAX_PANEL = { w: 720, h: 900 };
const DEFAULT_PANEL = { w: 380, h: 560 };
const SIZE_KEY = 'askai:panelSize';
const COACH_KEY = 'askai:coached';
const COACH_STEPS = [
  {
    title: 'Ask the 0G AI',
    body: 'Press ⌘K (Ctrl+K on Windows) or click here anytime to ask about any docs page.',
    placement: 'fab' as const,
  },
  {
    title: 'I know this page',
    body: 'I read the page you are on, so you can ask specific questions like "explain this in one sentence."',
    placement: 'header' as const,
  },
  {
    title: 'If I get it wrong',
    body: 'Use "Still stuck? Get real help on TG" to chat with the 0G community for hands-on support.',
    placement: 'footer' as const,
  },
];

function extractPageTitle(markdown: string | null): string | null {
  if (!markdown) return null;
  const fm = markdown.match(/^---\s*([\s\S]*?)\s*---/);
  if (fm) {
    const t = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (t) return t[1].trim();
  }
  const h1 = markdown.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : null;
}

async function fetchPageMarkdown(pathname: string): Promise<string | null> {
  const clean = pathname.replace(/\/$/, '');
  const candidates = [`${clean || '/'}.md`, clean ? `${clean}/index.md` : null].filter(Boolean) as string[];
  for (const url of candidates) {
    try {
      const r = await fetch(url, { headers: { Accept: 'text/markdown' } });
      if (r.ok) {
        const txt = await r.text();
        if (txt && !txt.trim().startsWith('<')) return txt;
      }
    } catch {}
  }
  return null;
}

const GENERIC_HEADINGS = new Set([
  'overview', 'introduction', 'intro', 'getting started', 'next steps',
  'troubleshooting', 'contents', 'table of contents', 'examples', 'example',
  'usage', 'reference', 'api reference', 'changelog', 'faq', 'resources',
  'further reading', 'see also', 'summary', 'conclusion', 'notes', 'note',
  'tips', 'tip', 'caveats', 'about', 'background',
]);

const VERB_STARTERS = /^(install|deploy|set up|setup|run|create|configure|use|connect|fund|verify|stake|delegate|build|enable|disable|generate|sign|send|read|write|fetch|integrate|migrate|update|upgrade|test|debug|monitor|query|publish|register|claim|bridge|swap|transfer|withdraw|deposit|estimate|simulate|inspect|review|check|list|find|view|get|add|remove|start|stop|restart)\b/i;

const PLURAL_NOUN_HEADINGS = /^(prerequisites|requirements|limitations|features|benefits|use cases|risks|tradeoffs|caveats|guarantees|properties|parameters|inputs|outputs|errors|fees|costs|permissions|environment variables|env vars)$/i;

function rephraseHeading(raw: string, pageTitle: string | null): string | null {
  const h = raw.trim().replace(/[:?!.]+$/, '').replace(/\s+/g, ' ');
  if (!h || h.length < 3 || h.length > 60) return null;
  if (GENERIC_HEADINGS.has(h.toLowerCase())) return null;

  if (/^(how|what|why|when|where|which|can|should|do|does)\b/i.test(h)) {
    return h.endsWith('?') ? h : `${h}?`;
  }

  const vs = h.match(/^(.+?)\s+vs\.?\s+(.+)$/i);
  if (vs) return `What's the difference between ${vs[1]} and ${vs[2]}?`;

  if (PLURAL_NOUN_HEADINGS.test(h)) return `What are the ${h.toLowerCase()}?`;

  if (VERB_STARTERS.test(h)) {
    return `How do I ${h.charAt(0).toLowerCase() + h.slice(1)}?`;
  }

  if (/\b(CLI|SDK|API)\b/.test(h)) return `How do I use the ${h}?`;

  if (pageTitle) return `Explain "${h}" on this page`;
  return `What is ${h}?`;
}

function extractSuggestions(markdown: string | null): string[] {
  if (!markdown) return [];
  let pageTitle: string | null = null;
  const fm = markdown.match(/^---\s*([\s\S]*?)\s*---/);
  if (fm) {
    const t = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (t) pageTitle = t[1];
  }
  if (!pageTitle) {
    const h1 = markdown.match(/^#\s+(.+)$/m);
    if (h1) pageTitle = h1[1].trim();
  }

  const headings: string[] = [];
  for (const line of markdown.split('\n')) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) headings.push(m[1]);
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of headings) {
    const phrased = rephraseHeading(h, pageTitle);
    if (!phrased) continue;
    const key = phrased.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(phrased);
    if (out.length >= 3) break;
  }
  return out;
}

function extractFollowUps(reply: string): string[] {
  if (!reply) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  const pushTopic = (raw: string) => {
    const topic = raw.trim().replace(/[.,:;!?]+$/, '');
    const key = topic.toLowerCase();
    if (!topic || topic.length < 3 || topic.length > 60 || seen.has(key)) return;
    seen.add(key);
    out.push(`Tell me more about ${topic}`);
  };
  for (const m of Array.from(reply.matchAll(/\*\*([^*\n]{3,60})\*\*/g))) pushTopic(m[1]);
  if (out.length < 2) {
    for (const line of reply.split('\n')) {
      const h = line.match(/^#{2,4}\s+(.{3,60})$/);
      if (h) pushTopic(h[1]);
      if (out.length >= 3) break;
    }
  }
  if (out.length < 2) {
    for (const line of reply.split('\n')) {
      const b = line.match(/^\s*[-*]\s+\*?\*?([A-Z][^*\n:]{2,40})\*?\*?[:—-]/);
      if (b) pushTopic(b[1]);
      if (out.length >= 3) break;
    }
  }
  return out.slice(0, 3);
}

function extractDocLinks(reply: string, currentPath: string): string[] {
  if (!reply) return [];
  const here = currentPath.replace(/\/$/, '');
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of Array.from(reply.matchAll(DOCS_LINK_RE))) {
    const p = m[0].replace(/[).,;:]+$/, '').replace(/\/$/, '');
    if (p === here || seen.has(p)) continue;
    seen.add(p);
    out.push(p);
    if (out.length >= 3) break;
  }
  return out;
}

async function fetchLinkCard(path: string): Promise<LinkCard | null> {
  const md = await fetchPageMarkdown(path);
  if (!md) return null;
  let title = '';
  let description = '';
  const fm = md.match(/^---\s*([\s\S]*?)\s*---/);
  if (fm) {
    const t = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const d = fm[1].match(/^description:\s*["']?(.+?)["']?\s*$/m);
    if (t) title = t[1];
    if (d) description = d[1];
  }
  if (!title) {
    const h1 = md.match(/^#\s+(.+)$/m);
    if (h1) title = h1[1].trim();
  }
  if (!title) title = path;
  return { path, title, description };
}

function AssistantBubble({
  msg,
  isStreaming,
  currentPath,
}: {
  msg: Msg;
  isStreaming: boolean;
  currentPath: string;
}) {
  const [copied, setCopied] = useState(false);
  const [cards, setCards] = useState<LinkCard[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isStreaming || !msg.content) return;
    const paths = extractDocLinks(msg.content, currentPath);
    if (paths.length === 0) {
      setCards([]);
      return;
    }
    let cancelled = false;
    Promise.all(paths.map(fetchLinkCard)).then((results) => {
      if (cancelled) return;
      setCards(results.filter(Boolean) as LinkCard[]);
    });
    return () => {
      cancelled = true;
    };
  }, [msg.content, isStreaming, currentPath]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }, [msg.content]);

  const shouldCollapse =
    !isStreaming && !expanded && msg.content.length > COLLAPSE_THRESHOLD_CHARS;

  return (
    <div className={styles.assistantMsg}>
      {msg.content ? (
        <>
          <div className={shouldCollapse ? styles.collapsed : undefined}>
            <ReactMarkdown components={MARKDOWN_COMPONENTS}>{msg.content}</ReactMarkdown>
            {isStreaming && <span className={styles.cursor} aria-hidden="true" />}
          </div>
          {shouldCollapse && (
            <button className={styles.showMore} onClick={() => setExpanded(true)}>
              Show more
            </button>
          )}
          {expanded && msg.content.length > COLLAPSE_THRESHOLD_CHARS && (
            <button className={styles.showMore} onClick={() => setExpanded(false)}>
              Show less
            </button>
          )}
          <button
            className={styles.copyBtn}
            aria-label={copied ? 'Copied' : 'Copy reply'}
            onClick={copy}
          >
            {copied ? '✓' : '⧉'}
          </button>
        </>
      ) : isStreaming ? (
        <span className={styles.typing} aria-label="Thinking">
          <span className={styles.typingDot} />
          <span className={styles.typingDot} />
          <span className={styles.typingDot} />
        </span>
      ) : (
        <span />
      )}
      {msg.chatId && (
        <span className={styles.teeBadge} title={`TEE chat id: ${msg.chatId}`}>
          ✓ TEE-routed
        </span>
      )}
      {cards.length > 0 && (
        <div className={styles.cardList}>
          <div className={styles.cardListLabel}>Related pages</div>
          {cards.map((c) => (
            <Link key={c.path} className={styles.card} to={c.path}>
              <div className={styles.cardTitle}>{c.title}</div>
              {c.description && <div className={styles.cardDesc}>{c.description}</div>}
              <div className={styles.cardPath}>{c.path}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AskAIInner() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [coachStep, setCoachStep] = useState<number>(() => {
    if (typeof window === 'undefined') return -1;
    try {
      return window.localStorage.getItem(COACH_KEY) === '1' ? -1 : 0;
    } catch {
      return -1;
    }
  });
  const [size, setSize] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_PANEL;
    try {
      const raw = window.localStorage.getItem(SIZE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.w === 'number' && typeof parsed?.h === 'number') return parsed;
      }
    } catch {}
    return DEFAULT_PANEL;
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pageMarkdownRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchPageMarkdown(window.location.pathname).then((md) => {
      if (cancelled) return;
      pageMarkdownRef.current = md;
      setSuggestions(extractSuggestions(md));
      setPageTitle(extractPageTitle(md));
    });
    setTimeout(() => textareaRef.current?.focus(), 120);
    return () => {
      cancelled = true;
    };
  }, [open]);

  const startResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const start = { ...size };
      const onMove = (ev: PointerEvent) => {
        const dx = startX - ev.clientX;
        const dy = startY - ev.clientY;
        const w = Math.max(MIN_PANEL.w, Math.min(MAX_PANEL.w, start.w + dx));
        const h = Math.max(MIN_PANEL.h, Math.min(MAX_PANEL.h, start.h + dy));
        setSize({ w, h });
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        try {
          const latest = { w: size.w, h: size.h };
          window.localStorage.setItem(SIZE_KEY, JSON.stringify(latest));
        } catch {}
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [size],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SIZE_KEY, JSON.stringify(size));
    } catch {}
  }, [size]);

  useEffect(() => {
    if (coachStep === 0 && open) setCoachStep(1);
  }, [open, coachStep]);

  useEffect(() => {
    if (coachStep !== 1) return;
    if (messages.some((m) => m.role === 'user')) setCoachStep(2);
  }, [messages, coachStep]);

  const dismissCoach = useCallback(() => {
    setCoachStep(-1);
    try {
      window.localStorage.setItem(COACH_KEY, '1');
    } catch {}
  }, []);

  const advanceCoach = useCallback(() => {
    setCoachStep((s) => {
      const next = s + 1;
      if (next >= COACH_STEPS.length) {
        try {
          window.localStorage.setItem(COACH_KEY, '1');
        } catch {}
        return -1;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_PX)}px`;
  }, [input, open]);

  const runChat = useCallback(
    async (userText: string) => {
      setError(null);
      const withUser: Msg[] = [...messages, { role: 'user', content: userText }];
      setMessages([...withUser, { role: 'assistant', content: '' }]);
      setSending(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const pageContext = pageMarkdownRef.current ?? (await fetchPageMarkdown(window.location.pathname));
        pageMarkdownRef.current = pageContext;
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: withUser.filter((m) => m !== WELCOME),
            pageContext,
          }),
          signal: controller.signal,
        });
        const ct = res.headers.get('content-type') || '';
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData?.error || `Request failed (${res.status})`);
          setMessages(withUser);
          return;
        }
        if (ct.includes('text/event-stream') && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let streamed = '';
          let chatId: string | undefined;
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n');
            buffer = parts.pop() || '';
            for (const line of parts) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === '[DONE]') continue;
              try {
                const obj = JSON.parse(payload);
                if (obj?.teeRouted || obj?.chatId) {
                  if (obj.chatId) chatId = obj.chatId;
                  continue;
                }
                const delta = obj?.choices?.[0]?.delta?.content
                  ?? obj?.choices?.[0]?.message?.content
                  ?? '';
                if (delta) {
                  streamed += delta;
                  setMessages([
                    ...withUser,
                    { role: 'assistant', content: streamed, chatId },
                  ]);
                }
              } catch {}
            }
          }
          if (!streamed) setError('Empty response from Ask-AI');
        } else {
          const data = await res.json().catch(() => ({}));
          if (data?.reply) {
            setMessages([...withUser, { role: 'assistant', content: data.reply }]);
          } else {
            setError('Empty response from Ask-AI');
            setMessages(withUser);
          }
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && !last.content) return prev.slice(0, -1);
            return prev;
          });
        } else {
          setError(e?.message || 'Network error');
          setMessages(withUser);
        }
      } finally {
        abortRef.current = null;
        setSending(false);
      }
    },
    [messages],
  );

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) {
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
      return;
    }
    if (sending) return;
    setInput('');
    runChat(text);
  }, [input, sending, runChat]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const editMessage = useCallback(
    (idx: number) => {
      if (sending) return;
      const target = messages[idx];
      if (!target || target.role !== 'user') return;
      setMessages(messages.slice(0, idx));
      setInput(target.content);
      setTimeout(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(target.content.length, target.content.length);
      }, 0);
    },
    [messages, sending],
  );

  const regenerate = useCallback(() => {
    if (sending) return;
    const withoutLastAssistant = (() => {
      const last = messages[messages.length - 1];
      return last?.role === 'assistant' && last !== WELCOME ? messages.slice(0, -1) : messages;
    })();
    const lastUserIdx = [...withoutLastAssistant].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;
    const realIdx = withoutLastAssistant.length - 1 - lastUserIdx;
    const prior = withoutLastAssistant.slice(0, realIdx);
    const userMsg = withoutLastAssistant[realIdx];
    setMessages(prior);
    setTimeout(() => runChat(userMsg.content), 0);
  }, [messages, sending, runChat]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const lastMsg = messages[messages.length - 1];
  const hasUserMsg = messages.some((m) => m.role === 'user');
  const followUps = useMemo(
    () => (!sending && lastMsg?.role === 'assistant' && lastMsg !== WELCOME ? extractFollowUps(lastMsg.content) : []),
    [lastMsg, sending],
  );
  const showInitialSuggestions = !sending && !hasUserMsg && suggestions.length > 0;
  const canRegenerate =
    !sending && lastMsg?.role === 'assistant' && lastMsg !== WELCOME && !!lastMsg.content;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <>
      <button
        className={styles.fab}
        aria-label={open ? 'Close Ask 0G AI' : 'Open Ask 0G AI (Cmd+K)'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <span className={styles.fabClose}>×</span>
        ) : (
          <>
            <img
              src="/img/0G-Logo-Light.svg"
              alt=""
              aria-hidden="true"
              className={`${styles.fabLogo} ${styles.fabLogoLight}`}
            />
            <img
              src="/img/0G-Logo-Dark.svg"
              alt=""
              aria-hidden="true"
              className={`${styles.fabLogo} ${styles.fabLogoDark}`}
            />
            <span className={styles.fabText}>Ask AI</span>
          </>
        )}
      </button>
      <div
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        role="dialog"
        aria-label="Ask 0G AI"
        aria-hidden={!open}
        style={{ width: size.w, height: size.h }}
      >
        <div
          className={styles.resizeHandle}
          onPointerDown={startResize}
          aria-label="Resize panel"
          role="separator"
        />
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <img
              src="/img/0G-Logo-Light.svg"
              alt=""
              aria-hidden="true"
              className={`${styles.headerLogo} ${styles.headerLogoLight}`}
            />
            <img
              src="/img/0G-Logo-Dark.svg"
              alt=""
              aria-hidden="true"
              className={`${styles.headerLogo} ${styles.headerLogoDark}`}
            />
            <div>
              <strong>Ask AI</strong>
              <div className={styles.subtitle}>
                {pageTitle ? (
                  <>
                    Context:&nbsp;<span className={styles.contextTitle}>{pageTitle}</span>
                  </>
                ) : (
                  <>Powered by 0G Compute · ⌘K</>
                )}
              </div>
            </div>
          </div>
          <button
            className={styles.iconBtn}
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
          <div className={styles.messages} ref={scrollRef}>
            {messages.map((m, i) => {
              const isStreaming = sending && i === messages.length - 1 && m.role === 'assistant';
              if (m.role === 'assistant') {
                return (
                  <AssistantBubble
                    key={i}
                    msg={m}
                    isStreaming={isStreaming}
                    currentPath={currentPath}
                  />
                );
              }
              return (
                <button
                  key={i}
                  className={styles.userMsg}
                  onClick={() => editMessage(i)}
                  disabled={sending}
                  title="Click to edit and resend"
                >
                  {m.content}
                  <span className={styles.userEditHint}>✎ edit</span>
                </button>
              );
            })}
            {showInitialSuggestions && (
              <div className={styles.suggestions}>
                {suggestions.map((q) => (
                  <button
                    key={q}
                    className={styles.suggestion}
                    onClick={() => runChat(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {followUps.length > 0 && (
              <div className={styles.suggestions}>
                <div className={styles.followUpLabel}>Related questions</div>
                {followUps.map((q) => (
                  <button
                    key={q}
                    className={styles.suggestion}
                    onClick={() => runChat(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {error && <div className={styles.error}>{error}</div>}
          </div>
          <div className={`${styles.inputBar} ${shaking ? styles.shake : ''}`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about this page or 0G in general…"
              rows={1}
              disabled={sending}
            />
            {sending ? (
              <button className={styles.stopBtn} onClick={stop}>
                Stop
              </button>
            ) : (
              <button
                className={styles.sendBtn}
                onClick={send}
                disabled={!input.trim()}
              >
                Send
              </button>
            )}
          </div>
          <div className={styles.footer}>
            {canRegenerate && (
              <button className={styles.linkBtn} onClick={regenerate}>
                ↻ Regenerate
              </button>
            )}
            <a
              className={styles.linkBtn}
              href={TG_HELP_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              Still stuck? Get real help on TG →
            </a>
          </div>
      </div>
      {coachStep >= 0 && COACH_STEPS[coachStep] && (
        <div
          className={`${styles.coach} ${styles[`coach_${COACH_STEPS[coachStep].placement}`]}`}
          role="dialog"
          aria-label="Tour step"
        >
          <div className={styles.coachTitle}>{COACH_STEPS[coachStep].title}</div>
          <div className={styles.coachBody}>{COACH_STEPS[coachStep].body}</div>
          <div className={styles.coachActions}>
            <button className={styles.coachSkip} onClick={dismissCoach}>
              Skip
            </button>
            <span className={styles.coachProgress}>
              {coachStep + 1} / {COACH_STEPS.length}
            </span>
            <button className={styles.coachNext} onClick={advanceCoach}>
              {coachStep + 1 === COACH_STEPS.length ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function AskAI() {
  const isBrowser = useIsBrowser();
  if (!isBrowser) return null;
  return <AskAIInner />;
}
