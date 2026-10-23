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
    hero.addEventListener('pointermove', ev => {
      const bounds = hero.getBoundingClientRect();
      pointerX = ((ev.clientX - bounds.left)/bounds.width - .5)*2;
      pointerY = ((ev.clientY - bounds.top)/bounds.height - .5)*2;
    }, {passive:true});
    hero.addEventListener('pointerleave', () => {pointerX = pointerY = 0;});
    const tick = () => {
      curX += (pointerX-curX)*.045;
      curY += (pointerY-curY)*.045;
      // Inner picture moves; wrapping element keeps its entrance animation.
      const img = heroRobot.querySelector('.hero-robot');
      if (img) img.style.transform = `translate3d(${curX*-9}px,${curY*-9}px,0) rotate(${curX*1.3}deg)`;
      requestAnimationFrame(tick);
    };
    tick();
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
  function setTopic(index, focus=false) {
    if (!Number.isInteger(index) || index < 0 || index >= themes.length) return;
    tabs.forEach((t,i) => {t.setAttribute('aria-selected', String(i===index));t.tabIndex=i===index?0:-1;});
    panel.classList.add('is-changing');
    topicTitle.innerHTML = themes[index].title;
    topicDescription.textContent = themes[index].text;
    panel.querySelector('.display-meta').textContent = `[ SELECTED MODULE / ${String(index+1).padStart(2,'0')} ]`;
    panel.setAttribute('aria-labelledby',`topic-tab-${index}`);
    window.setTimeout(() => panel.classList.remove('is-changing'),380);
    if (focus) tabs[index].focus();
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
})();
