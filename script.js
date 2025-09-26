/* ===========================================
 * Script principal do portfólio unificado
 * - Menu mobile (abrir/fechar/ESC/links)
 * - Barra de progresso do scroll (rAF + passive)
 * - Reveal com IntersectionObserver
 * - Cabeçalho dinâmico (scrolled)
 * - Ano no rodapé
 * - Rolagem suave para âncoras (com offset do header)
 * - Formulário (validação nativa + WhatsApp oficial)
 * - Galeria de vídeo (hover em pointer fine + toque, pausa offscreen)
 * - Respeita prefers-reduced-motion
 * =========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const on  = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const off = (el, ev, fn, opts) => el && el.removeEventListener(ev, fn, opts);

  const docEl  = document.documentElement;
  const body   = document.body;
  const header = $('header');

  // ===== Reduced motion =====
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced = () => prefersReduced.matches; // atualiza dinamicamente
  on(prefersReduced, 'change', () => { /* nada a fazer: callbacks já checam isReduced() */ });

  // ===== MENU MOBILE =====
  const burgerButtons = $$('.burger');
  const mobileMenu    = $('#mobileMenu');

  if (burgerButtons.length && mobileMenu) {
    const toggleMenu = (force) => {
      const next = force ?? !mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', next);
      mobileMenu.setAttribute('aria-hidden', next ? 'false' : 'true');
      body.classList.toggle('menu-is-open', next);
      burgerButtons.forEach(btn => {
        btn.setAttribute('aria-expanded', next ? 'true' : 'false');
        btn.classList.toggle('is-active', next);
      });
    };

    burgerButtons.forEach(btn => on(btn, 'click', () => toggleMenu()));
    // Fecha ao clicar em um link
    $$('#mobileMenu a').forEach(a => on(a, 'click', () => toggleMenu(false)));
    // ESC
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) toggleMenu(false);
    });
  }

  // ===== BARRA DE PROGRESSO =====
  const progressBar = $('#progress');
  if (progressBar) {
    let ticking = false;
    const updateProgress = () => {
      ticking = false;
      const scrollTop = docEl.scrollTop || body.scrollTop;
      const height    = docEl.scrollHeight - docEl.clientHeight;
      const pct = height > 0 ? scrollTop / height : 0;
      progressBar.style.width = (pct * 100).toFixed(2) + '%';
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateProgress);
    };
    updateProgress();
    // passive melhora a rolagem em todos os devices
    on(window, 'scroll', onScroll, { passive: true }); // MDN: addEventListener passive
    on(window, 'resize', onScroll, { passive: true });
  }

  // ===== REVEAL ELEMENTOS =====
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('visible');
          io.unobserve(ent.target);
        }
      });
    }, {
      // começa a revelar um pouco antes de entrar totalmente
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.15
    });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ===== CABEÇALHO DINÂMICO =====
  if (header) {
    const setScrolled = () => header.classList.toggle('scrolled', window.scrollY > 8);
    setScrolled();
    on(window, 'scroll', setScrolled, { passive: true });
  }

  // ===== ANO NO RODAPÉ =====
  const yearSpan = $('#year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ===== ROLAGEM SUAVE PARA ÂNCORAS =====
  // Dica: em CSS use também: html { scroll-behavior: smooth; } (suportado amplamente)
  const getHeaderOffset = () => {
    // tenta ler a var CSS --header-h; se falhar, usa altura real
    const varH = getComputedStyle(docEl).getPropertyValue('--header-h').trim();
    if (varH) {
      // pode vir em px/clamp(); getComputedStyle resolve para px
      const n = parseFloat(varH);
      if (!Number.isNaN(n)) return n;
    }
    return header ? header.getBoundingClientRect().height : 0;
  };

  const smoothTo = (hash) => {
    const id = hash.replace('#', '');
    const target = document.getElementById(id);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.pageYOffset - (getHeaderOffset() + 12);

    if (!isReduced() && 'scrollBehavior' in document.documentElement.style) {
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      window.scrollTo(0, top); // fallback sem animação
    }

    // acessibilidade: move foco ao destino
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  // delegação: só para âncoras internas
  on(document, 'click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href && href.length > 1) {
      e.preventDefault();
      smoothTo(href);
      history.pushState(null, '', href);
    }
  });

  // ===== FORMULÁRIO DE CONTATO (WhatsApp) =====
  const form = $('#contactForm');
  const successMessage = $('#success-message');

  if (form) {
    const inputs = {
      name:    $('#cf-name'),
      email:   $('#cf-email'),
      subject: $('#cf-subject'),
      message: $('#cf-message'),
    };

    // Usa validação nativa quando possível
    Object.values(inputs).forEach(inp => {
      if (!inp) return;
      on(inp, 'input', () => {
        inp.setCustomValidity('');
        const field = inp.closest('.field');
        field?.classList.remove('has-error');
        const err = field?.querySelector('.error-message');
        if (err) err.textContent = '';
      });
    });

    const showError = (inp, msg) => {
      const field = inp.closest('.field');
      field?.classList.add('has-error');
      const err = field?.querySelector('.error-message');
      if (err) err.textContent = msg;
      inp.setCustomValidity(msg);
      inp.reportValidity?.();
    };

    const validate = () => {
      let ok = true;
      if (!inputs.name.value.trim()) { showError(inputs.name, 'O campo nome é obrigatório.'); ok = false; }
      const emailVal = inputs.email.value.trim();
      if (!emailVal) { showError(inputs.email, 'O campo email é obrigatório.'); ok = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { showError(inputs.email, 'Por favor, insira um email válido.'); ok = false; }
      if (!inputs.subject.value.trim()) { showError(inputs.subject, 'O campo assunto é obrigatório.'); ok = false; }
      if (!inputs.message.value.trim()) { showError(inputs.message, 'O campo mensagem é obrigatório.'); ok = false; }
      return ok;
    };

    on(form, 'submit', (e) => {
      e.preventDefault();
      if (!validate()) return;

      const btn = form.querySelector('button[type="submit"]');
      const name = inputs.name.value.trim();
      const email = inputs.email.value.trim();
      const subject = inputs.subject.value.trim();
      const message = inputs.message.value.trim();

      const text = `Olá! Meu nome é ${name} (${email}).\n\n*Assunto:*\n${subject}\n\n*Mensagem:*\n${message}`;

      // Formato oficial wa.me/PHONE?text=... (PHONE em formato internacional, sem +/espaços)
      const phone = '5511945835660';
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

      btn.disabled = true; btn.dataset.prev = btn.textContent; btn.textContent = 'Enviando...';
      window.open(url, '_blank', 'noopener,noreferrer'); // docs oficiais WhatsApp

      setTimeout(() => {
        form.classList.add('hidden');
        successMessage?.classList.remove('hidden');
      }, 400);
    });
  }

  // ===== GALERIA DE VÍDEOS =====
  const videoItems = $$('.video-item .galeria-video');

  if (videoItems.length) {
    const pointerFine = window.matchMedia('(pointer: fine)').matches;

    // Pausa quando sai da viewport
    let vio;
    if ('IntersectionObserver' in window) {
      vio = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting && !target.paused) { target.pause(); target.currentTime = 0; }
        });
      }, { threshold: 0.1 });
    }

    videoItems.forEach((video) => {
      video.playsInline = true; // iOS
      video.muted = true;       // permite autoplay em hover

      const wrapper = video.closest('.video-item');
      if (pointerFine && wrapper) {
        on(wrapper, 'mouseenter', () => { if (!isReduced()) { video.currentTime = 0; video.play().catch(()=>{}); }});
        on(wrapper, 'mouseleave', () => { video.pause(); video.currentTime = 0; });
      }
      // toque alterna play/pause em touch
      on(video, 'click', () => { if (video.paused) video.play().catch(()=>{}); else video.pause(); });

      vio?.observe(video);
    });

    // Pausa tudo ao trocar de aba
    on(document, 'visibilitychange', () => {
      if (document.hidden) videoItems.forEach(v => { if (!v.paused) { v.pause(); } });
    });
  }
});

(() => {
  const wrap = document.getElementById('socialFab');
  if (!wrap) return;

  const phone = (wrap.dataset.phone || '').replace(/\D+/g, '') || '5511999999999';
  const message = encodeURIComponent(wrap.dataset.msg || 'Olá! Vim pelo seu site 👋');
  const igUser = (wrap.dataset.ig || 'instagram').replace(/^@/, '');

  const waLink = `https://wa.me/${phone}?text=${message}`;
  const igLink = `https://www.instagram.com/${igUser}/`;

  const btnWhats = document.getElementById('btnWhats');
  const btnInsta = document.getElementById('btnInsta');
  const toggle  = document.getElementById('fabToggle');
  const menu    = document.getElementById('fabMenu');

  if (btnWhats) btnWhats.href = waLink;
  if (btnInsta) btnInsta.href = igLink;

  let open = false;
  const setOpen = (v) => {
    open = v;
    menu.classList.toggle('open', v);
    toggle.setAttribute('aria-expanded', v);
  };

  toggle.addEventListener('click', () => setOpen(!open));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });
  document.addEventListener('click', (e) => { if (open && !wrap.contains(e.target)) setOpen(false); });

  // Otimização de toque
  ['touchstart','pointerdown'].forEach(evt => toggle.addEventListener(evt, () => {}, {passive:true}));
  ['touchstart','pointerdown'].forEach(evt => toggle.addEventListener(evt, () => {}, {passive:true}));
})();


