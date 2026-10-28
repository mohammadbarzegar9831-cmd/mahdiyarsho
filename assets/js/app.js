(() => {
  'use strict';
  document.documentElement.classList.add('js-enabled');

  /* صفحهٔ 404 مسیر پایهٔ پروژه را اعلام می‌کند تا مقصدهای جست‌وجو نسبی نشوند. */
  const siteBasePath = document.querySelector('meta[name="site-base"]')?.content;
  const resolveSiteHref = href => siteBasePath
    ? new URL(href, new URL(siteBasePath, window.location.origin)).href
    : href;

  /* آیکون اختصاصی مرورگر از فایل‌های ثابت در HTML بارگذاری می‌شود. */

  const index = [
    {title:'احکام اجتماعی',desc:'بخش احکام · فهرست هشت موضوع',url:'ahkam.html',terms:'احکام اجتماعی احکام'},
    {title:'امر به معروف و نهی از منکر',desc:'احکام اجتماعی · موضوع اول',url:'amr-marouf.html',terms:'امر معروف نهی منکر واجب عینی کفایی'},
    {title:'ارتباط مؤثر',desc:'انواع ارتباط برقرار کردن · بخش سوم سایت',url:'ertebat.html',terms:'ارتباط موثر ارتباطمؤثر انواع ارتباط برقرار کردن حرف زدن زبان بدن فرا بدن ارتباط'},
    {title:'فن بیان',desc:'ارتباط مؤثر · حرف زدن',url:'fan-bayan.html',terms:'فن بیان خوب دیدن واژگان مدیریت بحران کتاب'},
    {title:'همسایه‌داری',desc:'احکام اجتماعی',url:'ahkam.html',terms:'همسایه داری همسایه'},
    {title:'گناهان زبانی',desc:'احکام اجتماعی',url:'ahkam.html',terms:'گناهان زبانی'},
    {title:'فضای مجازی',desc:'احکام اجتماعی',url:'ahkam.html',terms:'احکام فضای مجازی فضای مجازی اینترنت'},
    {title:'کپی‌رایت',desc:'احکام اجتماعی',url:'ahkam.html',terms:'کپی رایت'},
    {title:'آرایش و زینت',desc:'احکام اجتماعی',url:'ahkam.html',terms:'آرایش زینت'},
    {title:'ارتباط با نامحرم',desc:'احکام اجتماعی',url:'ahkam.html',terms:'ارتباط نامحرم'},
    {title:'مجالس شادی',desc:'احکام اجتماعی',url:'ahkam.html',terms:'احکام مجالس شادی مجالس شادی'},
    {title:'علم و حکمت الهی',desc:'اعتقادی · فصل اول',url:'aqeedeh.html',terms:'علم حکمت الهی'},
    {title:'مهربانی و رأفت خدا',desc:'اعتقادی · فصل دوم',url:'aqeedeh.html',terms:'مهربانی رأفت رافت خدا'},
    {title:'خواست و قدرت الهی',desc:'اعتقادی · فصل سوم',url:'aqeedeh.html',terms:'خواست قدرت الهی'},
    {title:'هدف خلقت انسان',desc:'علم و حکمت الهی · زیرموضوع اول',url:'hadaf.html#creation',terms:'هدف خلقت انسان آفرینش خدا شباهت علم'},
    {title:'خدا و انسان شباهت ندارند',desc:'هدف خلقت انسان · شناخت خدا',url:'hadaf.html#creation',terms:'شباهت خدا انسان تصویر علم خدا'},
    {title:'تفاوت هدف انسان با خدا',desc:'علم و حکمت الهی · زیرموضوع دوم',url:'hadaf.html#human-god-goal',flash:'#human-god-goal',terms:'تفاوت هدف انسان خدا تفاوت هدف خدا با انسان بی نیاز کمال'},
    {title:'نتیجه‌گیری بخش اعتقادی',desc:'خدا بی‌نیاز و بخشنده است',url:'hadaf.html#conclusion',flash:'#conclusion',terms:'نتیجه گیری علم فراوان خدا بخشنده بی نیاز'},
    {title:'رشد فردی',desc:'بخش چهارم · یک فصل',url:'roshd.html',terms:'رشد فردی رشد'},
    {title:'قدرت تمرکز',desc:'رشد فردی · فصل اول',url:'tamarkoz.html',terms:'تمرکز اراده توجه فواید تمرکز حواس پرتی'},
    {title:'شرایط امر به معروف و نهی از منکر',desc:'احکام · موضوع اول',url:'amr-marouf.html',terms:'شرایط امر معروف نهی منکر یقین احتمال تاثیر اصرار معذور ضرر خسران نجات پدر مادر همسر احترام'},
    {title:'نکته‌های مهم امر به معروف و نهی از منکر',desc:'احکام · موضوع اول',url:'amr-marouf.html',terms:'نکته امر معروف نهی منکر خودمان عمل پدر مادر همسر احترام'},
    {title:'افزایش دایره کلمات یا سرعت دسترسی به واژگان',desc:'ارتباط مؤثر · فن بیان',url:'fan-bayan.html',terms:'دایره کلمات واژگان تمرین رنگ جنس اجزا شکل حس'},
    {title:'علت حواس‌پرتی',desc:'رشد فردی · قدرت تمرکز',url:'tamarkoz.html#havasperti',terms:'حواس پرتی علت رنج فرار تسکین شناخت غرور تخریب شخصیت'}
  ];

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
    .replace(/[\s\u200c\u200d\u200e\u200f\u2060\ufeff#_ـ،,؛;:!؟?."'`()\[\]{}<>/\\|–—-]/g, '');

  /* صفحهٔ پنهان جلسه‌ها */
  const sessionPages = { 1: '#jalase-1', 2: '#jalase-2', 3: '#jalase-3', 4: '#jalase-4', 5: '#jalase-5' };
  const sessionNames = { 1: 'اول', 2: 'دوم', 3: 'سوم', 4: 'چهارم', 5: 'پنجم' };
  const sessionWords = {
    '1': 1, 'یک': 1, 'اول': 1, 'یکم': 1,
    '2': 2, 'دو': 2, 'دوم': 2,
    '3': 3, 'سه': 3, 'سوم': 3,
    '4': 4, 'چهار': 4, 'چهارم': 4,
    '5': 5, 'پنج': 5, 'پنجم': 5
  };
  /* هر تگ → شمارهٔ جلسه + نشانهٔ دقیقِ بخش مربوطه داخل همان صفحه */
  const sessionTags = {
    'احکام1':     { n: 1, focus: '#jalase-1 > section:nth-of-type(1)' },
    'اعتقادی1':  { n: 1, focus: '#jalase-1 > section:nth-of-type(2)' },
    'احکام2':     { n: 2, focus: '#jalase-2 > section:nth-of-type(1)' },
    'ارتباطموثر1': { n: 2, focus: '#jalase-2 > section:nth-of-type(2)' },
    'احکام3':     { n: 3, focus: '#jalase-3 > section:nth-of-type(1)' },
    'رشدفردی1':   { n: 3, focus: '#jalase-3 > section:nth-of-type(2)' },
    'احکام4':     { n: 4, focus: '#jalase-4 > section:nth-of-type(1)' },
    'ارتباطموثر2': { n: 4, focus: '#jalase-4 > section:nth-of-type(2)' },
    'احکام5':     { n: 5, focus: '#jalase-5 > section:nth-of-type(1)' },
    'رشدفردی2':   { n: 5, focus: '#jalase-5 > section:nth-of-type(2)' }
  };
  const matchSession = value => {
    const match = normalize(value).match(/^جلسه(ی)?(.+)$/);
    if (!match) return null;
    return sessionWords[match[2]] || null;
  };
  const matchSessionTag = value => sessionTags[normalize(value)] || null;

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
    if (destination && destination.pathname.endsWith('/jalase.html') && /^#jalase-[1-5]$/.test(destination.hash)) {
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
      description.append(document.createTextNode('یادداشت‌های جلسهٔ ' + sessionNames[sessionNumber]));
      const small = document.createElement('small');
      small.textContent = 'صفحهٔ اختصاصی یادداشت‌ها · فقط از طریق جست‌وجو';
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
      description.append(document.createTextNode('یادداشت‌های جلسهٔ ' + sessionNames[sessionTag.n]));
      const small = document.createElement('small');
      small.textContent = 'بخش مرتبط با تگ · فقط از طریق جست‌وجو';
      description.append(small);
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '←';
      link.append(description, arrow);
      results.append(link);
      return;
    }

    const matches = index.filter(item => {
      const haystack = normalize(`${item.title} ${item.desc} ${item.terms}`);
      return tokens.every(token => haystack.includes(token));
    }).slice(0, 9);

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
    '.insight-card', '.cinema-quote', '.reason-card', '.conclusion'
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
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
    reveals.forEach(element => revealObserver.observe(element));
  } else {
    reveals.forEach(element => element.classList.add('is-visible'));
  }
})();