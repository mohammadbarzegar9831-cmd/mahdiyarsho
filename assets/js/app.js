(() => {
  'use strict';

  /* صفحهٔ 404 مسیر پایهٔ پروژه را اعلام می‌کند تا مقصدهای جست‌وجو نسبی نشوند. */
  const siteBasePath = document.querySelector('meta[name="site-base"]')?.content;
  const resolveSiteHref = href => siteBasePath
    ? new URL(href, new URL(siteBasePath, window.location.origin)).href
    : href;

  /* آیکون اختصاصی مرورگر از فایل‌های ثابت در HTML بارگذاری می‌شود. */

  let index = Array.isArray(window.MAHDIYARSHO_SEARCH_INDEX) ? window.MAHDIYARSHO_SEARCH_INDEX : [];
  let indexLoaded = index.length > 0;
  let indexLoading = null;
  const appScriptUrl = document.currentScript?.src || new URL('assets/js/app.js', document.baseURI).href;

  const layer = document.querySelector('.search-layer');
  const panel = layer?.querySelector('.search-panel');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('.main-nav');
  let lastSearchTrigger = null;
  let revealObserver = null;

  /* نرمال‌سازی: یکسان‌سازی اعداد، حذف # و _ و فاصله و نیم‌فاصله و خط فاصله */
  const faDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arDigits = '٠١٢٣٤٥٦٧٨٩';
  const normalize = value => String(value)
    .normalize('NFC')
    .replace(/[۰-۹]/g, d => String(faDigits.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(arDigits.indexOf(d)))
    .toLocaleLowerCase('fa')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ی')
    .replace(/[ۀة]/g, 'ه')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '');

  const splitSearchWords = value => String(value || '')
    .split(/[^\p{L}\p{N}]+/u)
    .map(normalize)
    .filter(word => word.length > 1);

  function editDistance(left, right, limit = 2) {
    const a = Array.from(left);
    const b = Array.from(right);
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      const current = [i];
      let rowMinimum = i;
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
        rowMinimum = Math.min(rowMinimum, current[j]);
      }
      if (rowMinimum > limit) return limit + 1;
      previous = current;
    }
    return previous[b.length];
  }

  function itemSearchWords(item) {
    return splitSearchWords([item.title, item.pageTitle, item.desc, item.terms].filter(Boolean).join(' '));
  }

  function tokenMatchScore(token, words) {
    if (!token) return 0;
    let best = 0;
    for (const word of words) {
      if (word === token) best = Math.max(best, 8);
      else if (word.includes(token) || token.includes(word) && word.length >= 3) best = Math.max(best, 5);
      else if (token.length >= 4 && word.length >= 4) {
        const tolerance = token.length >= 8 ? 2 : 1;
        const distance = editDistance(token, word, tolerance);
        if (distance <= tolerance) best = Math.max(best, 3 - distance);
      }
      if (best >= 8) break;
    }
    return best;
  }

  /* صفحهٔ پنهان جلسه‌ها */
  const sessionPage = number => `#jalase-${number}`;
  const sessionNames = { 1: 'اول', 2: 'دوم', 3: 'سوم', 4: 'چهارم', 5: 'پنجم', 6: 'ششم', 7: 'هفتم', 8: 'هشتم', 9: 'نهم', 10: 'دهم', 11: 'یازدهم', 12: 'دوازدهم' };
  const availableSessions = new Set();
  if (indexLoaded) index.forEach(item => { if (Number.isInteger(item.session) && item.session > 0) availableSessions.add(item.session); });
  const sessionLabel = number => sessionNames[number] || Number(number).toLocaleString('fa-IR');
  const sessionWords = {
    '1':1,'یک':1,'اول':1,'یکم':1, '2':2,'دو':2,'دوم':2, '3':3,'سه':3,'سوم':3,
    '4':4,'چهار':4,'چهارم':4, '5':5,'پنج':5,'پنجم':5,
    '6':6,'شش':6,'ششم':6,'ششمی':6, '7':7,'هفت':7,'هفتم':7,'هفتمی':7,
    '8':8,'هشت':8,'هشتم':8,'هشتمی':8, '9':9,'نه':9,'نهم':9,'نهمی':9,
    '10':10,'ده':10,'دهم':10,'دهمی':10, '11':11,'یازده':11,'یازدهم':11,
    '12':12,'دوازده':12,'دوازدهم':12
  };
  const sessionTags = new Map([
    ['#احکام_1', 1, 1],
    ['#اعتقادی_1', 1, 2],
    ['#احکام_2', 2, 1],
    ['#ارتباط_موثر_1', 2, 2],
    ['#احکام_3', 3, 1],
    ['#رشد_فردی_1', 3, 2],
    ['#احکام_4', 4, 1],
    ['#ارتباط_موثر_2', 4, 2],
    ['#احکام_5', 5, 1],
    ['#رشد_فردی_2', 5, 2],
    ['#احکام_6', 6, 1],
    ['#اعتقادی_2', 6, 2],
    ['#احکام_7', 7, 1],
    ['#احکام_۷', 7, 1],
    ['#همسایه_داری_7', 7, 1],
    ['#ارتباط_موثر_3', 7, 2],
    ['#ارتباط_مؤثر_3', 7, 2],
    ['#فن_بیان_3', 7, 2],
    ['#احکام_8', 8, 1],
    ['#همسایه_داری_8', 8, 1],
    ['#رشد_فردی_3', 8, 2],
    ['#لذت', 8, 2],
    ['#رنج', 8, 2],
    ['#حواس_پرتی', 8, 2],
    ['#احکام_9', 9, 1],
    ['#همسایه_داری_9', 9, 1],
    ['#ارتباط_موثر_4', 9, 2],
    ['#فن_بیان_4', 9, 2],
    ['#توصیف_کردن', 9, 2],
    ['#بش_برس', 9, 2],
    ['#احکام_10', 10, 1],
    ['#احکام_۱۰', 10, 1],
    ['#همسایه_داری_10', 10, 1],
    ['#نگهداری_حیوانات', 10, 1],
    ['#رشد_فردی_4', 10, 2],
    ['#رشد_فردی_۴', 10, 2],
    ['#محرک', 10, 2],
    ['#وسوسه', 10, 2],
    ['#تکنیک_۱۰_دقیقه', 10, 2]
  ].map(([tag, n, section]) => [normalize(tag), { n, focus: `#jalase-${n} > section.idea-section:nth-of-type(${section})` }]));
  /* نام کامل جلسه یا تگ دقیق محتوایی؛ عبارت ناقص «جلسه دهم» به‌تنهایی کافی نیست. */
  const contentSessionTags = new Map();
  document.querySelectorAll('.session-block .idea-section[data-search-tags]').forEach(section => {
    const sessionBlock = section.closest('.session-block');
    const number = Number((sessionBlock?.id || '').match(/jalase-(\d+)/)?.[1]);
    if (!number) return;
    const focus = `#${sessionBlock.id} > section.idea-section:nth-of-type(${Array.from(sessionBlock.querySelectorAll(':scope > .idea-section')).indexOf(section) + 1})`;
    String(section.getAttribute('data-search-tags') || '').split(/\s+/).filter(Boolean).forEach(tag => {
      const key = normalize(tag);
      // تگ‌های شماره‌دارِ جلسه/کلاس شناسهٔ محتوایی نیستند؛ خودِ عبارت جلسه X جداگانه تشخیص داده می‌شود.
      if (!key || /^(جلسه|کلاس)\d+$/.test(key)) return;
      // در صورت تکرار یک تگ، اولین بخش مشخص حفظ شود تا مقصد ناخواسته عوض نشود.
      if (!contentSessionTags.has(key)) contentSessionTags.set(key, { n: number, focus });
    });
  });
  const sessionNumberFromWord = word => {
    const token = normalize(word);
    if (Object.prototype.hasOwnProperty.call(sessionWords, token)) return sessionWords[token];
    const numeric = token.match(/^(\d{1,2})(?:ام|م)?$/);
    return numeric ? Number(numeric[1]) : null;
  };
  const sessionParts = value => String(value || '')
    .split(/[^\p{L}\p{N}]+/u)
    .map(normalize)
    .filter(Boolean);
  const matchSessionName = value => {
    const parts = sessionParts(value);
    const ignored = new Set(['ی', 'شماره', 'شمارهی']);
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      for (const marker of ['جلسه', 'کلاس']) {
        const markerAt = part.indexOf(marker);
        if (markerAt < 0) continue;
        const attachedNumber = part.slice(markerAt + marker.length);
        let number = attachedNumber ? sessionNumberFromWord(attachedNumber) : null;
        if (!number) {
          for (let j = i + 1; j < Math.min(parts.length, i + 5); j += 1) {
            if (ignored.has(parts[j])) continue;
            number = sessionNumberFromWord(parts[j]);
            if (number) break;
            // بعد از رسیدن به واژه‌ای دیگر، ادامهٔ عبارت را حدس نمی‌زنیم.
            if (!/^\d+$/.test(parts[j])) break;
          }
        }
        if (number && availableSessions.has(number)) return number;
      }
    }
    return null;
  };
  const matchSessionTag = value => {
    // حذف #، ستاره، خط تیره، فاصله و نیم‌فاصله در normalize باعث می‌شود
    // «احکام ۲»، «احکام 2» و «#احکام*2» یک شناسه داشته باشند.
    const key = normalize(value);
    return contentSessionTags.get(key) || sessionTags.get(key) || null;
  };
  const hasIncompleteSessionName = value => sessionParts(value)
    .some(part => part === 'جلسه' || part === 'کلاس' || part.startsWith('جلسه') || part.startsWith('کلاس'));
  /* منطقهٔ دقیق برای فلش: کارت/ردیف/بخش/هدر */
  const REGION_SELECTOR = '.topic-row, .belief-card, .feature-card, .reason-card, .insight-card, .idea-section, .conclusion, .section, .page-hero';

  function flashRegion(key) {
    if (!key) return;
    let region = null;
    if (key.indexOf('text:') === 0) {
      /* پیدا کردن خودِ عنوان موضوع در صفحهٔ مقصد */
      const needle = normalize(key.slice(5));
      if (needle) {
        const prefix = needle.slice(0, Math.min(8, needle.length));
        const headings = document.querySelectorAll('h1, h2, h3');
        for (const heading of headings) {
          const hn = normalize(heading.textContent);
          if (hn.includes(needle) || hn.startsWith(prefix)) { region = heading; break; }
        }
        if (region) region = region.closest(REGION_SELECTOR) || region;
      }
      if (!region) region = document.querySelector('.page-hero');
    } else {
      let el = null;
      try { el = document.querySelector(key); } catch (error) { el = null; }
      if (!el) el = document.querySelector('.page-hero');
      if (!el) return;
      /* جست‌وجوی «جلسه X»: کل کادر هدر جلسه فلش می‌شود */
      region = el.classList.contains('session-block') ? (el.querySelector('.page-hero') || el) : el;
    }
    if (!region) return;
    region.classList.remove('flash-target');
    void region.offsetWidth;
    region.classList.add('flash-target');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    region.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    window.setTimeout(() => region.classList.remove('flash-target'), 2000);
  }

  function flashKeyFromHref(href) {
    const hashIndex = href.indexOf('#');
    if (hashIndex > -1 && href.length > hashIndex + 1) return href.slice(hashIndex);
    return '.page-hero';
  }

  function navigateWithFlash(href, flashKey) {
    const key = flashKey || flashKeyFromHref(href);
    let destination = null;
    let samePage = false;
    try {
      destination = new URL(href, window.location.href);
      samePage = destination.pathname === window.location.pathname;
    } catch (error) {
      samePage = href.charAt(0) === '#';
    }
    if (samePage) {
      const hashIndex = href.indexOf('#');
      const hashChanged = hashIndex > -1 && window.location.hash !== href.slice(hashIndex);
      if (hashChanged) window.location.hash = href.slice(hashIndex);
      if (hashChanged) window.setTimeout(() => flashRegion(key), 90);
      else flashRegion(key);
    } else {
      try { sessionStorage.setItem('mh-flash', key); } catch (error) { /* ذخیره نشد */ }
      window.location.href = href;
    }
  }

  /* نمایهٔ بزرگ فقط پس از نخستین بازشدن جست‌وجو دریافت می‌شود. */
  function ensureSearchIndex() {
    if (indexLoaded) return Promise.resolve(index);
    if (indexLoading) return indexLoading;
    indexLoading = new Promise(resolve => {
      const script = document.createElement('script');
      script.src = new URL('search-index.js', appScriptUrl).href;
      script.async = true;
      script.onload = () => {
        index = Array.isArray(window.MAHDIYARSHO_SEARCH_INDEX) ? window.MAHDIYARSHO_SEARCH_INDEX : [];
        index.forEach(item => { if (Number.isInteger(item.session) && item.session > 0) availableSessions.add(item.session); });
        indexLoaded = true;
        indexLoading = null;
        renderResults(input?.value || '');
        resolve(index);
      };
      script.onerror = () => {
        indexLoading = null;
        if (results) {
          results.replaceChildren();
          const message = document.createElement('p');
          message.className = 'search-hint';
          message.textContent = 'بارگذاری نمایهٔ جست‌وجو انجام نشد؛ اتصال را بررسی و دوباره تلاش کن.';
          results.append(message);
        }
        resolve([]);
      };
      document.head.append(script);
    });
    return indexLoading;
  }

  /* اتصال کنترل‌های جست‌وجو؛ رویدادها به‌صورت delegation برای همهٔ صفحات */
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    // انتخاب نتیجه با کلیک معمولی: پنجره بسته و مقصد همراه با نشانگر نتیجه باز شود.
    const resultLink = target.closest('a.search-result');
    if (resultLink && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      selectSearchResult(resultLink);
      return;
    }

    const openButton = target.closest('[data-search-open]');
    if (openButton) {
      event.preventDefault();
      openSearch(openButton);
      return;
    }
    const closeButton = target.closest('[data-search-close]');
    if (closeButton) {
      event.preventDefault();
      closeSearch();
      return;
    }
    if (layer && !layer.hidden && target === layer) closeSearch();
  });

  input?.addEventListener('input', () => renderResults(input.value));
  document.addEventListener('keydown', event => {
    // Enter در ورودی جست‌وجو، اولین نتیجهٔ واقعی را باز می‌کند؛ پیشنهادهای متنی انتخاب مقصد نیستند.
    if (event.key === 'Enter' && layer && !layer.hidden && event.target === input) {
      const firstResult = results?.querySelector('a.search-result');
      if (firstResult) {
        event.preventDefault();
        selectSearchResult(firstResult);
        return;
      }
    }
    if (event.key === 'Escape' && layer && !layer.hidden) {
      event.preventDefault();
      closeSearch();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (layer?.hidden) openSearch();
      else closeSearch();
    }
  });

  /* بعد از انتخاب نتیجه: متن پاک، پنل بسته، سپس مقصد باز شود. */
  function finishSearch() {
    if (input) input.value = '';
    renderResults('');
    closeSearch(false);
  }

  function selectSearchResult(link) {
    if (!link) return;
    const href = link.href || link.getAttribute('href');
    if (!href) return;
    const flashKey = link.dataset.flash || flashKeyFromHref(href);
    finishSearch();
    navigateWithFlash(href, flashKey);
  }

  function appendSuggestions(queryTokens) {
    if (!results) return;
    const suggestions = new Map();
    if (!queryTokens.length) {
      ['همسایه‌داری', 'تکنیک ۱۰ دقیقه', 'علم و حکمت', 'فن بیان'].forEach((label, order) => {
        suggestions.set(label, 100 - order);
      });
    } else {
      index.forEach(item => {
        // نتایج آرشیو جلسه فقط با نام جلسه یا تگ شماره‌دار باز می‌شوند، نه پیشنهاد عمومی.
        if (Number.isInteger(item.session)) return;
        const title = String(item.title || '').trim();
        if (!title || suggestions.has(title)) return;
        const words = splitSearchWords(title);
        const startsWithQuery = queryTokens.every(token => words.some(word => word.startsWith(token)));
        if (startsWithQuery) suggestions.set(title, queryTokens.length * 10 + (item.level === 1 ? 2 : 0));
      });
    }
    const rows = Array.from(suggestions.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fa'))
      .slice(0, 4);
    if (!rows.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'search-suggestions';
    wrap.setAttribute('aria-label', 'پیشنهادهای جست‌وجو');
    const label = document.createElement('span');
    label.className = 'search-suggestions-label';
    label.textContent = 'جست‌وجوهای پیشنهادی';
    wrap.append(label);
    rows.forEach(([suggestion]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-suggestion';
      button.textContent = suggestion;
      button.addEventListener('click', () => {
        if (!input) return;
        input.value = suggestion;
        renderResults(suggestion);
        input.focus();
      });
      wrap.append(button);
    });
    results.append(wrap);
  }

  function renderResults(value = '') {
    if (!results) return;
    const normalizedInput = normalize(value);
    const tokens = splitSearchWords(value);
    results.replaceChildren();
    if (!tokens.length) {
      appendSuggestions([]);
      const hint = document.createElement('p');
      hint.className = 'search-hint';
      hint.textContent = 'مثلاً: همسایه‌داری، تکنیک ۱۰ دقیقه، جلسه دهم یا فن بیان';
      results.append(hint);
      return;
    }
    if (normalizedInput.length < 2) {
      const hint = document.createElement('p');
      hint.className = 'search-hint';
      hint.textContent = 'برای جست‌وجو دست‌کم دو نویسه وارد کن.';
      results.append(hint);
      return;
    }
    if (!indexLoaded) {
      const hint = document.createElement('p');
      hint.className = 'search-hint';
      hint.textContent = 'در حال آماده‌سازی جست‌وجوی کامل…';
      results.append(hint);
      ensureSearchIndex();
      return;
    }

    /* اول نام جلسه با شماره/ترتیب: «جلسه هشتم»، «جلسه ۸»، «کلاس هشتم» و ... */
    const sessionNumber = matchSessionName(value);
    if (sessionNumber) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = resolveSiteHref('jalase.html' + sessionPage(sessionNumber));
      link.dataset.flash = sessionPage(sessionNumber);
      const description = document.createElement('span');
      description.append(document.createTextNode('یادداشت‌های جلسه / کلاس ' + sessionLabel(sessionNumber)));
      const small = document.createElement('small');
      small.textContent = 'یادداشت‌های همین جلسه';
      description.append(small);
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '←';
      link.append(description, arrow);
      results.append(link);
      return;
    }

    /* بعد تگ‌ها → رفتن به بخش موضوعی دقیق */
    const sessionTag = matchSessionTag(value);
    if (sessionTag) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = resolveSiteHref('jalase.html' + sessionPage(sessionTag.n));
      link.dataset.flash = sessionTag.focus;
      const description = document.createElement('span');
      description.append(document.createTextNode('یادداشت‌های جلسه / کلاس ' + sessionLabel(sessionTag.n)));
      const small = document.createElement('small');
      small.textContent = 'یادداشت‌های مرتبط با این موضوع';
      description.append(small);
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '←';
      link.append(description, arrow);
      results.append(link);
      return;
    }

    if (hasIncompleteSessionName(value)) {
      // «جلسه» یا «جلسه ...» ناقص است: نتیجه و پیشنهاد عمومی نشان داده نمی‌شود.
      return;
    }

    /* پیشنهادهای مرتبط فقط برای جست‌وجوی عمومی؛ آرشیوها در این فهرست نیستند. */
    appendSuggestions(tokens);

    const bestPerLocation = new Map();
    index.forEach(item => {
      // آرشیو جلسه در جست‌وجوی عمومی دسته‌ها (مثلاً «احکام») پخش نشود.
      if (Number.isInteger(item.session)) return;
      const words = itemSearchWords(item);
      const tokenScores = tokens.map(token => tokenMatchScore(token, words));
      if (tokenScores.some(score => score === 0)) return;
      const titleWords = splitSearchWords(item.title || '');
      const pageWords = splitSearchWords(item.pageTitle || '');
      const titleHits = tokens.reduce((sum, token) => sum + (tokenMatchScore(token, titleWords) > 0 ? 1 : 0), 0);
      const pageHits = tokens.reduce((sum, token) => sum + (tokenMatchScore(token, pageWords) > 0 ? 1 : 0), 0);
      const exactPhrase = normalizedInput && normalize(`${item.title || ''} ${item.desc || ''}`).includes(normalizedInput) ? 9 : 0;
      const score = tokenScores.reduce((sum, points) => sum + points, 0) + titleHits * 9 + pageHits * 3 +
        (item.level === 1 ? 10 : 0) + exactPhrase;
      const page = (item.url || '').split('#')[0];
      const key = Number.isInteger(item.session) ? item.url : page;
      const candidate = { item, score };
      const previous = bestPerLocation.get(key);
      if (!previous || candidate.score > previous.score) bestPerLocation.set(key, candidate);
    });

    const matches = Array.from(bestPerLocation.values())
      .sort((a, b) => b.score - a.score || String(a.item.title).localeCompare(String(b.item.title), 'fa'))
      .slice(0, 12)
      .map(row => row.item);
    if (!matches.length) {
      const hint = document.createElement('p');
      hint.className = 'search-hint';
      hint.textContent = 'نتیجه‌ای پیدا نشد. املای عبارت را تغییر بده یا یکی از پیشنهادها را انتخاب کن.';
      results.append(hint);
      return;
    }

    const fragment = document.createDocumentFragment();
    matches.forEach(item => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = resolveSiteHref(item.url);
      link.dataset.flash = item.flash || ('text:' + item.title);
      const description = document.createElement('span');
      description.append(document.createTextNode(item.title || item.pageTitle || 'نتیجهٔ جست‌وجو'));
      const small = document.createElement('small');
      const sessionText = Number.isInteger(item.session) ? ` · جلسهٔ ${sessionLabel(item.session)}` : '';
      small.textContent = String(item.desc || item.pageTitle || '') + sessionText;
      description.append(small);
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '←';
      link.append(description, arrow);
      fragment.append(link);
    });
    results.append(fragment);
  }

  function openSearch(trigger) {
    if (!layer) return;
    const requestedTrigger = trigger || document.activeElement;
    lastSearchTrigger = (nav?.contains(requestedTrigger) && window.matchMedia('(max-width: 760px)').matches)
      ? menuButton
      : requestedTrigger;
    closeMenu(false);
    layer.hidden = false;
    document.body.style.overflow = 'hidden';
    renderResults(input?.value || '');
    ensureSearchIndex();
    window.requestAnimationFrame(() => input?.focus());
  }

  function closeSearch(restoreFocus = true) {
    if (!layer || layer.hidden) return;
    layer.hidden = true;
    document.body.style.overflow = '';
    if (restoreFocus && lastSearchTrigger instanceof HTMLElement) lastSearchTrigger.focus();
  }

  function closeMenu(restoreFocus = false) {
    if (!nav || !menuButton) return;
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'باز کردن منوی اصلی');
    if (restoreFocus) menuButton.focus();
  }

  function toggleMenu() {
    if (!nav || !menuButton) return;
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'بستن منوی اصلی' : 'باز کردن منوی اصلی');
  }

  /* پیمایش بین جلسه‌ها و نمایش تاریخ به‌روزرسانی */
  function addSessionPagination(section, number, total) {
    if (section.querySelector(':scope > .session-pagination')) return;
    const navElement = document.createElement('nav');
    navElement.className = 'session-pagination';
    navElement.setAttribute('aria-label', 'پیمایش بین جلسه‌ها');
    const makeLink = (target, text, className) => {
      if (target < 1 || target > total) {
        const disabled = document.createElement('span');
        disabled.className = `${className} is-disabled`;
        disabled.textContent = text;
        disabled.setAttribute('aria-disabled', 'true');
        return disabled;
      }
      const link = document.createElement('a');
      link.className = className;
      link.href = `#jalase-${target}`;
      link.dataset.sessionGo = String(target);
      link.textContent = text;
      return link;
    };
    navElement.append(
      makeLink(number - 1, '← جلسهٔ قبلی', 'session-page-link'),
      makeLink(number + 1, 'جلسهٔ بعدی →', 'session-page-link')
    );
    section.append(navElement);
  }

  function addLastUpdated() {
    const footer = document.querySelector('.footer');
    const dateValue = document.querySelector('meta[name="content-updated"]')?.content;
    if (!footer || !dateValue || document.querySelector('.site-updated-wrap')) return;
    const date = new Date(`${dateValue}T12:00:00`);
    if (Number.isNaN(date.getTime())) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'site-updated-wrap';
    const time = document.createElement('time');
    time.className = 'site-updated';
    time.dateTime = dateValue;
    time.textContent = `آخرین به‌روزرسانی: ${date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    wrapper.append(time);
    footer.insertAdjacentElement('afterend', wrapper);
  }

  document.querySelectorAll('.session-block').forEach(section => {
    const number = Number((section.id.match(/jalase-(\d+)/) || [])[1]);
    if (Number.isInteger(number) && number > 0) {
      addSessionPagination(section, number, document.querySelectorAll('.session-block').length);
    }
  });
  addLastUpdated();

  document.addEventListener('click', event => {
    const sessionLink = event.target.closest('[data-session-go]');
    if (!sessionLink) return;
    event.preventDefault();
    const destination = `#jalase-${sessionLink.dataset.sessionGo}`;
    if (window.location.hash === destination) {
      document.getElementById(destination.slice(1))?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    } else {
      window.location.hash = destination;
    }
  });

  window.addEventListener('hashchange', () => {
    if (!document.querySelector('.session-block')) return;
    window.setTimeout(() => {
      const activeSession = document.querySelector('.session-block:not([hidden])');
      if (activeSession) {
        document.title = `${activeSession.querySelector('.page-hero h2')?.textContent?.trim() || 'یادداشت جلسه'} | مهدیارشو`;
        activeSession.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    }, 50);
  });

  /* فلش منطقهٔ مقصد در صفحهٔ مقصد، بعد از ورود از جست‌وجو */
  (function initFlashFromSearch() {
    let key = null;
    try {
      key = sessionStorage.getItem('mh-flash');
      sessionStorage.removeItem('mh-flash');
    } catch (error) { key = null; }
    if (!key) return;
    window.setTimeout(() => flashRegion(key), 60);
  })();

  // One reveal setup handles both authored and automatically selected elements.
  const revealSelectors = [
    '.hero-copy > *', '.hero-art', '.hero-bottom', '.breadcrumb', '.page-hero',
    '.section-heading', '.feature-card', '.belief-card', '.topic-row',
    '.subtopics-strip', '.quote-inner', '.page-next', '.idea-section',
    '.insight-card', '.cinema-quote', '.reason-card', '.conclusion', '.practice-group', '.verse-source', '.verse-translation', '.session-block > .page-hero'
  ].join(',');
  document.querySelectorAll(revealSelectors).forEach(element => {
    if (!element.classList.contains('reveal')) element.classList.add('reveal');
    if (!element.style.transitionDelay) {
      const siblings = Array.from(element.parentElement?.children || []).filter(item => item.matches(revealSelectors));
      const position = Math.max(0, siblings.indexOf(element));
      if (position > 0) element.style.transitionDelay = `${Math.min(position, 5) * 70}ms`;
    }
  });
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        /* ورود به دید: اجرا؛ خروج از دید: آماده‌سازی برای اجرای دوباره در دور بعدی */
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -3% 0px' });
    reveals.forEach(element => revealObserver.observe(element));
    /* بازگشت از صفحهٔ دیگر با Back/Forward Cache هم باید انیمیشن‌ها را از نو آماده کند. */
    window.addEventListener('pageshow', event => {
      if (!event.persisted || !revealObserver) return;
      reveals.forEach(element => {
        element.classList.remove('is-visible');
        revealObserver.unobserve(element);
        revealObserver.observe(element);
      });
    });
  } else {
    reveals.forEach(element => element.classList.add('is-visible'));
  }
})();