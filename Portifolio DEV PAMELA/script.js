/*
 * Script principal do portfólio unificado
 *
 * Este arquivo lida com as interações do usuário, incluindo:
 *  - Exibir/ocultar o menu mobile ao clicar no botão burguer;
 *  - Atualizar a barra de progresso com base no scroll da página;
 *  - Revelar elementos com a classe `.reveal` conforme entram na viewport;
 *  - Alterar o estilo do cabeçalho quando o usuário rola a página;
 *  - Inserir o ano atual no rodapé;
 *  - Processar o envio do formulário de contato (apenas demonstração).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Controle do menu mobile
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    // Fechar o menu quando um link for clicado
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Atualização da barra de progresso com base no scroll
  const progressBar = document.getElementById('progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const scrolled = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${scrolled}%`;
    }, { passive: true });
  }

  // Revelar elementos com IntersectionObserver
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Cabeçalho dinâmico: altera aparência quando a página é rolada
  const header = document.querySelector('header');
  const toggleHeaderBg = () => {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  if (header) {
    toggleHeaderBg();
    window.addEventListener('scroll', toggleHeaderBg, { passive: true });
  }

  // Atualiza o ano no rodapé
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Manipulação de envio do formulário de contato (demonstração)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();
      if (!name || !email || !subject || !message) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      // Exibe mensagem de sucesso (demonstração)
      alert('Mensagem enviada! (Demonstração)');
      contactForm.reset();
    });
  }

// Removido: HTML do formulário e script duplicado. 
// Certifique-se de que o formulário e os campos existam no HTML, não no JS.

document.addEventListener('DOMContentLoaded', () => {
  const header      = document.querySelector('header');
  const burger      = document.getElementById('burger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const progressBar = document.getElementById('progress');

  // Abre/fecha o menu mobile
  const openMenu  = () => {
    mobileMenu.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('no-scroll');
  };
  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('no-scroll');
  };

  burger?.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });
  // Fecha menu ao clicar em um link
  mobileMenu?.querySelectorAll('.mobile-nav a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });
  // Fecha ao apertar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });

  // Aplica estilo ao cabeçalho ao rolar
  const onScrollHeader = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    header?.classList.toggle('scrolled', y > 8);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  // Barra de progresso de leitura
  const onScrollProgress = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? scrollTop / height : 0;
    progressBar.style.width = (pct * 100).toFixed(2) + '%';
  };
  onScrollProgress();
  window.addEventListener('scroll', onScrollProgress, { passive: true });

  // Revela seções com animação conforme entram na viewport
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('visible');
          io.unobserve(ent.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // Suaviza a rolagem para âncoras, compensando a altura do cabeçalho
  const smoothTo = (hash) => {
    const target = document.getElementById(hash.replace('#',''));
    if (!target) return;
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const top = target.getBoundingClientRect().top + window.pageYOffset - (headerHeight + 12);
    window.scrollTo({ top, behavior: 'smooth' });
  };
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.length > 1) {
        e.preventDefault();
        smoothTo(href);
        history.pushState(null, '', href);
      }
    });
  });

  // Envia formulário de contato para WhatsApp
  const cf = document.getElementById('contactForm');
  cf?.addEventListener('submit', (e) => {
    e.preventDefault();
    const n    = document.getElementById('cf-name').value.trim();
    const mail = document.getElementById('cf-email').value.trim();
    const subj = document.getElementById('cf-subject').value.trim();
    const msg  = document.getElementById('cf-message').value.trim();
    if (!n || !mail || !subj || !msg) {
      alert('Preencha todos os campos.');
      return;
    }
    const text  = `Nome: ${n}\nEmail: ${mail}\nAssunto: ${subj}\nMensagem: ${msg}`;
    const query = new URLSearchParams({ text }).toString();
    window.open(`https://wa.me/5511945835660?${query}`, '_blank', 'noopener,noreferrer');
  });
});

});