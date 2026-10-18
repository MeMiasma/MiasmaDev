/* Additive visual enhancement layer. Core portfolio logic and data remain untouched. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // Reveal content as it enters the viewport, without changing its markup or text.
  const revealTargets = document.querySelectorAll(
    '.section-heading, .service-card, .project-card, .review-stat-card, .process-step, .about-panel, .contact-card, .trust-inner, .reviews-book'
  );
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

    revealTargets.forEach(el => {
      el.classList.add('reveal-ready');
      revealObserver.observe(el);
    });
  }

  // Subtle 3D response: restrained, only for desktop pointer devices.
  if (finePointer && !reduceMotion) {
    const tiltTargets = document.querySelectorAll('.service-card, .review-stat-card, .process-step');
    tiltTargets.forEach(card => {
      card.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 3}deg) rotateY(${(x - 0.5) * 3}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    const visual = document.querySelector('.hero-visual');
    const windowCard = document.querySelector('.code-window');
    if (visual && windowCard) {
      visual.addEventListener('pointermove', event => {
        const rect = visual.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        windowCard.style.transform = `rotateY(${-4 + x * 5}deg) rotateX(${-y * 4}deg) translateY(-2px)`;
      });
      visual.addEventListener('pointerleave', () => { windowCard.style.transform = ''; });
    }
  }

  // Keep anchor movement comfortable with the sticky navigation.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
