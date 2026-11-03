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

  /* صفحهٔ پنهان جلسه‌ها */
  const sessionPage = number => `#jalase-${number}`;
  const sessionNames = { 1: 'اول', 2: 'دوم', 3: 'سوم', 4: 'چهارم', 5: 'پنجم', 6: 'ششم', 7: 'هفتم', 8: 'هشتم', 9: 'نهم', 10: 'دهم', 11: 'یازدهم', 12: 'دوازدهم' };
  const availableSessions = new Set();
  const sessionLabel = number => sessionNames[number] || Number(number).toLocaleString('fa-IR');
  const sessionWords = {
    '1':1,'یک':1,'اول':1,'یکم':1, '2':2,'دو':2,'دوم':2, '3':3,'سه':3,'سوم':3,
    '4':4,'چهار':4,'چهارم':4, '5':5,'پنج':5,'پنجم':5,
    '6':6,'شش':6,'ششم':6,'ششمی':6, '7':7,'هفت':7,'هفتم':7,'هفتمی':7,
    '8':8,'هشت':8,'هشتم':8,'هشتمی':8, '9':9,'نه':9,'نهم':9,'نهمی':9
  };
  const sessionTags = {
    'احکام1':{n:1,focus:'#jalase-1 > section.idea-section:nth-of-type(1)'}, 'اعتقادی1':{n:1,focus:'#jalase-1 > section.idea-section:nth-of-type(2)'},
    'احکام2':{n:2,focus:'#jalase-2 > section.idea-section:nth-of-type(1)'}, 'ارتباطموثر1':{n:2,focus:'#jalase-2 > section.idea-section:nth-of-type(2)'},
    'احکام3':{n:3,focus:'#jalase-3 > section.idea-section:nth-of-type(1)'}, 'رشدفردی1':{n:3,focus:'#jalase-3 > section.idea-section:nth-of-type(2)'},
    'احکام4':{n:4,focus:'#jalase-4 > section.idea-section:nth-of-type(1)'}, 'ارتباطموثر2':{n:4,focus:'#jalase-4 > section.idea-section:nth-of-type(2)'},
    'احکام5':{n:5,focus:'#jalase-5 > section.idea-section:nth-of-type(1)'}, 'رشدفردی2':{n:5,focus:'#jalase-5 > section.idea-section:nth-of-type(2)'},
    'احکام6':{n:6,focus:'#jalase-6 > section.idea-section:nth-of-type(1)'}, 'اعتقادی2':{n:6,focus:'#jalase-6 > section.idea-section:nth-of-type(2)'},
    'احکام7':{n:7,focus:'#jalase-7 > section.idea-section:nth-of-type(1)'}, 'همسایهداری7':{n:7,focus:'#jalase-7 > section.idea-section:nth-of-type(1)'},
    'ارتباطموثر3':{n:7,focus:'#jalase-7 > section.idea-section:nth-of-type(2)'}, 'فنبیان3':{n:7,focus:'#jalase-7 > section.idea-section:nth-of-type(2)'},
    'احکام8':{n:8,focus:'#jalase-8 > section.idea-section:nth-of-type(1)'}, 'همسایهداری8':{n:8,focus:'#jalase-8 > section.idea-section:nth-of-type(1)'},
    'رشدفردی3':{n:8,focus:'#jalase-8 > section.idea-section:nth-of-type(2)'}, 'لذت8':{n:8,focus:'#jalase-8 > section.idea-section:nth-of-type(2)'},
    'احکام9':{n:9,focus:'#jalase-9 > section.idea-section:nth-of-type(1)'}, 'همسایهداری9':{n:9,focus:'#jalase-9 > section.idea-section:nth-of-type(1)'},
    'ارتباطموثر4':{n:9,focus:'#jalase-9 > section.idea-section:nth-of-type(2)'}, 'فنبیان4':{n:9,focus:'#jalase-9 > section.idea-section:nth-of-type(2)'}
  };
  const matchSession = value => {
    const normalized = normalize(value);
    const match = normalized.match(/^(?:جلسه|کلاس)(?:ی)?(.+)$/);
    if (!match) return null;
    if (sessionWords[match[1]]) return sessionWords[match[1]];
    const numeric = /^\d+$/.test(match[1]) ? Number(match[1]) : null;
    return numeric && availableSessions.has(numeric) ? numeric : null;
  };
  const matchSessionTag = value => {
    const normalized = normalize(value);
    if (sessionTags[normalized]) return sessionTags[normalized];
    const categoryTag = normalized.match(/^(احکام|اعتقادی|ارتباطموثر|رشدفردی|همسایهداری|فنبیان)(.+)$/);
    if (categoryTag) {
      const taggedNumber = sessionWords[categoryTag[2]] || (/^\d+$/.test(categoryTag[2]) && availableSessions.has(Number(categoryTag[2])) ? Number(categoryTag[2]) : null);
      if (taggedNumber) {
        const key = categoryTag[1] + taggedNumber;
        if (sessionTags[key]) return sessionTags[key];
        if (availableSessions.has(taggedNumber)) return { n: taggedNumber, focus: sessionPage(taggedNumber) };
      }
    }
    /* قبول تگ‌هایی مثل #جلسه_ششم، #کلاس-6 و #احکام_۶؛ # و جداکننده‌ها در normalize حذف شده‌اند. */
    const named = normalized.match(/^(?:جلسه|کلاس)(.+)$/);
    if (named) {
      const namedNumber = sessionWords[named[1]] || (/^\d+$/.test(named[1]) && availableSessions.has(Number(named[1])) ? Number(named[1]) : null);
      if (namedNumber) return { n: namedNumber, focus: sessionPage(namedNumber) };
    }
    return null;
  };
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
    /* یادداشت جلسه فقط با انتخاب نتیجه از خود جست‌وجو نمایش داده می‌شود. */
    if (destination && destination.pathname.endsWith('/jalase.html') && /^#jalase-\d+$/.test(destination.hash)) {
      try { sessionStorage.setItem('mh-session-access', destination.hash.slice(1)); } catch (error) { /* storage unavailable */ }
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

  /* بعد از انتخاب نتیجه: متن پاک، پنل بسته */
  function finishSearch() {
    if (input) input.value = '';
    renderResults('');
    closeSearch(false);
  }

  function renderResults(value = '') {
    if (!results) return;
    const normalizedInput = normalize(value);
    const tokens = value.trim().split(/\s+/).map(normalize).filter(Boolean);
    results.replaceChildren();
    if (!tokens.length) {
      const hint = document.createElement('p');
      hint.className = 'search-hint';
      hint.textContent = 'مثلاً: همسایه‌داری، علم و حکمت، هدف انسان';
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
    if (!indexLoaded && !matchSession(value) && !matchSessionTag(value)) {
      const hint = document.createElement('p');
      hint.className = 'search-hint';
      hint.textContent = 'در حال آماده‌سازی جست‌وجوی کامل…';
      results.append(hint);
      ensureSearchIndex();
      return;
    }

    /* اول «جلسه X» → فلش روی کادر هدر جلسه */
    const sessionNumber = matchSession(value);
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

    /* بعد تگ‌ها → فلش روی بخش دقیقِ مرتبط داخل صفحهٔ جلسه */
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

    const bestPerPageTitle = new Map();
    index.forEach(item => {
      const titleText = normalize(item.title || '');
      const pageText = normalize(item.pageTitle || '');
      const haystack = normalize(`${item.title || ''} ${item.desc || ''} ${item.terms || ''} ${item.pageTitle || ''}`);
      const ok = tokens.every(token => haystack.includes(token));
      if (!ok) return;
      const descText = normalize(item.desc || '');
      const titleHits = tokens.filter(token => titleText.includes(token)).length;
      const descHits = tokens.filter(token => descText.includes(token)).length;
      const pageHits = tokens.filter(token => pageText.includes(token)).length;
      const exactPhrase = normalizedInput && haystack.includes(normalizedInput) ? 7 : 0;
      const score = titleHits * 10 + descHits * 7 + pageHits * 2 + (item.level === 1 ? 14 : 0) + exactPhrase + tokens.length;
      const page = (item.url || '').split('#')[0];
      const key = page; // یک نتیجهٔ برتر برای هر صفحه، نه تکرار چندین قطعه از یک صفحه
      const candidate = { item, score };
      const previous = bestPerPageTitle.get(key);
      if (!previous || candidate.score > previous.score) bestPerPageTitle.set(key, candidate);
    });
    const matches = Array.from(bestPerPageTitle.values())
      .sort((a, b) => b.score - a.score || String(a.item.title).localeCompare(String(b.item.title), 'fa'))
      .slice(0, 10)
      .map(row => row.item);
    if (!matches.length) {
      const hint = document.createElement('p');
      hint.className = 'search-hint';
      hint.textContent = 'موضوعی با این عبارت پیدا نشد. عبارت دیگری را امتحان کن.';
      results.append(hint);
      return;
    }

    const fragment = document.createDocumentFragment();
    matches.forEach(item => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = resolveSiteHref(item.url);
      /* فلش دقیق: خودِ عنوان موضوع در صفحهٔ مقصد پیدا و منطقهٔ حاوی آن روشن می‌شود */
      link.dataset.flash = item.flash || ('text:' + item.title);
      const description = document.createElement('span');
      description.append(document.createTextNode(item.title));
      const small = document.createElement('small');
      small.textContent = item.desc;
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

  document.querySelectorAll('[data-search-open]').forEach(button => {
    button.addEventListener('click', () => openSearch(button));
  });
  document.querySelectorAll('[data-search-close]').forEach(button => {
    button.addEventListener('click', () => closeSearch());
  });
  layer?.addEventListener('click', event => {
    if (event.target === layer) closeSearch();
  });
  input?.addEventListener('input', event => renderResults(event.target.value));

  /* کلیک روی نتیجه: پاک و بسته، بعد ورود + فلش منطقهٔ دقیق */
  results?.addEventListener('click', event => {
    const link = event.target.closest('a.search-result');
    if (!link) return;
    event.preventDefault();
    const href = link.getAttribute('href');
    const key = link.dataset.flash || flashKeyFromHref(href);
    finishSearch();
    navigateWithFlash(href, key);
  });

  /* Enter: اولین نتیجه + فلش منطقهٔ دقیق */
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      const first = results?.querySelector('a.search-result');
      if (first) {
        event.preventDefault();
        const href = first.getAttribute('href');
        const key = first.dataset.flash || flashKeyFromHref(href);
        finishSearch();
        navigateWithFlash(href, key);
      }
    }
  });

  menuButton?.addEventListener('click', toggleMenu);
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('click', event => {
    const target = event.target;
    if (nav?.classList.contains('is-open') && target instanceof Node && !nav.contains(target) && !menuButton?.contains(target)) {
      closeMenu(false);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (layer && !layer.hidden) closeSearch();
      if (nav?.classList.contains('is-open')) closeMenu(true);
    }
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyK') {
      event.preventDefault();
      openSearch(document.querySelector('[data-search-open]'));
    }
    if (event.key === 'Tab' && layer && !layer.hidden && panel) {
      const focusables = Array.from(panel.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])'))
        .filter(element => !element.hasAttribute('disabled'));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
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