#!/usr/bin/env node
'use strict';

/**
 * Build the full-text search index from HTML source files.
 * Run from the project root: node build-search-index.js
 * No third-party packages are required.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const OUTPUT = path.join(ROOT, 'assets', 'js', 'search-index.js');
const EXCLUDED = new Set(['404.html', 'googleb093eef95006018d.html']);
const CONTENT_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'blockquote', 'div', 'span']);

function decodeEntities(value) {
  const named = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    laquo: '«', raquo: '»', ndash: '–', mdash: '—', hellip: '…', middot: '·',
    bull: '•', copy: '©', reg: '®', trade: '™', times: '×'
  };
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z][a-z\d]+);/gi, (whole, name) => named[name.toLowerCase()] ?? whole);
}

function plainText(html) {
  return decodeEntities(String(html)
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' '))
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getElementText(html, start, tag) {
  const token = new RegExp(`<\\/?${tag}\\b[^>]*>|<${tag}\\b[^>]*/\\s*>`, 'gi');
  token.lastIndex = start;
  let depth = 0;
  let opened = false;
  let contentStart = start;
  let match;
  while ((match = token.exec(html))) {
    const raw = match[0];
    if (/^<\//.test(raw)) {
      depth -= 1;
      if (opened && depth === 0) return html.slice(contentStart, match.index);
    } else if (/\/\s*>$/.test(raw)) {
      if (!opened) return '';
    } else {
      if (!opened) contentStart = token.lastIndex;
      opened = true;
      depth += 1;
    }
  }
  return '';
}

function findContentNodes(html) {
  const nodes = [];
  const pattern = /<([a-z][a-z0-9]*)\b([^>]*\bid\s*=\s*(["'])((?:search-)[^"']+)\3[^>]*)>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const tag = match[1].toLowerCase();
    if (!CONTENT_TAGS.has(tag)) continue;
    if (['search-results', 'search-dialog-title', 'search-jalase-page-title'].includes(match[4])) continue;
    // Explicit search-* anchors are indexed even inside the UI-hidden session archive.
    // Other hidden interface fragments are excluded by requiring a search-* ID.
    const inner = getElementText(html, match.index, tag);
    const text = plainText(inner);
    if (!text) continue;
    nodes.push({ tag, id: match[4], text, offset: match.index });
  }
  return nodes;
}

function findHeadings(html) {
  const headings = [];
  const re = /<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
  let match;
  while ((match = re.exec(html))) {
    const text = plainText(match[2]);
    if (text) headings.push({ offset: match.index, text, level: Number(match[1][1]) });
  }
  return headings;
}


function sessionStartAt(html, number) {
  const re = /<section\b[^>]*class\s*=\s*([\"'])[^\"']*\bsession-block\b[^\"']*\1[^>]*\bid\s*=\s*([\"'])jalase-(\d+)\2[^>]*>/gi;
  let match;
  while ((match = re.exec(html))) if (Number(match[3]) === number) return match.index;
  return -1;
}

function firstSessionHeading(html, start) {
  if (start < 0) return null;
  const match = /<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/i.exec(html.slice(start));
  const text = match ? plainText(match[1]) : '';
  return text ? { text, level: 2 } : null;
}

function nearestHeading(headings, offset) {
  for (let i = headings.length - 1; i >= 0; i -= 1) {
    if (headings[i].offset <= offset) return headings[i];
  }
  return null;
}

function sessionNumberAt(html, offset) {
  const prefix = html.slice(0, offset);
  const re = /<section\b[^>]*class\s*=\s*(["'])[^"']*\bsession-block\b[^"']*\1[^>]*\bid\s*=\s*(["'])jalase-(\d+)\2[^>]*>/gi;
  let match;
  let found = null;
  while ((match = re.exec(prefix))) found = Number(match[3]);
  return found;
}

function shorten(value, max = 145) {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 70 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

function buildForFile(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const pageTitle = plainText(titleMatch ? titleMatch[1] : path.basename(file, '.html'));
  const headings = findHeadings(html);
  const nodes = findContentNodes(html);
  return nodes.map(node => {
    const session = file === 'jalase.html' ? sessionNumberAt(html, node.offset) : null;
    const isKicker = /class\s*=\s*([\"'])[^\"']*\bkicker\b[^\"']*\1/i.test(
      html.slice(node.offset, html.indexOf('>', node.offset) + 1)
    );
    let heading = /^h[1-6]$/.test(node.tag)
      ? { text: node.text, level: Number(node.tag[1]) }
      : nearestHeading(headings, node.offset);
    if (session) {
      const sessionStart = sessionStartAt(html, session);
      if (!heading || heading.offset < sessionStart) heading = firstSessionHeading(html, sessionStart) || heading;
    }
    const itemTitle = isKicker ? pageTitle : heading?.text || pageTitle;
    const itemDesc = node.text === itemTitle ? `${pageTitle} · ${node.text}` : shorten(node.text);
    const item = {
      title: itemTitle,
      pageTitle,
      desc: itemDesc,
      url: session ? `jalase.html#jalase-${session}` : `${file}#${node.id}`,
      flash: `#${node.id}`,
      terms: `${pageTitle} ${itemTitle} ${node.text}`
    };
    if (/^h[1-6]$/.test(node.tag)) item.level = Number(node.tag[1]);
    else item.level = 0;
    if (session) item.session = session;
    return item;
  });
}

function findSearchTagRoutes(html, file) {
  const routes = [];
  const re = /<([a-z][a-z0-9]*)\b([^>]*?\bdata-search-tags\s*=\s*(["'])(.*?)\3[^>]*)>/gi;
  let match;
  while ((match = re.exec(html))) {
    const tagName = match[1].toLowerCase();
    const attributes = match[2];
    const rawTags = decodeEntities(match[4] || '');
    const inner = getElementText(html, match.index, tagName);
    const firstSearchId = /<([a-z][a-z0-9]*)\b[^>]*\bid\s*=\s*(["'])(search-[^"']+)\2[^>]*>/i.exec(inner)?.[3] || '';
    const sectionId = /\bid\s*=\s*(["'])([^"']+)\1/i.exec(attributes)?.[2] || '';
    const headingMatch = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]\s*>/i.exec(inner);
    const heading = headingMatch ? plainText(headingMatch[1]) : '';
    const session = file === 'jalase.html' ? sessionNumberAt(html, match.index) : null;

    for (const tag of rawTags.split(/\s+/).filter(value => value.startsWith('#'))) {
      const key = tag.replace(/^#/, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
      // Generic category labels are not exact lesson tags.
      if (/^(احکام|اعتقادی|رشد_فردی|ارتباط_موثر|ارتباط_مؤثر|فن_بیان)$/u.test(key)) continue;
      // Session/class number tags are handled by the session-name matcher and always open the full session.
      if (/^#?(جلسه|کلاس)[_\-]?([0-9۰-۹٠-٩]+)$/u.test(tag)) continue;

      let url = '';
      let flash = '';
      if (session) {
        url = `jalase.html#jalase-${session}`;
        flash = firstSearchId ? `#${firstSearchId}` : `#jalase-${session}`;
      } else {
        const target = sectionId || firstSearchId;
        if (!target) continue;
        url = `${file}#${target}`;
        flash = `#${target}`;
      }
      routes.push({ tag, url, flash, title: heading || file.replace(/\.html$/, ''), file, session: session || null, priority: session ? 0 : 1 });
    }
  }
  return routes;
}

function main() {
  const files = fs.readdirSync(ROOT)
    .filter(name => name.endsWith('.html') && !EXCLUDED.has(name))
    .sort((a, b) => a.localeCompare(b, 'en'));
  const index = files.flatMap(buildForFile);
  const tagIndex = files.flatMap(file => findSearchTagRoutes(fs.readFileSync(path.join(ROOT, file), 'utf8'), file))
    .sort((a, b) => a.priority - b.priority || a.file.localeCompare(b.file, 'en'));
  const seenIds = new Set();
  for (const file of files) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const re = /\bid\s*=\s*(["'])(search-[^"']+)\1/g;
    let match;
    while ((match = re.exec(html))) {
      const key = `${file}#${match[2]}`;
      if (seenIds.has(key)) throw new Error(`Duplicate search anchor: ${key}`);
      seenIds.add(key);
    }
  }
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const output = `/* This file is generated by build-search-index.js. Do not edit by hand. */\nwindow.MAHDIYARSHO_SEARCH_INDEX = ${JSON.stringify(index)};\nwindow.MAHDIYARSHO_TAG_INDEX = ${JSON.stringify(tagIndex)};\n`;
  fs.writeFileSync(OUTPUT, output, 'utf8');
  process.stdout.write(`Generated ${index.length} search entries and ${tagIndex.length} tag routes from ${files.length} HTML pages.\n`);
}

main();
