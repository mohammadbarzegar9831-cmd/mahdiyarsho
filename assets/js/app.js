(() => {
  'use strict';
  document.documentElement.classList.add('js-enabled');

  /* صفحهٔ 404 مسیر پایهٔ پروژه را اعلام می‌کند تا مقصدهای جست‌وجو نسبی نشوند. */
  const siteBasePath = document.querySelector('meta[name="site-base"]')?.content;
  const resolveSiteHref = href => siteBasePath
    ? new URL(href, new URL(siteBasePath, window.location.origin)).href
    : href;

  /* آیکون اختصاصی مرورگر از فایل‌های ثابت در HTML بارگذاری می‌شود. */

  const index = Array.isArray(window.MAHDIYARSHO_SEARCH_INDEX) ? window.MAHDIYARSHO_SEARCH_INDEX : [];

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
  const sessionPages = { 1: '#jalase-1', 2: '#jalase-2', 3: '#jalase-3', 4: '#jalase-4', 5: '#jalase-5', 6: '#jalase-6', 7: '#jalase-7' };
  const sessionNames = { 1: 'اول', 2: 'دوم', 3: 'سوم', 4: 'چهارم', 5: 'پنجم', 6: 'ششم', 7: 'هفتم' };
  const sessionWords = {
    '1':1,'یک':1,'اول':1,'یکم':1, '2':2,'دو':2,'دوم':2, '3':3,'سه':3,'سوم':3,
    '4':4,'چهار':4,'چهارم':4, '5':5,'پنج':5,'پنجم':5,
    '6':6,'شش':6,'ششم':6,'ششمی':6, '7':7,'هفت':7,'هفتم':7,'هفتمی':7
  };
  const sessionTags = {
    'احکام1':{n:1,focus:'#jalase-1 > section.idea-section:nth-of-type(1)'}, 'اعتقادی1':{n:1,focus:'#jalase-1 > section.idea-section:nth-of-type(2)'},
    'احکام2':{n:2,focus:'#jalase-2 > section.idea-section:nth-of-type(1)'}, 'ارتباطموثر1':{n:2,focus:'#jalase-2 > section.idea-section:nth-of-type(2)'},
    'احکام3':{n:3,focus:'#jalase-3 > section.idea-section:nth-of-type(1)'}, 'رشدفردی1':{n:3,focus:'#jalase-3 > section.idea-section:nth-of-type(2)'},
    'احکام4':{n:4,focus:'#jalase-4 > section.idea-section:nth-of-type(1)'}, 'ارتباطموثر2':{n:4,focus:'#jalase-4 > section.idea-section:nth-of-type(2)'},
    'احکام5':{n:5,focus:'#jalase-5 > section.idea-section:nth-of-type(1)'}, 'رشدفردی2':{n:5,focus:'#jalase-5 > section.idea-section:nth-of-type(2)'},
    'احکام6':{n:6,focus:'#jalase-6 > section.idea-section:nth-of-type(1)'}, 'اعتقادی2':{n:6,focus:'#jalase-6 > section.idea-section:nth-of-type(2)'},
    'احکام7':{n:7,focus:'#jalase-7 > section.idea-section:nth-of-type(1)'}, 'همسایهداری7':{n:7,focus:'#jalase-7 > section.idea-section:nth-of-type(1)'},
    'ارتباطموثر3':{n:7,focus:'#jalase-7 > section.idea-section:nth-of-type(2)'}, 'فنبیان3':{n:7,focus:'#jalase-7 > section.idea-section:nth-of-type(2)'}
  };
  const matchSession = value => {
    const normalized = normalize(value);
    const match = normalized.match(/^(?:جلسه|کلاس)(?:ی)?(.+)$/);
    if (!match) return null;
    return sessionWords[match[1]] || null;
  };
  const matchSessionTag = value => {
    const normalized = normalize(value);
    if (sessionTags[normalized]) return sessionTags[normalized];
    const categoryTag = normalized.match(/^(احکام|اعتقادی|ارتباطموثر|رشدفردی|همسایهداری|فنبیان)(.+)$/);
    if (categoryTag && sessionWords[categoryTag[2]]) {
      const key = categoryTag[1] + sessionWords[categoryTag[2]];
      if (sessionTags[key]) return sessionTags[key];
    }
    /* قبول تگ‌هایی مثل #جلسه_ششم، #کلاس-6 و #احکام_۶؛ # و جداکننده‌ها در normalize حذف شده‌اند. */
    const named = normalized.match(/^(?:جلسه|کلاس)(.+)$/);
    if (named && sessionWords[named[1]]) return { n: sessionWords[named[1]], focus: sessionPages[sessionWords[named[1]]] };
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
    if (destination && destination.pathname.endsWith('/jalase.html') && /^#jalase-[1-7]$/.test(destination.hash)) {
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

  /* بعد از انتخاب نتیجه: متن پاک، پنل بسته */
  function finishSearch() {
    if (input) input.value = '';
    renderResults('');
    closeSearch(false);
  }

  function renderResults(value = '') {
    if (!results) return;
    const tokens = value.trim().split(/\s+/).map(normalize).filter(Boolean);
    results.replaceChildren();
    if (!tokens.length) {
      const hint = document.createElement('p');
      hint.className = 'search-hint';
      hint.textContent = 'مثلاً: همسایه‌داری، علم و حکمت، هدف انسان';
      results.append(hint);
      return;
    }

    /* اول «جلسه X» → فلش روی کادر هدر جلسه */
    const sessionNumber = matchSession(value);
    if (sessionNumber) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = resolveSiteHref('jalase.html' + sessionPages[sessionNumber]);
      link.dataset.flash = sessionPages[sessionNumber];
      const description = document.createElement('span');
      description.append(document.createTextNode('یادداشت‌های جلسه / کلاس ' + sessionNames[sessionNumber]));
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
      link.href = resolveSiteHref('jalase.html' + sessionPages[sessionTag.n]);
      link.dataset.flash = sessionTag.focus;
      const description = document.createElement('span');
      description.append(document.createTextNode('یادداشت‌های جلسه / کلاس ' + sessionNames[sessionTag.n]));
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

    const matches = index.map(item => {
      const titleText = normalize(item.title || '');
      const haystack = normalize(`${item.title || ''} ${item.desc || ''} ${item.terms || ''}`);
      const ok = tokens.every(token => haystack.includes(token));
      if (!ok) return null;
      const score = tokens.reduce((total, token) => total + (titleText.includes(token) ? 5 : 0) + (haystack.includes(token) ? 1 : 0), 0);
      return { item, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12).map(row => row.item);

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
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
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