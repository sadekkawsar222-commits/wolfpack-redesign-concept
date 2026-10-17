/* WolfPack redesign: interactions shared by every page. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.remove('no-js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce) root.classList.add('reduced');
  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const refreshField = () => window.wpRefreshField && window.wpRefreshField();

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    window.__lenis = lenis;
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = $(id); if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- split text ---------- */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    el.classList.add('split');
  }
  $$('[data-split]').forEach(splitWords);

  /* ---------- loader + hero intro ---------- */
  let introDone = false;
  function heroIntro() {
    if (introDone) return;
    introDone = true;
    window.wpWantStart = true;
    window.wpStartField && window.wpStartField();
    if (!hasGsap || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    const h = $('[data-hero-title]');
    if (h) tl.from($$('.w > span', h), { yPercent: 115, duration: 1.4, stagger: 0.06 }, 0.1);
    tl.from('[data-hero-in]', { y: 30, opacity: 0, duration: 1.2, stagger: 0.09 }, 0.35);
    tl.from('.nav', { y: -30, opacity: 0, duration: 1 }, 0.2);
  }
  const loader = $('.loader');
  if (loader && !reduce && hasGsap) {
    const b = $('.loader__count b', loader);
    const o = { v: 0 };
    gsap.to(o, {
      v: 100, duration: 1.3, ease: 'power2.inOut',
      onUpdate: () => { b.textContent = String(Math.round(o.v)).padStart(3, '0'); },
      onComplete: () => {
        gsap.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut', onComplete: () => loader.remove() });
        setTimeout(heroIntro, 250);
      },
    });
    gsap.set(loader, { clipPath: 'inset(0 0 0% 0)' });
    // safety net: never let the loader block the page (slow devices, throttled tabs)
    setTimeout(() => { if (document.body.contains(loader)) { loader.remove(); heroIntro(); } }, 4500);
  } else {
    loader && loader.remove();
    heroIntro();
  }

  /* ---------- reveal on scroll ---------- */
  if (hasGsap && !reduce) {
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
    });
    $$('[data-split]:not([data-hero-title])').forEach(el => {
      gsap.from($$('.w > span', el), {
        yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 86%' },
      });
    });
  } else {
    $$('[data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  /* ---------- nav ---------- */
  const nav = $('.nav');
  let lastY = 0;
  const line = $('.scroll-line');
  function onScroll() {
    const y = scrollY;
    if (nav) {
      nav.classList.toggle('is-solid', y > 30);
    }
    lastY = y;
    if (line) line.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const ann = $('.announce');
  $('.announce__x')?.addEventListener('click', () => { ann.remove(); refreshField(); hasGsap && ScrollTrigger.refresh(); });

  $('.burger')?.addEventListener('click', () => {
    const open = root.classList.toggle('menu-open');
    $('.burger').setAttribute('aria-expanded', open);
    open ? lenis?.stop() : lenis?.start();
  });
  $$('.mmenu a').forEach(a => a.addEventListener('click', () => { root.classList.remove('menu-open'); lenis?.start(); }));

  /* ---------- cursor ---------- */
  if (fine && !reduce) {
    const ring = document.createElement('div'); ring.className = 'cursor'; ring.innerHTML = '<span></span>';
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    document.body.append(ring, dot);
    const label = ring.firstChild;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    (function loop() { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover', e => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, input, textarea, select, label');
      ring.classList.toggle('is-label', !!lab);
      ring.classList.toggle('is-link', !lab && !!link);
      label.textContent = lab ? lab.dataset.cursor : '';
    });
  }

  /* ---------- magnetic ---------- */
  if (fine && !reduce) {
    $$('.btn, .round, [data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.28, y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- spotlight cards ---------- */
  $$('.gcard').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* ---------- counters ---------- */
  const fmt = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  function runCount(el) {
    const end = parseFloat(el.dataset.count), d = parseInt(el.dataset.dec || '0', 10);
    const pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    if (reduce || !hasGsap) { el.textContent = pre + fmt(end, d) + suf; return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = pre + fmt(o.v, d) + suf; } });
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); } }), { threshold: 0.4 });
  $$('[data-count]').forEach(el => io.observe(el));

  /* ---------- duplicate marquees ---------- */
  $$('.marquee__track').forEach(t => {
    [...t.children].forEach(c => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.querySelectorAll('a').forEach(a => a.tabIndex = -1); t.appendChild(k); });
  });

  /* ---------- statement word scrub ---------- */
  const st = $('.statement__text');
  if (st) {
    const words = st.textContent.trim().split(/\s+/);
    st.innerHTML = words.map(w => `<span class="sw">${w}</span>`).join(' ');
    const sws = $$('.sw', st);
    if (hasGsap && !reduce) {
      ScrollTrigger.create({
        trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true,
        onUpdate: s => { const n = s.progress * sws.length; sws.forEach((w, i) => { w.style.opacity = Math.min(1, Math.max(0.32, n - i)); }); },
      });
    } else sws.forEach(w => (w.style.opacity = 1));
  }
  const wp = $('.why-photo');
  if (wp && hasGsap && !reduce) {
    gsap.to(wp, { clipPath: 'inset(0% 0% 0% 0% round 26px)', ease: 'none', scrollTrigger: { trigger: wp, start: 'top 95%', end: 'center 55%', scrub: true } });
    gsap.to($('img', wp), { scale: 1, ease: 'none', scrollTrigger: { trigger: wp, start: 'top 95%', end: 'bottom 30%', scrub: true } });
  } else if (wp) wp.style.clipPath = 'none';

  /* ---------- services sticky ---------- */
  const svc = $('.svc');
  if (svc) {
    const panels = $$('.svc__panel', svc), tabs = $$('.svc__tab', svc), big = $('.svc__label b', svc);
    let cur = -1;
    const update = () => {
      const r = svc.getBoundingClientRect();
      const p = Math.min(0.9999, Math.max(0, -r.top / (r.height - innerHeight)));
      const i = Math.floor(p * 3);
      tabs.forEach((t, k) => t.style.setProperty('--p', `${Math.min(100, Math.max(0, (p * 3 - k) * 100))}%`));
      if (i !== cur) {
        cur = i;
        panels.forEach((el, k) => el.classList.toggle('is-on', k === i));
        tabs.forEach((el, k) => { el.classList.toggle('is-on', k === i); el.setAttribute('aria-selected', k === i); });
        if (big) big.textContent = `0${i + 1}`;
      }
    };
    addEventListener('scroll', update, { passive: true }); update();
    tabs.forEach((t, k) => t.addEventListener('click', () => {
      const top = svc.getBoundingClientRect().top + scrollY + (svc.offsetHeight - innerHeight) * ((k + 0.5) / 3);
      lenis ? lenis.scrollTo(top) : scrollTo({ top, behavior: 'smooth' });
    }));
  }

  /* ---------- reporting tilt + parallax ---------- */
  const screen = $('.screen');
  if (screen && fine && !reduce) {
    const box = screen.parentElement;
    box.addEventListener('pointermove', e => {
      const r = box.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      screen.style.transform = `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
    });
    box.addEventListener('pointerleave', () => { screen.style.transform = ''; });
  }
  if (hasGsap && !reduce) {
    $$('[data-speed]').forEach(el => gsap.to(el, { y: () => -parseFloat(el.dataset.speed) * 120, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  }

  /* ---------- proof horizontal track ---------- */
  const proof = $('.proof');
  if (proof) {
    const track = $('.proof__track', proof), bar = $('.proof__bar i', proof);
    let dist = 0;
    const size = () => {
      dist = Math.max(0, track.scrollWidth - innerWidth);
      proof.style.height = `${innerHeight + dist}px`;
      refreshField(); hasGsap && ScrollTrigger.refresh();
    };
    const move = () => {
      const r = proof.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      track.style.transform = `translate3d(${-p * dist}px,0,0)`;
      if (bar) bar.style.transform = `scaleX(${p})`;
    };
    size(); move();
    addEventListener('resize', () => { size(); move(); });
    addEventListener('load', () => { size(); move(); });
    addEventListener('scroll', move, { passive: true });
  }

  /* ---------- industries constellation ---------- */
  const cons = $('.constellation');
  if (cons) {
    const nodes = $$('.node', cons);
    const pts = nodes.map(n => ({ el: n, x: parseFloat(n.dataset.x), y: parseFloat(n.dataset.y), d: parseFloat(n.dataset.d || 1), ph: Math.random() * 6.28 }));
    pts.forEach(p => { p.el.style.left = `${p.x}%`; p.el.style.top = `${p.y}%`; });
    const svg = $('svg.links', cons);
    const pairs = [];
    pts.forEach((a, i) => {
      const near = pts.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, (a.y - b.y) * 0.6) })).filter(o => o.j !== i).sort((m, n) => m.d - n.d).slice(0, 2);
      near.forEach(o => { const k = i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`; if (!pairs.includes(k)) pairs.push(k); });
    });
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none');
    const lines = pairs.map(k => { const [i, j] = k.split('-').map(Number); const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('vector-effect', 'non-scaling-stroke'); svg.appendChild(l); return { l, a: pts[i], b: pts[j] }; });
    let mx = 0, my = 0, tx = 0, ty = 0, vis = false;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(cons);
    cons.addEventListener('pointermove', e => { const r = cons.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; });
    (function loop(t) {
      if (vis) {
        mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
        const s = t / 1000;
        pts.forEach(p => {
          p.ox = reduce ? 0 : Math.sin(s * 0.5 + p.ph) * 0.8 - mx * 4 * p.d;
          p.oy = reduce ? 0 : Math.cos(s * 0.4 + p.ph) * 1.2 - my * 4 * p.d;
          p.el.style.transform = `translate(calc(-50% + ${p.ox}vw), calc(-50% + ${p.oy}vh))`;
        });
        const r = cons.getBoundingClientRect();
        lines.forEach(({ l, a, b }) => {
          l.setAttribute('x1', a.x + a.ox * innerWidth / r.width); l.setAttribute('y1', a.y + a.oy * innerHeight / r.height);
          l.setAttribute('x2', b.x + b.ox * innerWidth / r.width); l.setAttribute('y2', b.y + b.oy * innerHeight / r.height);
        });
      }
      requestAnimationFrame(loop);
    })(0);
  }

  /* ---------- team carousel ---------- */
  const team = $('.team');
  if (team && window.WP_TEAM) {
    const list = window.WP_TEAM;
    const stage = $('.team__stage', team), who = $('.team__who', team), bg = $('.team__bg', team);
    stage.insertAdjacentHTML('afterbegin', list.map((m, i) => `<div class="team__card${i === 0 ? ' is-on' : ''}"><img src="${m.img}" alt="${m.name}, ${m.role}" loading="lazy" width="768" height="768"></div>`).join(''));
    const cards = $$('.team__card', stage);
    bg.innerHTML = [0, 1, 2, 3].map(() => '<img alt="" loading="lazy">').join('');
    const bgs = $$('img', bg);
    let i = 0, timer;
    const paint = () => {
      const m = list[i];
      $('.team__role', who).textContent = m.role;
      $('.team__name', who).textContent = m.name;
      $('.team__bio', who).textContent = m.bio;
      $('.team__count', who).textContent = `${String(i + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
      bgs.forEach((b, k) => { b.src = list[(i + k + 1) % list.length].img; });
    };
    const go = d => {
      const prev = cards[i];
      i = (i + d + list.length) % list.length;
      cards.forEach(c => c.classList.remove('is-out'));
      prev.classList.remove('is-on'); prev.classList.add('is-out');
      cards[i].classList.add('is-on');
      who.classList.add('is-swapping');
      setTimeout(() => { paint(); who.classList.remove('is-swapping'); }, 360);
      restart();
    };
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(1), 5200); };
    $('[data-team-prev]', team).addEventListener('click', () => go(-1));
    $('[data-team-next]', team).addEventListener('click', () => go(1));
    paint(); restart();
  }

  /* ---------- guide tabs ---------- */
  $$('.guide').forEach(g => {
    const tabs = $$('.guide__tab', g), panes = $$('.guide__pane', g);
    tabs.forEach((t, k) => t.addEventListener('click', () => {
      tabs.forEach((x, j) => { x.classList.toggle('is-on', j === k); x.setAttribute('aria-selected', j === k); });
      panes.forEach((x, j) => x.classList.toggle('is-on', j === k));
    }));
  });

  /* ---------- faq ---------- */
  $$('.qa').forEach(q => {
    const b = $('button', q);
    b.addEventListener('click', () => {
      const open = q.classList.toggle('is-open');
      b.setAttribute('aria-expanded', open);
      setTimeout(() => { refreshField(); hasGsap && ScrollTrigger.refresh(); }, 650);
    });
  });

  /* ---------- footer mark ---------- */
  const mark = $('.foot__mark');
  if (mark) mark.innerHTML = mark.textContent.split('').map(c => `<span>${c}</span>`).join('');

  /* ---------- services page: funnel stage lighting ---------- */
  const filt = $('.svc-filter');
  if (filt) {
    const stages = $$('.stage');
    $$('button', filt).forEach(b => b.addEventListener('click', () => {
      $$('button', filt).forEach(x => x.classList.toggle('is-on', x === b));
      const s = b.dataset.svc;
      stages.forEach(st => st.classList.toggle('is-lit', s === 'all' || st.dataset.svcs.split(' ').includes(s)));
    }));
  }

  /* ---------- results filter ---------- */
  const rf = $('.filters[data-for]');
  if (rf) {
    const items = $$(rf.dataset.for);
    $$('button', rf).forEach(b => b.addEventListener('click', () => {
      $$('button', rf).forEach(x => x.classList.toggle('is-on', x === b));
      const f = b.dataset.f;
      items.forEach(it => it.classList.toggle('is-hidden', f !== 'all' && !it.dataset.tags.includes(f)));
      refreshField(); hasGsap && ScrollTrigger.refresh();
    }));
  }

  /* ---------- about timeline ---------- */
  const tl = $('.timeline__fill');
  if (tl && hasGsap && !reduce) gsap.to(tl, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } });
  else if (tl) tl.style.transform = 'none';

  /* ---------- multi-step form ---------- */
  const form = $('form.form');
  if (form) {
    const steps = $$('.form__step', form), bars = $$('.form__prog i', form), label = $('[data-step-label]', form);
    const back = $('[data-back]', form), next = $('[data-next]', form);
    let s = 0;
    const show = () => {
      steps.forEach((el, k) => el.classList.toggle('is-on', k === s));
      bars.forEach((el, k) => el.classList.toggle('is-on', k <= s));
      if (label) label.textContent = `Step ${Math.min(s + 1, 3)} of 3`;
      back.style.visibility = s > 0 && s < steps.length - 1 ? 'visible' : 'hidden';
      next.style.display = s >= steps.length - 1 ? 'none' : '';
      $('span', next).textContent = s === steps.length - 2 ? 'Submit' : 'Next';
    };
    next.addEventListener('click', () => {
      const bad = $$('input, select, textarea', steps[s]).find(i => !i.checkValidity());
      if (bad) { bad.reportValidity(); return; }
      s = Math.min(steps.length - 1, s + 1); show();
    });
    back.addEventListener('click', () => { s = Math.max(0, s - 1); show(); });
    form.addEventListener('submit', e => e.preventDefault());
    show();
  }

  /* ---------- hero industry personalizer ---------- */
  const IND = {
    'home-inspectors': ['Home Inspectors', 'Win agent referrals and direct homebuyer leads at the same time, so your schedule never rides on a single relationship.'],
    'pest-control': ['Pest Control', 'Fill your routes with recurring contracts, not scattered one-off calls, and keep them through the slow months.'],
    'septic-services': ['Septic Services', 'Turn emergency backups and overdue pumping into steady, booked routes, and become the septic company your county calls first.'],
    'real-estate-agents': ['Real Estate', 'Build a personal brand and local pipeline you own, instead of renting leads from a portal that resells them.'],
    hvac: ['HVAC', 'Win the emergency call and the seasonal tune-up with campaigns built for high-intent, high-value customers.'],
    plumbers: ['Plumbers', 'Show up first when a pipe bursts. We help you capture urgent, ready-to-book local searches.'],
    electricians: ['Electricians', 'Attract steady residential and commercial work as the trusted local expert in your area.'],
    landscape: ['Lawn Care and Landscape', 'Fill your route and grow recurring contracts with campaigns tuned to your seasons and service area.'],
    roofers: ['Roofers', 'Land more high-ticket jobs by reaching homeowners exactly when they are ready to invest.'],
    'pressure-washers': ['Pressure Washers', 'Keep your schedule packed with residential and commercial cleaning jobs through targeted local marketing.'],
    contractors: ['Contractors', 'From remodels to new builds, we help you attract better projects and the clients who value quality work.'],
    pavers: ['Pavement & Striping', 'Win more paving, sealcoating, and striping contracts by reaching property managers, businesses, and municipalities.'],
    lawyers: ['Lawyers', 'Attract the right cases with marketing that builds authority and trust in a competitive legal market.'],
    doctors: ['Doctors', 'Grow your practice with patient-focused, compliant marketing built for local search and real credibility.'],
    'wedding-vendors': ['Wedding Vendors', 'Book more couples with marketing that showcases your work and keeps your calendar full season after season.'],
  };
  const persona = $('#persona');
  if (persona) {
    const out = $('.persona__out');
    const save = v => { try { localStorage.setItem('wp-industry', v); } catch (e) { /* storage blocked */ } };
    const apply = v => {
      const d = IND[v];
      persona.classList.toggle('is-set', !!d);
      out.innerHTML = d ? `${d[1]} <a href="https://wolfpackadvising.com/industries/${v}/">See the ${d[0]} playbook &rarr;</a>` : '';
      $$('a[href^="get-started.html"]').forEach(a => { a.href = d ? `get-started.html?industry=${encodeURIComponent(d[0])}` : 'get-started.html'; });
    };
    persona.addEventListener('change', () => { apply(persona.value); save(persona.value); });
    let saved = ''; try { saved = localStorage.getItem('wp-industry') || ''; } catch (e) { /* storage blocked */ }
    if (IND[saved]) { persona.value = saved; setTimeout(() => apply(saved), 0); }
  }
  const indSel = $('select[name="industry"]');
  const qInd = new URLSearchParams(location.search).get('industry');
  if (indSel && qInd) [...indSel.options].forEach(o => { if (o.text === qInd) indSel.value = o.text; });

  /* ---------- lead value calculator ---------- */
  const calc = $('.calc__card');
  if (calc) {
    const money = v => '$' + Math.round(v).toLocaleString('en-US');
    const L = $('#c-leads'), C = $('#c-close'), V = $('#c-value');
    const paint = () => {
      const l = +L.value, c = +C.value / 100, v = +V.value;
      $('[data-for="c-leads"]').textContent = l;
      $('[data-for="c-close"]').textContent = `${C.value}%`;
      $('[data-for="c-value"]').textContent = money(v);
      [L, C, V].forEach(i => i.style.setProperty('--fill', `${(i.value - i.min) / (i.max - i.min) * 100}%`));
      $('[data-calc="month"]').textContent = money(l * c * v);
      $('[data-calc="year"]').textContent = money(l * c * v * 12);
      $('[data-calc="lead"]').textContent = money(c * v);
      $('[data-calc="ten"]').textContent = money(10 * c * v * 12);
    };
    [L, C, V].forEach(i => i.addEventListener('input', paint));
    paint();
  }

  /* ---------- sticky mobile action bar ---------- */
  if (!$('.mbar')) {
    const bar = document.createElement('div');
    bar.className = 'mbar';
    bar.innerHTML = '<a href="tel:+18773559653">Call (877) 355-9653</a><a class="btn btn--primary btn--sm" href="get-started.html">Get Started</a>';
    document.body.appendChild(bar);
    const hideFor = $$('.cta, .foot, form.form');
    const io2 = new IntersectionObserver(es => {
      const any = es.some(e => e.isIntersecting) || hideFor.some(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
      bar.classList.toggle('is-hidden', any);
    });
    hideFor.forEach(el => io2.observe(el));
    const showAfter = () => bar.classList.toggle('is-in', scrollY > innerHeight * 0.6);
    addEventListener('scroll', showAfter, { passive: true }); showAfter();
  }

  /* ---------- section progress rail (homepage) ---------- */
  const railSecs = $$('main > section[aria-labelledby], main > div.proof');
  if (railSecs.length > 5 && fine) {
    const rail = document.createElement('nav');
    rail.className = 'rail'; rail.setAttribute('aria-label', 'Page sections');
    rail.innerHTML = railSecs.map((s, i) => {
      const h = s.querySelector('h2');
      const name = (h ? h.textContent : 'Section').replace(/\s+/g, ' ').trim().split(/[.:]/)[0].slice(0, 34);
      if (!s.id) s.id = `sec-${i}`;
      return `<a href="#${s.id}"><span>${name}</span></a>`;
    }).join('');
    document.body.appendChild(rail);
    const dots = $$('a', rail);
    dots.forEach(a => a.addEventListener('click', e => { e.preventDefault(); const el = $(a.getAttribute('href')); lenis ? lenis.scrollTo(el, { offset: -60 }) : el.scrollIntoView({ behavior: 'smooth' }); }));
    const mark = () => {
      let cur = -1;
      railSecs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.5) cur = i; });
      dots.forEach((d, i) => d.classList.toggle('is-on', i === cur));
      rail.classList.toggle('is-in', cur >= 0 && scrollY > innerHeight * 0.5);
    };
    addEventListener('scroll', mark, { passive: true });
    lenis && lenis.on('scroll', mark);
    mark();
  }

  /* ---------- concept notice ---------- */
  const note = document.createElement('div');
  note.className = 'concept';
  note.innerHTML = 'Concept redesign · not the official WolfPack site · <a href="https://wolfpackadvising.com/">Visit the real site</a>';
  document.body.appendChild(note);

  /* ---------- visibility watchdog ----------
     Entrance animations start content at opacity 0. If the browser throttles
     animation frames (background tab, power saving, embedded webviews) those
     tweens stall and the page looks blank, so force anything that has been on
     screen and still invisible for a second to its final state. Timers keep
     running when rAF doesn't. */
  const watched = () => $$('[data-reveal], .split .w > span, [data-hero-in], .nav, .sw');
  const seen = new WeakMap();
  const settled = new WeakSet();
  setInterval(() => {
    if (document.hidden) return;
    watched().forEach(el => {
      if (settled.has(el)) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || r.width === 0) return;
      const op = parseFloat(getComputedStyle(el).opacity);
      const hidden = op < 0.05 || (el.closest('.split') && /matrix\(1, 0, 0, 1, 0, [1-9]/.test(getComputedStyle(el).transform));
      if (!hidden || el.classList.contains('sw')) { seen.delete(el); if (op > 0.99) settled.add(el); return; }
      if (seen.get(el)) {
        if (hasGsap) gsap.killTweensOf(el);
        el.style.opacity = '1'; el.style.transform = 'none'; el.style.visibility = 'visible';
        settled.add(el);
      } else seen.set(el, true);
    });
    const ld = $('.loader');
    if (ld && performance.now() > 6000) ld.remove();
  }, 1000);

  /* keep field keyframes in sync with layout */
  if (hasGsap) ScrollTrigger.addEventListener('refresh', refreshField);
  addEventListener('load', () => { refreshField(); hasGsap && ScrollTrigger.refresh(); });
  document.fonts && document.fonts.ready.then(() => { refreshField(); hasGsap && ScrollTrigger.refresh(); });
})();
