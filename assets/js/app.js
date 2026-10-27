(() => {
  const index = [
    {title:'احکام اجتماعی',desc:'بخش احکام · فهرست هشت موضوع',url:'ahkam.html',terms:'احکام اجتماعی احکام'},
    {title:'امر به معروف و نهی از منکر',desc:'احکام اجتماعی · موضوع اول',url:'amr-marouf.html',terms:'امر معروف نهی منکر واجب عینی کفایی'},
    {title:'انواع ارتباط برقرار کردن',desc:'ارتباط مؤثر',url:'ertebat.html',terms:'حرف زدن زبان بدن فرا بدن ارتباط'},
    {title:'فن بیان',desc:'ارتباط مؤثر · حرف زدن',url:'fan-bayan.html',terms:'فن بیان خوب دیدن واژگان مدیریت بحران کتاب'},
    {title:'همسایه‌داری',desc:'احکام اجتماعی',url:'ahkam.html',terms:'همسایه داری همسایه'},
    {title:'گناهان زبانی',desc:'احکام اجتماعی',url:'ahkam.html',terms:'گناهان زبانی'},
    {title:'احکام فضای مجازی',desc:'احکام اجتماعی',url:'ahkam.html',terms:'فضای مجازی اینترنت'},
    {title:'کپی‌رایت',desc:'احکام اجتماعی',url:'ahkam.html',terms:'کپی رایت'},
    {title:'آرایش و زینت',desc:'احکام اجتماعی',url:'ahkam.html',terms:'آرایش زینت'},
    {title:'ارتباط با نامحرم',desc:'احکام اجتماعی',url:'ahkam.html',terms:'ارتباط نامحرم'},
    {title:'احکام مجالس شادی',desc:'احکام اجتماعی',url:'ahkam.html',terms:'مجالس شادی'},
    {title:'علم و حکمت الهی',desc:'اعتقادی · فصل اول',url:'aqeedeh.html',terms:'علم حکمت الهی'},
    {title:'مهربانی و رأفت خدا',desc:'اعتقادی · فصل دوم',url:'aqeedeh.html',terms:'مهربانی رافت خدا'},
    {title:'خواست و قدرت الهی',desc:'اعتقادی · فصل سوم',url:'aqeedeh.html',terms:'خواست قدرت الهی'},
    {title:'هدف خلقت انسان است',desc:'علم و حکمت الهی · زیرموضوع اول',url:'hadaf.html#creation',terms:'هدف خلقت انسان آفرینش خدا شباهت علم'},
    {title:'خدا و انسان شباهت ندارند',desc:'هدف خلقت انسان · شناخت خدا',url:'hadaf.html#creation',terms:'شباهت خدا انسان تصویر علم خدا'},
    {title:'تفاوت هدف خدا با انسان',desc:'علم و حکمت الهی · زیرموضوع دوم',url:'hadaf.html#human-god-goal',terms:'تفاوت هدف انسان خدا بی نیاز کمال'},
    {title:'نتیجه‌گیری بخش اعتقادی',desc:'خدا بی‌نیاز و بخشنده است',url:'hadaf.html#human-god-goal',terms:'نتیجه علم فراوان خدا بخشنده بی نیاز'},
    {title:'رشد فردی',desc:'بخش چهارم · فهرست فصل‌ها',url:'roshd.html',terms:'رشد فردی رشد'},
    {title:'قدرت تمرکز',desc:'رشد فردی · فصل اول',url:'tamarkoz.html',terms:'تمرکز اراده توجه فواید تمرکز'},
    {title:'شرایط امر به معروف و نهی از منکر',desc:'احکام · موضوع اول',url:'amr-marouf.html',terms:'شرایط امر معروف نهی منکر یقین احتمال تاثیر اصرار معذور'},
    {title:'افزایش سرعت دسترسی به واژگان',desc:'ارتباط مؤثر · فن بیان',url:'fan-bayan.html',terms:'واژگان تمرین رنگ جنس اجزا شکل حس'},
  ];
  const layer = document.querySelector('.search-layer');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const open = () => { if (!layer) return; layer.hidden=false; document.body.style.overflow='hidden'; setTimeout(()=>input?.focus(),30); };
  const close = () => { if (!layer) return; layer.hidden=true; document.body.style.overflow=''; };
  document.querySelectorAll('[data-search-open]').forEach(b=>b.addEventListener('click',open));
  document.querySelectorAll('[data-search-close]').forEach(b=>b.addEventListener('click',close));
  layer?.addEventListener('click',e=>{if(e.target===layer)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()}});
  function normalize(s){return s.toLocaleLowerCase('fa').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\s\-ـ]/g,'')}
  function render(q=''){
    if(!results)return;
    const query=normalize(q.trim());
    if(!query){results.innerHTML='<p class="search-hint">مثلاً: همسایه‌داری، علم و حکمت، هدف انسان</p>';return;}
    const matches=index.filter(item=>normalize(item.title+' '+item.desc+' '+item.terms).includes(query)).slice(0,9);
    results.innerHTML=matches.length?matches.map(item=>`<a class="search-result" href="${item.url}"><span>${item.title}<small>${item.desc}</small></span><span>←</span></a>`).join(''):'<p class="search-hint">موضوعی با این عبارت پیدا نشد. عبارت دیگری را امتحان کن.</p>';
  }
  input?.addEventListener('input',e=>render(e.target.value));
  const reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08});reveals.forEach(el=>observer.observe(el));}else reveals.forEach(el=>el.classList.add('is-visible'));
})();
(function(){
  const SEL = [
    '.hero-copy > *','.hero-art','.hero-bottom',
    '.breadcrumb','.page-hero',
    '.section-heading','.feature-card','.belief-card','.topic-row',
    '.subtopics-strip','.bottom-strip','.quote-inner','.page-next',
    '.idea-section','.insight-card','.cinema-quote','.reason-card','.conclusion'
  ].join(',');

  const items = Array.from(document.querySelectorAll(SEL))
    .filter(el => !el.classList.contains('reveal'));
  if (!items.length) return;

  const counter = new WeakMap();
  items.forEach(el=>{
    const p = el.parentElement || document.body;
    const i = counter.get(p) || 0;
    counter.set(p, i + 1);
    el.style.transitionDelay = (Math.min(i,5) * 110) + 'ms';
    el.classList.add('reveal');
  });

  const show = el => el.classList.add('is-visible');

  if (!('IntersectionObserver' in window)) { setTimeout(()=>items.forEach(show), 200); return; }

  const io = new IntersectionObserver(es=>{
    es.forEach(en=>{
      if (en.isIntersecting){ show(en.target); io.unobserve(en.target); }
    });
  },{threshold:.08, rootMargin:'0px 0px -6% 0px'});

  let started = false;
  const start = ()=>{
    if (started) return;
    started = true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>items.forEach(el=>io.observe(el))));
  };
  if (document.readyState === 'complete') setTimeout(start, 140);
  else window.addEventListener('load', ()=>setTimeout(start, 140));
  setTimeout(start, 900);
})();