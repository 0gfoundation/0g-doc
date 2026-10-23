/**
 * Generates /llms.txt from the docs sidebar (https://llmstxt.org/).
 *
 * Sections mirror `sidebars.ts` so the index can never disagree with the site
 * navigation, every link points at the per-page markdown (`<route>.md`,
 * written by docusaurus-plugin-llms), and root-level pages that live outside a
 * sidebar category still get listed. Also inserts a `Source:` line under each
 * page heading in llms-full.txt so a model reading the corpus can cite pages.
 *
 * Must be registered after docusaurus-plugin-llms in docusaurus.config.ts.
 */

const fs = require('fs');
const path = require('path');
const llmsPluginModule = require('docusaurus-plugin-llms');
const llmsPlugin = llmsPluginModule.default || llmsPluginModule;

module.exports = function llmsTxtPlugin(context, options = {}) {
  // docusaurus-plugin-llms is wrapped (not registered separately) because
  // Docusaurus runs postBuild hooks concurrently and this plugin must run
  // after llms-full.txt and the per-page .md files exist.
  const inner = llmsPlugin(context, options.llms || {});
  const {
    title = context.siteConfig.title,
    description = context.siteConfig.tagline,
    rootContent = '',
    optionalLinks = [],
    fullTxtFilename = 'llms-full.txt',
    sidebarId,
  } = options;

  return {
    name: 'llms-txt-plugin',

    async postBuild(props) {
      if (inner.postBuild) await inner.postBuild(props);
      const { siteConfig, outDir, plugins } = props;
      const docsPlugin = plugins.find(
        (p) => p.name === 'docusaurus-plugin-content-docs',
      );
      if (!docsPlugin || !docsPlugin.content) {
        console.warn('[llms-txt] docs plugin content not found, skipping');
        return;
      }
      const version = docsPlugin.content.loadedVersions[0];
      const siteUrl = siteConfig.url.replace(/\/+$/, '');
      const docsById = new Map(version.docs.map((d) => [d.id, d]));
      const listed = new Set();

      const mdExists = (permalink) => {
        const rel = permalink === '/' ? '/index' : permalink.replace(/\/$/, '');
        return fs.existsSync(path.join(outDir, `${rel}.md`));
      };
      const linkFor = (doc) => {
        const permalink = doc.permalink.replace(/\/$/, '') || '/';
        const rel = permalink === '/' ? '/index' : permalink;
        const url = mdExists(permalink) ? `${siteUrl}${rel}.md` : `${siteUrl}${permalink}`;
        const desc = (doc.description || '').replace(/\s+/g, ' ').trim();
        return `- [${doc.title}](${url})${desc ? `: ${desc}` : ''}`;
      };
      const usable = (doc) => doc && !doc.unlisted && !doc.draft;

      // Walk the sidebar; each category becomes one "## Parent / Child" section
      // containing the docs directly under it. Nested categories follow in order.
      const sections = [];
      const walk = (items, trail, landing) => {
        const own = [];
        const nested = [];
        if (landing && usable(landing) && !listed.has(landing.id)) {
          own.push(landing);
          listed.add(landing.id);
        }
        for (const item of items) {
          if (item.type === 'doc' || item.type === 'ref') {
            const doc = docsById.get(item.id);
            if (usable(doc) && !listed.has(doc.id)) {
              own.push(doc);
              listed.add(doc.id);
            }
          } else if (item.type === 'category') {
            nested.push(item);
          }
        }
        if (own.length) sections.push({ label: trail.join(' / ') || 'Docs', docs: own });
        for (const cat of nested) {
          const landingDoc = cat.link && cat.link.type === 'doc' ? docsById.get(cat.link.id) : null;
          walk(cat.items, [...trail, cat.label], landingDoc);
        }
      };

      const sidebars = version.sidebars || {};
      const sidebarNames = sidebarId ? [sidebarId] : Object.keys(sidebars);
      for (const name of sidebarNames) {
        const items = sidebars[name] || [];
        // Top-level docs outside any category go into a "Start here" section.
        walk(items, [], null);
      }

      // Pages outside every sidebar: the landing page and the AI context page
      // go first as "Start here", anything else is appended as "Other pages".
      const orphans = version.docs.filter((d) => usable(d) && !listed.has(d.id));
      const isStart = (d) => ['/', '/ai-context'].includes(d.permalink.replace(/\/$/, '') || '/');
      const startHere = orphans.filter(isStart).sort((a, b) => (a.permalink === '/' ? -1 : 1));
      const others = orphans.filter((d) => !isStart(d));
      if (startHere.length) sections.unshift({ label: 'Start here', docs: startHere });
      if (others.length) sections.push({ label: 'Other pages', docs: others });

      const out = [];
      out.push(`# ${title}`, '', `> ${description}`, '');
      if (rootContent) out.push(rootContent.trim(), '');
      for (const s of sections) {
        out.push(`## ${s.label}`, '');
        for (const doc of s.docs) out.push(linkFor(doc));
        out.push('');
      }
      if (optionalLinks.length) {
        out.push('## Optional', '');
        for (const l of optionalLinks) out.push(`- [${l.title}](${l.url}): ${l.description}`);
        out.push('');
      }
      fs.writeFileSync(path.join(outDir, 'llms.txt'), out.join('\n'));
      console.log(`[llms-txt] Wrote llms.txt: ${sections.length} sections, ${listed.size + orphans.length} pages`);

      // Clean the generated markdown twins: drop <style>/<script> blocks the
      // plugin leaves behind (docs/index.mdx is 93% CSS otherwise) and the body
      // H1 when it merely repeats the injected title.
      const stripBlocks = (text) =>
        text.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\n{3,}/g, '\n\n');
      let cleaned = 0;
      for (const doc of version.docs) {
        if (!usable(doc)) continue;
        const permalink = doc.permalink.replace(/\/$/, '') || '/';
        const mdPath = path.join(outDir, `${permalink === '/' ? '/index' : permalink}.md`);
        if (!fs.existsSync(mdPath)) continue;
        let text = stripBlocks(fs.readFileSync(mdPath, 'utf8'));
        const dupH1 = new RegExp(`^(# ${doc.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\n\n(?:> [^\n]*\n\n)?)# ${doc.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\n`);
        text = text.replace(dupH1, '$1');
        fs.writeFileSync(mdPath, text);
        cleaned += 1;
      }
      console.log(`[llms-txt] Cleaned ${cleaned} markdown twins`);

      // Advertise the markdown twin and the index from every built page
      // (llms.txt spec v2: rel="alternate" type="text/markdown", rel="describedby").
      let tagged = 0;
      for (const doc of version.docs) {
        if (!usable(doc)) continue;
        const permalink = doc.permalink.replace(/\/$/, '') || '/';
        if (!mdExists(permalink)) continue;
        const htmlPath = path.join(outDir, permalink === '/' ? 'index.html' : `${permalink}.html`);
        if (!fs.existsSync(htmlPath)) continue;
        const html = fs.readFileSync(htmlPath, 'utf8');
        if (html.includes('type="text/markdown"')) continue;
        const mdUrl = `${siteUrl}${permalink === '/' ? '/index' : permalink}.md`;
        const tags = `<link rel="alternate" type="text/markdown" href="${mdUrl}"><link rel="describedby" href="${siteUrl}/llms.txt">`;
        if (!html.includes('</head>')) continue;
        fs.writeFileSync(htmlPath, html.replace('</head>', `${tags}</head>`));
        tagged += 1;
      }
      console.log(`[llms-txt] Added markdown alternate links to ${tagged} pages`);

      // Add a Source line under each page heading in llms-full.txt. A page
      // starts with "## <title>" after a "---" separator, but a body section
      // can look the same (a horizontal rule followed by a heading that equals
      // some page title), so a candidate is confirmed by comparing the text
      // that follows it with the start of that page's generated .md body.
      const fullPath = path.join(outDir, fullTxtFilename);
      if (fs.existsSync(fullPath)) {
        const firstBodyLine = (text) => {
          const ls = text.split('\n');
          let i = 0;
          while (i < ls.length && (ls[i].trim() === '' || /^# /.test(ls[i]) || /^> /.test(ls[i]))) i += 1;
          return (ls[i] || '').trim();
        };
        const candidates = new Map(); // title -> [{doc, firstLine}]
        for (const d of version.docs) {
          if (!usable(d)) continue;
          const permalink = d.permalink.replace(/\/$/, '') || '/';
          const mdPath = path.join(outDir, `${permalink === '/' ? '/index' : permalink}.md`);
          if (!fs.existsSync(mdPath)) continue;
          const entry = { doc: d, url: `${siteUrl}${permalink === '/' ? '/index' : permalink}.md`, firstLine: firstBodyLine(fs.readFileSync(mdPath, 'utf8')) };
          if (!candidates.has(d.title)) candidates.set(d.title, []);
          candidates.get(d.title).push(entry);
        }
        const lines = stripBlocks(fs.readFileSync(fullPath, 'utf8')).split('\n');
        const result = [];
        const used = new Set();
        let added = 0;
        let prevNonEmpty = '';
        let seenFirstHeading = false; // the first "## " has no separator before it
        for (let i = 0; i < lines.length; i++) {
          const m = /^## (.+)$/.exec(lines[i]);
          const atSeparator = m && (prevNonEmpty === '---' || !seenFirstHeading);
          if (m) seenFirstHeading = true;
          if (lines[i].trim() !== '') prevNonEmpty = lines[i].trim();
          result.push(lines[i]);
          if (!atSeparator || !candidates.has(m[1])) continue;
          let j = i + 1;
          while (j < lines.length && lines[j].trim() === '') j += 1;
          // The body may open with an H1 that repeats the title; compare the
          // first real content line, and drop that duplicate heading.
          const repeatsTitle = (lines[j] || '').trim() === `# ${m[1]}`;
          let k = j;
          if (repeatsTitle) {
            k = j + 1;
            while (k < lines.length && lines[k].trim() === '') k += 1;
          }
          // Skip any other H1 or opening blockquote the same way
          // firstBodyLine does, so a page whose H1 differs from its title
          // still matches.
          const following = firstBodyLine(lines.slice(k, k + 50).join('\n'));
          const match = candidates.get(m[1]).find((c) => !used.has(c.doc.id) && c.firstLine && following.startsWith(c.firstLine.slice(0, 60)));
          if (!match) continue;
          used.add(match.doc.id);
          result.push('', `Source: ${match.url}`);
          added += 1;
          if (repeatsTitle) i = j; // skip the blank lines and the duplicate heading
        }
        fs.writeFileSync(fullPath, result.join('\n'));
        const expected = version.docs.filter(usable).length;
        const level = added === expected ? 'log' : 'warn';
        console[level](`[llms-txt] Added Source lines to ${fullTxtFilename}: ${added} of ${expected} pages${added === expected ? '' : ' (MISMATCH: some pages were not recognised)'}`);
      }
    },
  };
};
