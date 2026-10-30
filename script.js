(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preloader = document.querySelector('#preloader');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('#progress');
  const mobileToggle = document.querySelector('#menuToggle');
  const mobileNav = document.querySelector('#mobileNav');
  const heroRobot = document.querySelector('#heroRobot');

  // Intro is non-blocking and disappears even if no assets/CDN are available.
  const finishIntro = () => preloader?.classList.add('is-done');
  if (reduceMotion) finishIntro();
  else window.setTimeout(finishIntro, 1080);

  let scrollQueued = false;
  const onScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      progress.style.width = `${Math.min(100, scrollY/max*100)}%`;
      header.classList.toggle('scrolled', scrollY > 40);
      scrollQueued = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  mobileToggle?.addEventListener('click', () => {
    const open = mobileToggle.getAttribute('aria-expanded') !== 'true';
    mobileToggle.setAttribute('aria-expanded', String(open));
    mobileToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileNav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileToggle.setAttribute('aria-expanded','false');
    mobileNav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }));

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));
  } else revealElements.forEach(el => el.classList.add('visible'));

  // Reveal the planet vertically when its section enters the viewport.
  const planet = document.querySelector('.manifesto-visual');
  if (planet) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const planetObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('planet-in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: .2, rootMargin: '0px 0px -35px 0px' });
      planetObserver.observe(planet);
    } else planet.classList.add('planet-in-view');
  }

  // Gentle pointer parallax, keeping the initial CSS entrance animation intact.
  if (!reduceMotion && matchMedia('(pointer:fine)').matches && heroRobot) {
    const hero = document.querySelector('.hero');
    let pointerX = 0, pointerY = 0, curX = 0, curY = 0;
    const img = heroRobot.querySelector('.hero-robot');
    let heroRaf = 0;
    // o loop só roda enquanto o robô está se mexendo; parado, não gasta processamento
    const tick = () => {
      curX += (pointerX-curX)*.045;
      curY += (pointerY-curY)*.045;
      if (img) img.style.transform = `translate3d(${curX*-9}px,${curY*-9}px,0) rotate(${curX*1.3}deg)`;
      heroRaf = (Math.abs(pointerX-curX) > .001 || Math.abs(pointerY-curY) > .001) ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => { if (!heroRaf) heroRaf = requestAnimationFrame(tick); };
    hero.addEventListener('pointermove', ev => {
      const bounds = hero.getBoundingClientRect();
      pointerX = ((ev.clientX - bounds.left)/bounds.width - .5)*2;
      pointerY = ((ev.clientY - bounds.top)/bounds.height - .5)*2;
      wake();
    }, {passive:true});
    hero.addEventListener('pointerleave', () => {pointerX = pointerY = 0; wake();});
  }

  const themes = [
    {title:'O MUNDO ESTÁ MUDANDO.<br>E VOCÊ?', text:'Entenda como as transformações tecnológicas estão redesenhando a sociedade, a educação e o mercado de trabalho — e por que isso importa para o seu futuro.'},
    {title:'A IA NÃO É MAIS<br>FICÇÃO.', text:'Explore aplicações reais da inteligência artificial, seus impactos nas atividades profissionais e as novas competências que surgem com ela.'},
    {title:'NÃO EXISTE MAIS<br>UMA CARREIRA SÓ.',text:'Descubra áreas profissionais emergentes, habilidades em alta e caminhos de formação para construir sua própria trajetória.'},
    {title:'TRANSFORME<br>HABILIDADE EM<br>OPORTUNIDADE.',text:'Converse sobre qualificação, empregabilidade, oportunidades profissionais e formas de participar da economia digital.'},
    {title:'SUA IDEIA PODE<br>VIRAR NEGÓCIO.',text:'Veja como recursos digitais, criatividade e atitude empreendedora podem se tornar soluções, produtos e novas fontes de renda.'},
    {title:'INOVAR É<br>QUESTIONAR O ÓBVIO.',text:'Conheça iniciativas, startups e novos modelos de negócio que mostram outras maneiras de resolver problemas e gerar valor.'},
    {title:'NÃO ESPERE O<br>FUTURO. CRIE-O.',text:'Conecte tudo o que descobriu e encontre inspiração para assumir o protagonismo da sua formação, das suas escolhas e do seu próximo passo.'}
  ];
  const tabs = Array.from(document.querySelectorAll('.topic-nav [role="tab"]'));
  const panel = document.querySelector('#topicPanel');
  const topicTitle = document.querySelector('#topicTitle');
  const topicDescription = document.querySelector('#topicDescription');
  const topicNav = document.querySelector('.topic-nav');
  let currentTopic = 0;
  let pinMode = false, pinSync = false, scrollToTopic = () => {};
  function setTopic(index, focus=false) {
    if (!Number.isInteger(index) || index < 0 || index >= themes.length) return;
    // no modo fixado, trocar de assunto = rolar a página até a posição daquele assunto
    if (pinMode && !pinSync) { scrollToTopic(index); if (focus) tabs[index].focus({ preventScroll: true }); return; }
    // direção da troca para a animação de deslizar (próximo entra pela direita)
    panel.style.setProperty('--topic-dx', index >= currentTopic ? '42px' : '-42px');
    panel.classList.remove('topic-slide'); void panel.offsetWidth; panel.classList.add('topic-slide');
    currentTopic = index;
    // na faixa horizontal (mobile), centraliza o tópico ativo
    if (topicNav && topicNav.scrollWidth > topicNav.clientWidth + 4) {
      const t = tabs[index];
      topicNav.scrollTo({ left: t.offsetLeft - (topicNav.clientWidth - t.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    const counter = panel.querySelector('.topic-counter');
    if (counter) counter.textContent = `${String(index+1).padStart(2,'0')} / ${String(themes.length).padStart(2,'0')}`;
    panel.querySelectorAll('.topic-dots i').forEach((d,i) => d.classList.toggle('on', i===index));
    tabs.forEach((t,i) => {t.setAttribute('aria-selected', String(i===index));t.tabIndex=i===index?0:-1;});
    panel.classList.add('is-changing');
    topicTitle.innerHTML = themes[index].title;
    topicDescription.textContent = themes[index].text;
    panel.querySelector('.display-meta').textContent = `[ SELECTED MODULE / ${String(index+1).padStart(2,'0')} ]`;
    panel.setAttribute('aria-labelledby',`topic-tab-${index}`);
    window.setTimeout(() => panel.classList.remove('is-changing'),380);
    if (focus) tabs[index].focus();
  }
  // Deslizar na horizontal (dedo, mouse ou trackpad) troca de assunto.
  if (panel) {
    let sx = 0, sy = 0, tracking = false;
    panel.addEventListener('pointerdown', e => { tracking = true; sx = e.clientX; sy = e.clientY; }, { passive: true });
    panel.addEventListener('pointerup', e => {
      if (!tracking) return; tracking = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        setTopic(dx < 0 ? Math.min(themes.length-1, currentTopic+1) : Math.max(0, currentTopic-1));
      }
    });
    panel.addEventListener('pointercancel', () => { tracking = false; });
    let wheelLock = 0;
    panel.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) < 25 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = Date.now(); if (now - wheelLock < 550) return; wheelLock = now;
      setTopic(e.deltaX > 0 ? Math.min(themes.length-1, currentTopic+1) : Math.max(0, currentTopic-1));
    }, { passive: false });
    panel.querySelectorAll('.topic-arrow').forEach(btn => btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir);
      setTopic(Math.min(themes.length-1, Math.max(0, currentTopic + dir)));
    }));
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener('click', () => setTopic(i));
    tab.addEventListener('keydown', ev => {
      let next = i;
      if (ev.key==='ArrowDown'||ev.key==='ArrowRight') next=(i+1)%tabs.length;
      else if (ev.key==='ArrowUp'||ev.key==='ArrowLeft') next=(i-1+tabs.length)%tabs.length;
      else if (ev.key==='Home') next=0;
      else if (ev.key==='End') next=tabs.length-1;
      else return;
      ev.preventDefault(); setTopic(next,true);
    });
  });

  // Programação: a seção fica parada na tela e os assuntos correm na horizontal conforme a rolagem.
  const progLayout = document.querySelector('.program-layout');
  if (progLayout && panel && !reduceMotion) {
    const n = themes.length;
    const track = document.createElement('div'); track.className = 'program-track';
    const sticky = document.createElement('div'); sticky.className = 'program-sticky';
    progLayout.parentNode.insertBefore(track, progLayout);
    // o título da seção vai junto, para continuar visível enquanto os assuntos passam
    const progTop = document.querySelector('.program-top');
    if (progTop) { progTop.classList.add('visible'); sticky.appendChild(progTop); }
    sticky.appendChild(progLayout); track.appendChild(sticky);
    track.style.setProperty('--n', n);
    progLayout.classList.add('visible');

    // faixa de slides dentro do painel escuro
    const symbolSvg = panel.querySelector('.topic-symbol')?.innerHTML || '';
    const strip = document.createElement('div'); strip.className = 'topic-track';
    themes.forEach((t, i) => {
      const sl = document.createElement('article');
      sl.className = 'topic-slide';
      sl.setAttribute('aria-hidden', i ? 'true' : 'false');
      sl.innerHTML = `<span class="display-meta">[ SELECTED MODULE / ${String(i + 1).padStart(2, '0')} ]</span>` +
        `<span class="topic-symbol" aria-hidden="true">${symbolSvg}</span><h3>${t.title}</h3><p>${t.text}</p>`;
      strip.appendChild(sl);
    });
    const footer = panel.querySelector('.topic-footer');
    const viewport = document.createElement('div'); viewport.className = 'topic-viewport';
    viewport.appendChild(strip);
    panel.insertBefore(viewport, footer);
    panel.classList.add('has-track');
    const slides = Array.from(strip.children);
    pinMode = true;

    // o bloco fixado tem só a altura do conteúdo (sem sobra de espaço antes/depois da seção)
    const stickTop = () => (innerWidth <= 850 ? 74 : 84);
    const sizeTrack = () => {
      sticky.style.top = stickTop() + 'px';
      track.style.height = (sticky.offsetHeight + (n - 1) * innerHeight * (innerWidth <= 850 ? 0.5 : 0.55)) + 'px';
    };
    sizeTrack();
    addEventListener('resize', sizeTrack);
    const range = () => {
      const top = track.getBoundingClientRect().top + scrollY - stickTop();
      return { top, len: Math.max(1, track.offsetHeight - sticky.offsetHeight) };
    };
    scrollToTopic = i => {
      const r = range();
      scrollTo({ top: r.top + (i / (n - 1)) * r.len + 2, behavior: 'smooth' });
    };
    let active = 0, pinQueued = false;
    const updatePin = () => {
      pinQueued = false;
      const r = range();
      const p = Math.min(1, Math.max(0, (scrollY - r.top) / r.len));
      // cada assunto fica parado ~30% do trecho dele; no resto ele desliza para o próximo
      const raw = p * (n - 1);
      const seg = Math.min(n - 2, Math.floor(raw));
      const f = raw - seg;
      const HOLD = 0.3;
      const t = Math.min(1, Math.max(0, (f - HOLD / 2) / (1 - HOLD)));
      const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const pos = seg + eased;
      strip.style.transform = `translate3d(${-pos * 100}%,0,0)`;
      slides.forEach((sl, i) => {
        const d = Math.min(1, Math.abs(i - pos));
        sl.style.opacity = (1 - d * 0.75).toFixed(3);
      });
      const now = Math.round(pos);
      if (now !== active) {
        active = now;
        slides.forEach((sl, i) => sl.setAttribute('aria-hidden', i === now ? 'false' : 'true'));
        pinSync = true; setTopic(now); pinSync = false;
      }
      const bar = panel.querySelector('.topic-progress i');
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const queuePin = () => { if (!pinQueued) { pinQueued = true; requestAnimationFrame(updatePin); } };
    addEventListener('scroll', queuePin, { passive: true });
    addEventListener('resize', queuePin);
    const swipe = panel.querySelector('.topic-swipe');
    if (swipe) swipe.textContent = 'ROLE A PÁGINA PARA AVANÇAR ↓';
    const prog = document.createElement('span'); prog.className = 'topic-progress'; prog.innerHTML = '<i></i>';
    panel.appendChild(prog);
    updatePin();
  }

  // Scrollytelling: manifesto words light up one by one as the page scrolls.
  const scrollyTitle = document.querySelector('.manifesto-heading h2');
  if (scrollyTitle && !reduceMotion) {
    const walker = document.createTreeWalker(scrollyTitle, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const span = document.createElement('span');
        span.className = 'scrolly-word';
        span.textContent = part;
        frag.appendChild(span);
      });
      node.replaceWith(frag);
    });
    const words = Array.from(scrollyTitle.querySelectorAll('.scrolly-word'));
    scrollyTitle.classList.add('is-scrolly');
    let scrollyQueued = false;
    const updateScrolly = () => {
      const r = scrollyTitle.getBoundingClientRect();
      const start = innerHeight * .85;   // começa a acender quando o título entra
      const end = innerHeight * .38;     // termina quando o fim do título passa do meio da tela
      const total = (start - end) + r.height;
      const progress = Math.min(1, Math.max(0, (start - r.top) / total));
      const lit = progress * words.length;
      words.forEach((w, i) => {
        const v = Math.min(1, Math.max(0, lit - i));
        w.style.opacity = (.14 + v * .86).toFixed(3);
        w.classList.toggle('is-lit', v >= 1);
      });
      scrollyQueued = false;
    };
    const queueScrolly = () => {
      if (scrollyQueued) return;
      scrollyQueued = true;
      requestAnimationFrame(updateScrolly);
    };
    addEventListener('scroll', queueScrolly, { passive: true });
    addEventListener('resize', queueScrolly);
    updateScrolly();
  }

  // Scrollytelling: planet rises from below, tied to scroll position.
  const planetSection = document.querySelector('.manifesto-visual-full');
  const planetImg = planetSection?.querySelector('.planet-reveal-frame img');
  if (planetSection && planetImg && !reduceMotion) {
    planetSection.classList.add('is-scrolly-planet');
    let planetQueued = false;
    const updatePlanet = () => {
      const r = planetSection.getBoundingClientRect();
      // 0 quando o topo do planeta entra por baixo da tela; 1 quando chega a ~20% do topo
      const raw = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .8)));
      const e = 1 - Math.pow(1 - raw, 3); // easeOutCubic
      planetImg.style.transform = `translate3d(0, ${((1 - e) * 62).toFixed(2)}%, 0) scale(${(.9 + e * .1).toFixed(4)})`;
      planetImg.style.opacity = (.1 + e * .9).toFixed(3);
      planetQueued = false;
    };
    const queuePlanet = () => {
      if (planetQueued) return;
      planetQueued = true;
      requestAnimationFrame(updatePlanet);
    };
    addEventListener('scroll', queuePlanet, { passive: true });
    addEventListener('resize', queuePlanet);
    updatePlanet();
  }

  // Tags da comunidade: destaque verde passeia de uma tag para outra enquanto a seção está na tela.
  const tagWrap = document.querySelector('.community-tags');
  if (tagWrap) {
    const tags = Array.from(tagWrap.children);
    let ti = -1, timer = 0;
    const nextTag = () => {
      tags.forEach(t => t.classList.remove('is-active'));
      ti = (ti + 1) % tags.length;
      tags[ti].classList.add('is-active');
    };
    if (reduceMotion) tagWrap.closest('.community-right')?.classList.add('visible');
    else new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setTimeout(() => tagWrap.classList.add('is-floating'), 1100);
        if (!timer) { nextTag(); timer = setInterval(nextTag, 1700); }
      } else if (timer) { clearInterval(timer); timer = 0; }
    }, { threshold: .3 }).observe(tagWrap);
    tags.forEach((t, i) => t.addEventListener('pointerenter', () => { ti = i - 1; nextTag(); }));
  }

  // Mãos: com a rolagem, a mão humana e a robótica se aproximam até se tocarem — e sai uma faísca.
  const humanSec = document.querySelector('.human-section');
  const handsBox = humanSec?.querySelector('.human-image');
  const handsImg = handsBox?.querySelector('img');
  if (humanSec && handsBox && handsImg && !reduceMotion) {
    const TIP_X = 0.536, TIP_Y = 0.427;   // ponto onde os dedos se encontram na imagem
    const split = document.createElement('div');
    split.className = 'hands-split';
    split.setAttribute('aria-hidden', 'true');
    split.innerHTML = `<div class="hand hand-l"><img alt="" src="${handsImg.currentSrc || handsImg.src}"></div>` +
      `<div class="hand hand-r"><img alt="" src="${handsImg.currentSrc || handsImg.src}"></div>` +
      '<span class="hands-spark"><i></i><i></i><i></i></span>';
    handsBox.appendChild(split);
    handsBox.classList.add('is-split');
    const hl = split.querySelector('.hand-l'), hr = split.querySelector('.hand-r');
    const place = () => {
      const bw = handsBox.clientWidth, bh = handsImg.clientHeight || handsBox.clientHeight;
      const nw = handsImg.naturalWidth || 1800, nh = handsImg.naturalHeight || 445;
      const sc = Math.max(bw / nw, bh / nh);
      const rw = nw * sc, rh = nh * sc;
      const tx = (bw - rw) / 2 + TIP_X * rw, ty = (bh - rh) / 2 + TIP_Y * rh;
      split.style.setProperty('--tip-x', tx + 'px');
      split.style.setProperty('--tip-y', ty + 'px');
      split.style.height = bh + 'px';
    };
    let touched = false, hq = false;
    const update = () => {
      hq = false;
      const r = humanSec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.6 + r.height * 0.2)));
      const e = 1 - Math.pow(1 - p, 3);
      const gap = (1 - e) * Math.min(260, handsBox.clientWidth * 0.2);
      hl.style.transform = `translate3d(${-gap}px,${(1 - e) * 10}px,0)`;
      hr.style.transform = `translate3d(${gap}px,${(1 - e) * -10}px,0)`;
      const now = p > 0.96;
      if (now !== touched) { touched = now; humanSec.classList.toggle('is-touch', now); }
    };
    const queue = () => { if (!hq) { hq = true; requestAnimationFrame(update); } };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', () => { place(); queue(); });
    if (handsImg.complete) place(); else handsImg.addEventListener('load', place);
    place(); update();
  }

  // Letras em partículas: o título fica normal; só onde o mouse/dedo passa as letras se desfazem em partículas.
  const particleTitle = document.querySelector('.final-cta h2');
  if (particleTitle && !reduceMotion && document.createElement('canvas').getContext) {
    const PAD = 70;
    const cv = document.createElement('canvas');
    cv.className = 'particle-canvas';
    cv.setAttribute('aria-hidden', 'true');
    particleTitle.appendChild(cv);
    const ctx = cv.getContext('2d');
    let parts = [], W = 0, H = 0, dpr = 1, gap = 4, running = false, built = false, solid = null, swapped = false;
    const ptr = { x: -9999, y: -9999, active: false };

    const build = () => {
      particleTitle.classList.remove('is-particles'); swapped = false;
      const hr = particleTitle.getBoundingClientRect();
      if (!hr.width) return;
      W = Math.ceil(hr.width + PAD * 2); H = Math.ceil(hr.height + PAD * 2);
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      // cópia exata do título (letra por letra, na posição real) numa tela escondida
      solid = document.createElement('canvas'); solid.width = W * dpr; solid.height = H * dpr;
      const o = solid.getContext('2d', { willReadFrequently: true });
      o.scale(dpr, dpr);
      const walker = document.createTreeWalker(particleTitle, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      while (walker.nextNode()) {
        const node = walker.currentNode, cs = getComputedStyle(node.parentElement);
        o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        o.fillStyle = cs.color; o.textBaseline = 'middle';
        for (let i = 0; i < node.textContent.length; i++) {
          const ch = node.textContent[i];
          if (!ch.trim()) continue;
          range.setStart(node, i); range.setEnd(node, i + 1);
          const r = range.getBoundingClientRect();
          if (!r.width) continue;
          o.fillText(ch, r.left - hr.left + PAD, r.top - hr.top + r.height / 2 + PAD);
        }
      }
      const data = o.getImageData(0, 0, solid.width, solid.height).data;
      gap = W < 700 ? 3 : 4;
      parts = [];
      // cada célula com QUALQUER pixel de letra (inclusive bordas suavizadas) vira partícula,
      // assim nada da letra fica para trás quando as partículas se espalham
      const SW = solid.width, SH = solid.height;
      for (let y = 0; y < H; y += gap) for (let x = 0; x < W; x += gap) {
        const x0 = Math.floor(x * dpr), y0 = Math.floor(y * dpr);
        const x1 = Math.min(SW, Math.ceil((x + gap) * dpr)), y1 = Math.min(SH, Math.ceil((y + gap) * dpr));
        let best = 0, bk = -1;
        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
          const k = (yy * SW + xx) * 4;
          if (data[k + 3] > best) { best = data[k + 3]; bk = k; }
        }
        if (best < 8) continue;
        parts.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, c: `rgb(${data[bk]},${data[bk + 1]},${data[bk + 2]})`, a: best / 255, d: false });
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(solid, 0, 0, W, H);           // letras normais
      for (const p of parts) if (p.d) ctx.clearRect(p.hx - 0.5, p.hy - 0.5, gap + 1, gap + 1);   // buraco onde a partícula saiu
      let last = '';
      for (const p of parts) {
        if (!p.d) continue;
        if (p.c !== last) { ctx.fillStyle = p.c; last = p.c; }
        ctx.globalAlpha = p.a > .5 ? 1 : p.a * 1.6;
        ctx.fillRect(p.x, p.y, gap - 0.8, gap - 0.8);
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      const R = W < 700 ? 60 : 90, R2 = R * R;
      let moving = false;
      for (const p of parts) {
        if (ptr.active) {
          const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 6;
            p.vx += (dx / d) * f + (Math.random() - .5) * 1.4;
            p.vy += (dy / d) * f + (Math.random() - .5) * 1.4;
            p.d = true;
          }
        }
        if (!p.d) continue;
        p.vx += (p.hx - p.x) * 0.05; p.vy += (p.hy - p.y) * 0.05;
        p.vx *= 0.84; p.vy *= 0.84;
        p.x += p.vx; p.y += p.vy;
        if (Math.abs(p.vx) < 0.04 && Math.abs(p.vy) < 0.04 && Math.abs(p.hx - p.x) < 0.4 && Math.abs(p.hy - p.y) < 0.4) {
          p.x = p.hx; p.y = p.hy; p.vx = p.vy = 0; p.d = false;   // voltou para casa: vira letra normal de novo
        } else moving = true;
      }
      if (moving || ptr.active) {
        if (!swapped) { particleTitle.classList.add('is-particles'); swapped = true; }
        draw();
        requestAnimationFrame(step);
      } else {
        running = false;
        particleTitle.classList.remove('is-particles'); swapped = false;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      }
    };
    const kick = () => { if (!running && built) { running = true; requestAnimationFrame(step); } };

    let fontsReady = false;
    (document.fonts?.ready || Promise.resolve()).then(() => { fontsReady = true; });
    const setPtr = (cx, cy) => {
      // as partículas só são calculadas na primeira vez que alguém passa o mouse/dedo (página carrega mais leve)
      if (!built) { if (!fontsReady) return; build(); built = true; }
      const r = cv.getBoundingClientRect();
      ptr.x = cx - r.left; ptr.y = cy - r.top;
      ptr.active = ptr.x > PAD - 30 && ptr.y > PAD - 30 && ptr.x < W - PAD + 30 && ptr.y < H - PAD + 30;
      if (ptr.active) kick();
    };
    const finalSection = particleTitle.closest('section') || particleTitle;
    finalSection.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') setPtr(e.clientX, e.clientY); });
    finalSection.addEventListener('pointerleave', () => { ptr.active = false; });
    finalSection.addEventListener('touchstart', e => setPtr(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    finalSection.addEventListener('touchmove', e => setPtr(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    finalSection.addEventListener('touchend', () => { ptr.active = false; }, { passive: true });

    let rz;
    addEventListener('resize', () => { if (!built) return; clearTimeout(rz); rz = setTimeout(build, 200); });
  }
})();
