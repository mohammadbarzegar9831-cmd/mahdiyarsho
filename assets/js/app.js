(() => {
  'use strict';
  document.documentElement.classList.add('js-enabled');

  const index = [
    {title:'احکام اجتماعی',desc:'بخش احکام · فهرست هشت موضوع',url:'ahkam.html',terms:'احکام اجتماعی احکام'},
    {title:'امر به معروف و نهی از منکر',desc:'احکام اجتماعی · موضوع اول',url:'amr-marouf.html',terms:'امر معروف نهی منکر واجب عینی کفایی'},
    {title:'انواع ارتباط برقرار کردن',desc:'ارتباط مؤثر',url:'ertebat.html',terms:'حرف زدن زبان بدن فرا بدن ارتباط'},
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
    {title:'تفاوت هدف خدا با انسان',desc:'علم و حکمت الهی · زیرموضوع دوم',url:'hadaf.html#human-god-goal',terms:'تفاوت هدف انسان خدا بی نیاز کمال'},
    {title:'نتیجه‌گیری بخش اعتقادی',desc:'خدا بی‌نیاز و بخشنده است',url:'hadaf.html#human-god-goal',terms:'نتیجه علم فراوان خدا بخشنده بی نیاز'},
    {title:'رشد فردی',desc:'بخش چهارم · یک فصل',url:'roshd.html',terms:'رشد فردی رشد'},
    {title:'قدرت تمرکز',desc:'رشد فردی · فصل اول',url:'tamarkoz.html',terms:'تمرکز اراده توجه فواید تمرکز'},
    {title:'شرایط امر به معروف و نهی از منکر',desc:'احکام · موضوع اول',url:'amr-marouf.html',terms:'شرایط امر معروف نهی منکر یقین احتمال تاثیر اصرار معذور'},
    {title:'افزایش دایره کلمات یا سرعت دسترسی به واژگان',desc:'ارتباط مؤثر · فن بیان',url:'fan-bayan.html',terms:'دایره کلمات واژگان تمرین رنگ جنس اجزا شکل حس'},
  ];

  const layer = document.querySelector('.search-layer');
  const panel = layer?.querySelector('.search-panel');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('.main-nav');
  let lastSearchTrigger = null;
  let revealObserver = null;

  const normalize = value => String(value)
    .toLocaleLowerCase('fa')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌\s\-ـ]/g, '');

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
      link.href = item.url;
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

  // One reveal setup handles both authored and automatically selected elements.
  const revealSelectors = [
    '.hero-copy > *', '.hero-art', '.hero-bottom', '.breadcrumb', '.page-hero',
    '.section-heading', '.feature-card', '.belief-card', '.topic-row',
    '.subtopics-strip', '.quote-inner', '.page-next', '.idea-section',
    '.insight-card', '.cinema-quote', '.reason-card', '.conclusion'
  ].join(',');
  document.querySelectorAll(revealSelectors).forEach((element, indexInParent) => {
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
