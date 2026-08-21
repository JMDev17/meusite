/* ==========================================================================
   JM SOLUÇÕES — INTERACTIVE APP LOGIC & DELUCKS EFFECTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Delucks Card Spotlight Cursor Tracking
  const cards = document.querySelectorAll('.glass-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 2. Navbar Glass Blur Scroll Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

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

  // 4. Interactive FAQ Accordions
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      faqItems.forEach(i => i.classList.remove('open'));

      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // 5. Lead Diagnosis Modal Controls
  const modal = document.getElementById('contactModal');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');
  const modalClose = document.getElementById('modalClose');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });

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
        modal.classList.remove('open');
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
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const highlightNav = () => {
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav);
  highlightNav(); // Run once on load

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

// Form Submission Handler
function handleFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('leadName').value;
  const company = document.getElementById('leadCompany').value;

  alert(`Obrigado, ${name}! Recebemos a solicitação de análise para a ${company}. Nossa equipe de especialistas entrará em contato em breve.`);

  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.classList.remove('open');
  }

  document.getElementById('leadForm').reset();
}
