/* ==========================================================================
   JM SOLUÇÕES — INTERACTIVE APP LOGIC & DELUCKS EFFECTS
   ========================================================================== */

// WhatsApp que recebe os diagnósticos (DDI + DDD + número, só dígitos)
const WHATSAPP_NUMBER = '5512988978125';

// Greeting that tells João which page (and service) the visitor came from.
// Each page sets <body data-origin="pela página de ..." data-service="...">.
function whatsappGreeting() {
  const origin = document.body.dataset.origin || 'pela página inicial';
  const service = document.body.dataset.service;
  let interest = ', e gostaria de saber mais sobre os seus serviços.';
  if (service) {
    // on a service's own page the origin already names it
    interest = 'servicePage' in document.body.dataset
      ? ', e tenho interesse nesse serviço.'
      : `, e tenho interesse em ${service}.`;
  }
  return `Olá, João! Vim pelo site, ${origin}${interest}`;
}

// Below-the-fold sections use content-visibility (skipped until needed) to speed up the
// first render. Before any jump to an anchor, render them for real so the jump is exact.
const renderAllSections = () => document.documentElement.classList.add('cv-off');
if (location.hash) renderAllSections();
window.addEventListener('load', () => {
  if (!location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) target.scrollIntoView();
});
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href*="#"]');
  if (link && link.pathname === location.pathname && link.hash) renderAllSections();
}, true);

document.addEventListener('DOMContentLoaded', () => {

  // 1. Delucks Card Spotlight Cursor Tracking
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.glass-card').forEach(card => {
      let rect = null;
      card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); });
      card.addEventListener('mouseleave', () => { rect = null; });
      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    });
  }

  // 2. Navbar Glass Blur Scroll Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // 3. Mobile Drawer Controls
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileDrawer && mobileDrawerClose) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    mobileDrawerClose.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // 3.1 Services Dropdown (click/keyboard; hover is handled in CSS)
  const navDropdown = document.querySelector('.nav-dropdown');
  if (navDropdown) {
    const dropdownToggle = navDropdown.querySelector('.nav-dropdown-toggle');
    dropdownToggle.addEventListener('click', () => {
      const isOpen = navDropdown.classList.toggle('open');
      dropdownToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', (e) => {
      if (!navDropdown.contains(e.target)) {
        navDropdown.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 4. Interactive FAQ Accordions
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      faqItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-header').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 5. Diagnosis Modal Controls
  const modal = document.getElementById('contactModal');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');
  const modalClose = document.getElementById('modalClose');

  const openModal = (service) => {
    resetDiagnosis();
    // Service context: the button's own service, or the service page the visitor is on
    const serviceField = document.getElementById('diagService');
    if (serviceField) serviceField.value = service || document.body.dataset.service || '';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    const firstField = modal.querySelector('.diag-step.active .form-control');
    if (firstField) setTimeout(() => firstField.focus(), 150);
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.dataset.service);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // 5.1 Multi-step diagnosis form → WhatsApp
  const diagForm = document.getElementById('leadForm');
  const diagSteps = diagForm ? Array.from(diagForm.querySelectorAll('.diag-step')) : [];
  const diagBack = document.getElementById('diagBack');
  const diagNext = document.getElementById('diagNext');
  const diagSubmit = document.getElementById('diagSubmit');
  const diagProgress = document.getElementById('diagProgress');
  const diagStepLabel = document.getElementById('diagStepLabel');
  const diagSuccess = document.getElementById('diagSuccess');
  let diagCurrent = 0;

  function showDiagStep(index) {
    diagCurrent = index;
    diagSteps.forEach((step, i) => step.classList.toggle('active', i === index));
    diagBack.hidden = index === 0;
    diagNext.hidden = index === diagSteps.length - 1;
    diagSubmit.hidden = index !== diagSteps.length - 1;
    diagProgress.style.width = `${((index + 1) / diagSteps.length) * 100}%`;
    diagStepLabel.textContent = `Etapa ${index + 1} de ${diagSteps.length}`;
  }

  function validateDiagStep() {
    const step = diagSteps[diagCurrent];
    const fields = Array.from(step.querySelectorAll('input:not([type=hidden]), select, textarea'));
    fields.forEach(f => f.classList.add('touched'));
    // checkbox groups that need at least one option ticked
    step.querySelectorAll('[data-require-one]').forEach(group => {
      const boxes = Array.from(group.querySelectorAll('input[type=checkbox]'));
      boxes[0].setCustomValidity(boxes.some(b => b.checked) ? '' : group.dataset.requireMsg);
    });
    const invalid = fields.find(f => !f.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      return false;
    }
    return true;
  }

  function resetDiagnosis() {
    if (!diagForm) return;
    diagForm.reset();
    diagForm.hidden = false;
    diagForm.querySelectorAll('.touched').forEach(f => f.classList.remove('touched'));
    diagSuccess.classList.remove('show');
    document.querySelector('.diag-head').hidden = false;
    showDiagStep(0);
  }

  if (diagForm) {
    diagNext.addEventListener('click', () => {
      if (validateDiagStep()) showDiagStep(diagCurrent + 1);
    });

    diagBack.addEventListener('click', () => showDiagStep(diagCurrent - 1));

    // clear the "tick at least one" error as soon as any box changes
    diagForm.querySelectorAll('[data-require-one] input').forEach(box => {
      box.addEventListener('change', () => box.closest('[data-require-one]').querySelector('input').setCustomValidity(''));
    });

    // Enter on an intermediate step advances instead of submitting
    diagForm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && diagCurrent < diagSteps.length - 1) {
        e.preventDefault();
        diagNext.click();
      }
    });

    diagForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateDiagStep()) return;

      const data = new FormData(diagForm);
      const lines = [
        `Olá, João! Vim pelo site, ${document.body.dataset.origin || 'pela página inicial'}, e quero solicitar um diagnóstico.`,
        '',
        `*Empresa:* ${data.get('empresa')}`,
        `*Segmento:* ${data.get('segmento')}`,
        `*Cidade/UF:* ${data.get('cidade')}`,
        `*Como os clientes chegam hoje:* ${data.getAll('canais').join(', ')}`,
        `*O que mais incomoda:* ${data.get('desafio')}`,
        `*Site:* ${data.get('site') || 'Não tenho site'}`,
        `*Investimento previsto:* ${data.get('investimento')}`,
        `*Já investe em SEO:* ${data.get('investe_seo')}`
      ];
      if (data.get('servico')) lines.splice(7, 0, `*Serviço que viu no site:* ${data.get('servico')}`);
      if (data.get('contexto')) lines.push(`*Contexto:* ${data.get('contexto')}`);
      lines.push('', `*Nome:* ${data.get('nome')}`, `*WhatsApp:* ${data.get('whatsapp')}`);
      if (data.get('email')) lines.push(`*E-mail:* ${data.get('email')}`);

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener');

      diagForm.hidden = true;
      document.querySelector('.diag-head').hidden = true;
      document.getElementById('diagWhatsLink').href = url;
      diagSuccess.classList.add('show');
    });

    showDiagStep(0);
  }

  // 5.3 Category filter chips (Guias listing and Resultados cases).
  // Each chip group filters the [data-cat] cards inside its own section.
  document.querySelectorAll('.guide-chips').forEach(group => {
    const section = group.closest('section');
    const chips = group.querySelectorAll('.guide-chip');
    const cards = section.querySelectorAll('.guides-grid [data-cat], .cases-grid.filterable [data-cat]');
    const emptyMsg = section.querySelector('.guides-empty');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.toggle('active', c === chip));
        const filter = chip.dataset.filter;
        let visible = 0;
        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.cat === filter;
          card.hidden = !show;
          if (show) visible++;
        });
        if (emptyMsg) emptyMsg.hidden = visible > 0;
      });
    });
  });

  // 5.5 WhatsApp-style voice note players (testimonials)
  const voiceNotes = document.querySelectorAll('[data-voice]');
  const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  voiceNotes.forEach(note => {
    const audio = note.querySelector('audio');
    const btn = note.querySelector('.voice-play');
    const wave = note.querySelector('.voice-wave');
    const bars = wave.querySelectorAll('span');
    const time = note.querySelector('.voice-time');
    const total = time.textContent;

    const paint = () => {
      const k = audio.duration ? audio.currentTime / audio.duration : 0;
      const n = Math.round(k * bars.length);
      bars.forEach((b, i) => b.classList.toggle('played', i < n));
      time.textContent = audio.currentTime > 0 ? fmtTime(audio.currentTime) : total;
    };

    btn.addEventListener('click', () => {
      if (audio.paused) {
        // only one testimonial plays at a time
        document.querySelectorAll('[data-voice] audio').forEach(a => { if (a !== audio) a.pause(); });
        audio.play();
      } else {
        audio.pause();
      }
    });
    audio.addEventListener('play', () => note.classList.add('playing'));
    audio.addEventListener('pause', () => note.classList.remove('playing'));
    audio.addEventListener('timeupdate', paint);
    audio.addEventListener('ended', () => { audio.currentTime = 0; paint(); });
    wave.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const r = wave.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
      paint();
    });
  });

  // 5.4 Guias: highlight the table-of-contents entry for the section being read
  const tocLinks = document.querySelectorAll('.guide-toc a');
  if (tocLinks.length) {
    // getElementById: heading ids may start with a digit, which querySelector rejects
    const headings = Array.from(tocLinks).map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const markToc = (id) => tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
    const tocObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) markToc(entry.target.id); });
    }, { rootMargin: '-100px 0px -70% 0px' });
    headings.forEach(h => tocObserver.observe(h));
    if (headings[0]) markToc(headings[0].id);
  }

  // 5.6 Direct WhatsApp links get the contextual greeting
  document.querySelectorAll('[data-wa]').forEach(link => {
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappGreeting())}`;
  });

  // 5.2 Floating diagnosis button appears after the hero
  const diagFloat = document.querySelector('.diag-float');
  if (diagFloat) {
    // Show it once the hero leaves the screen. An observer avoids reading scrollY at
    // startup, which forced a full-page layout inside this script.
    const heroEl = document.querySelector('.hero-section, .page-hero');
    if (heroEl) {
      new IntersectionObserver(([entry]) => {
        diagFloat.classList.toggle('show', !entry.isIntersecting);
      }, { rootMargin: '-200px 0px 0px 0px' }).observe(heroEl);
    } else {
      diagFloat.classList.add('show');
    }
  }

  // 8.1 Proof Image Lightbox Modal Controls
  const proofLightbox = document.getElementById('proofLightbox');
  const proofLightboxImg = document.getElementById('proofLightboxImg');
  const proofLightboxCaption = document.getElementById('proofLightboxCaption');
  const proofLightboxClose = document.getElementById('proofLightboxClose');
  const proofLightboxBackdrop = document.getElementById('proofLightboxBackdrop');
  const proofMediaBoxes = document.querySelectorAll('.proof-media-box');

  const openProofLightbox = (mediaBox) => {
    if (!proofLightbox || !proofLightboxImg) return;
    const imgSrc = mediaBox.getAttribute('data-img-src');
    const imgAlt = mediaBox.getAttribute('data-img-alt') || '';
    const caption = mediaBox.getAttribute('data-img-caption') || '';

    proofLightboxImg.src = imgSrc;
    proofLightboxImg.alt = imgAlt;
    if (proofLightboxCaption) {
      proofLightboxCaption.textContent = caption;
    }

    proofLightbox.classList.add('open');
    proofLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeProofLightbox = () => {
    if (!proofLightbox) return;
    proofLightbox.classList.remove('open');
    proofLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  proofMediaBoxes.forEach(box => {
    box.addEventListener('click', () => openProofLightbox(box));
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProofLightbox(box);
      }
    });
  });

  if (proofLightboxClose) {
    proofLightboxClose.addEventListener('click', closeProofLightbox);
  }

  if (proofLightboxBackdrop) {
    proofLightboxBackdrop.addEventListener('click', closeProofLightbox);
  }

  if (proofLightbox) {
    proofLightbox.addEventListener('click', (e) => {
      if (e.target === proofLightbox) {
        closeProofLightbox();
      }
    });
  }

  // Global ESC Key Handler for Modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (proofLightbox && proofLightbox.classList.contains('open')) {
        closeProofLightbox();
      }
      if (modal && modal.classList.contains('open')) {
        closeModal();
      }
      if (navDropdown) {
        navDropdown.classList.remove('open');
      }
    }
  });
  const revealElements = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-stagger');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once revealed, stop observing for performance
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 10. Active Nav Link Highlight on Scroll
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (navLinks.length) {
    // a section counts as "current" while it crosses a thin band near the top of the screen
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
      });
    }, { rootMargin: '-140px 0px -70% 0px' });
    document.querySelectorAll('section[id]').forEach(section => navObserver.observe(section));
  }

  // 11. Hero Cursor Spotlight (same pattern as glass-card, hover-only devices)
  const heroSection = document.querySelector('.hero-section');
  if (heroSection && window.matchMedia('(hover: hover)').matches) {
    let heroRafId = null;

    heroSection.addEventListener('mouseenter', () => {
      heroSection.classList.add('hero-spotlight-active');
    });

    heroSection.addEventListener('mouseleave', () => {
      heroSection.classList.remove('hero-spotlight-active');
      if (heroRafId) {
        cancelAnimationFrame(heroRafId);
        heroRafId = null;
      }
    });

    heroSection.addEventListener('mousemove', (e) => {
      if (heroRafId) return;
      heroRafId = requestAnimationFrame(() => {
        const rect = heroSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        heroSection.style.setProperty('--hero-mouse-x', `${x}px`);
        heroSection.style.setProperty('--hero-mouse-y', `${y}px`);
        heroRafId = null;
      });
    });
  }

});
