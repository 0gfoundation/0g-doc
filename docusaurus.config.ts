import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Vercel sets VERCEL_ENV to 'production' only for the production environment;
// preview/staging/custom envs get a different value, and it's unset locally.
// Use this to gate analytics so they only fire from the live site.
const isProd = process.env.VERCEL_ENV === 'production';

// The approved one-line description of 0G. Used for llms.txt, llms-full.txt and
// site metadata so every machine-readable surface says the same thing.
const SITE_ONE_LINER =
  '0G is the trust layer for AI. It combines private compute, encrypted storage, and an AI-native EVM L1 chain in one stack where AI work, from inference to agent actions, is verified and audited.';

const config: Config = {
  title: '0G Documentation',
  tagline: 'The Next Generation Web3 Infrastructure',
  favicon: 'img/favicon.svg',

  url: 'https://docs.0g.ai',
  baseUrl: '/',

  // Build-time values exposed to the client. The Turnstile site key is public
  // (it ships in the page) and must match a widget whose hostnames include
  // docs.0g.ai. Set TURNSTILE_SITE_KEY in Vercel; the fallback is Cloudflare's
  // always-pass test key for local development only.
  customFields: {
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA',
  },
  organizationName: '0G Labs',
  projectName: '0g-docs',

  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  stylesheets: [
    {
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
      type: 'text/css',
    },
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
  clientModules: [
    // GA4 search-term tracking (no-op outside production, where gtag is absent)
    require.resolve('./src/clientModules/searchAnalytics.ts'),
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          // Visible "Last updated" from git, a freshness signal AI search engines use.
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        ...(isProd
          ? {
              gtag: {
                trackingID: 'G-2GB2FSF7Q7',
                anonymizeIP: true,
              },
            }
          : {}),
        sitemap: {
          // lastmod from git commit dates; changefreq and priority are ignored by Google.
          lastmod: 'date' as const,
          changefreq: null,
          priority: null,
          ignorePatterns: ['/search', '/search/**'],
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ["en"],
        // Keep English stop words ("get", "how", "to", ...) in the index.
        // Without this, a search like "get 0g" can never match the
        // "How to Get 0G Token" page: "get" is stripped at index time, so
        // the query only matches pages whose prose contains "getting"/"gets",
        // and those fill the result limit before the fallback query runs.
        removeDefaultStopWordFilter: ["en"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchBarPosition: 'right',
        docsRouteBasePath: "/",
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
        hideSearchBarWithNoSearchContext: false,
      },
    ],
    // Add security headers plugin
    require.resolve('./src/plugins/security-headers-plugin'),
    // AI-facing outputs (https://llmstxt.org/): llms.txt generated from the sidebar,
    // llms-full.txt and per-page .md files from docusaurus-plugin-llms (wrapped so it
    // runs first), Source lines in llms-full.txt, and rel="alternate" markdown links.
    [
      require.resolve('./src/plugins/llms-txt-plugin'),
      {
        title: '0G Documentation',
        description: SITE_ONE_LINER,
        rootContent: [
          'This is the index of the technical documentation for 0G at https://docs.0g.ai, following the llmstxt.org standard. Sections mirror the site navigation. Every link points at the markdown version of a page; append .md to any docs URL to get that page as markdown, and use https://docs.0g.ai/llms-full.txt for the whole corpus in one file.',
          '',
          'Not here: what 0G is as a project and company is at https://0g.ai/llms.txt; the builder-focused overview, tools and funding are at https://build.0g.ai/llms.txt; how to buy, bridge or withdraw the 0G token is at https://get.0g.ai/llms.txt.',
        ].join('\n'),
        optionalLinks: [
          { title: 'Full documentation corpus', url: 'https://docs.0g.ai/llms-full.txt', description: 'Every page in one markdown file with a Source line per page.' },
          { title: '0G project and company', url: 'https://0g.ai/llms.txt', description: 'What 0G is, who builds it, products, press and key links.' },
          { title: '0G Builder Hub', url: 'https://build.0g.ai/llms.txt', description: 'Builder-focused overview of the stack, tools, tutorials and funding.' },
          { title: 'Get 0G', url: 'https://get.0g.ai/llms.txt', description: 'How and where to buy, bridge or withdraw the 0G token.' },
        ],
        llms: {
          generateLLMsTxt: false,
          generateLLMsFullTxt: true,
          generateMarkdownFiles: true,
          addMdExtension: true,
          docsDir: 'docs',
          ignoreFiles: ['src/**'],
          title: '0G Documentation',
          description: SITE_ONE_LINER,
          fullRootContent:
            'This file contains the full text of every page on https://docs.0g.ai in one document, following the llmstxt.org standard. Each page starts with a heading and a Source line with its markdown URL. For a sectioned index of pages use https://docs.0g.ai/llms.txt; append .md to any docs URL for that single page as markdown.',
          llmsFullTxtFilename: 'llms-full.txt',
          excludeImports: true,
          removeDuplicateHeadings: true,
          rewriteImageUrls: true,
          pathTransformation: { ignorePaths: ['docs'] },
        },
      },
    ],
  ],

  headTags: [
    // Clarity user-session tracking — production only.
    ...(isProd
      ? [
          {
            tagName: 'script',
            attributes: {},
            innerHTML: `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "tr0w896qhb");
      `,
          },
        ]
      : []),
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '0G Labs',
        alternateName: 'Zero Gravity',
        url: 'https://0g.ai',
        logo: 'https://docs.0g.ai/img/0G-Logo-Light.svg',
        sameAs: [
          'https://x.com/0g_labs',
          'https://github.com/0gfoundation',
          'https://discord.gg/0glabs',
          'https://t.me/zgcommunity',
        ],
        description:
          '0G is the trust layer for AI. It combines private compute, encrypted storage, and an AI-native EVM L1 chain in one stack where AI work, from inference to agent actions, is verified and audited. The native token ticker is 0G.',
      }),
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '0G Documentation',
        url: 'https://docs.0g.ai',
        publisher: {
          '@type': 'Organization',
          name: '0G Labs',
        },
      }),
    },
  ],

  themeConfig: {
    metadata: [
      { name: 'twitter:site', content: '@0G_labs' },
      { name: 'twitter:creator', content: '@0G_labs' },
      { property: 'og:image', content: 'https://docs.0g.ai/img/og-image.png' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: '0G Documentation' },
    ],
    navbar: {
      title: 'Documentation',
      logo: {
        alt: '0G Logo',
        src: 'img/0G-Logo-Light.svg',
        srcDark: 'img/0G-Logo-Dark.svg',
      },
      items: [
        {
          type: 'search',
          position: 'right',
        },
        {
          href: 'https://build.0g.ai',
          position: 'right',
          className: 'header-hubs-link',
          'aria-label': 'Builder Hub',
          html: '<span class="header-hubs-link-text"><i class="fas fa-globe"></i> Builder Hub</span>',
        },
        {
          href: 'https://github.com/0gfoundation',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
        {
          href: 'https://x.com/0g_labs',
          position: 'right',
          className: 'header-twitter-link',
          'aria-label': 'Twitter profile',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/' },
            { label: 'Developer Hub', to: '/developer-hub/getting-started' },
            { label: 'Run a Node', to: '/run-a-node/overview' },
          ],
        },
        {
          title: 'Products',
          items: [
            { label: '0G Website', href: 'https://0g.ai' },
            { label: 'ChainScan (Mainnet Explorer)', href: 'https://chainscan.0g.ai' },
            { label: 'StorageScan (Storage Explorer)', href: 'https://storagescan.0g.ai' },
            { label: 'Builder Hub', href: 'https://build.0g.ai' },
            { label: 'Ecosystem Explorer', href: 'https://explorer.0g.ai' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Discord', href: 'https://discord.gg/0glabs' },
            { label: 'Telegram', href: 'https://t.me/zgcommunity' },
            { label: 'X (Twitter)', href: 'https://x.com/0g_labs' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Blog', href: 'https://0g.ai/blog' },
            { label: 'GitHub', href: 'https://github.com/0gfoundation' },
            { label: '0G Foundation', href: 'https://0gfoundation.ai' },
          ],
        },
      ],
      logo: {
        alt: '0G Labs Logo',
        src: 'img/0G-Logo-Dark.svg',
        href: 'https://0g.ai',
      },
      copyright: `Copyright © ${new Date().getFullYear()} 0G Labs, Built with Docusaurus.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
