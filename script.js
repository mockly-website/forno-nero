/* PROGRESS BAR */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed; top: 0; left: 0; height: 2px;
  background: linear-gradient(90deg, #c9963a, #e8b86d);
  z-index: 9999; width: 0%; transition: width .1s linear;
  pointer-events: none;
`;
document.body.prepend(progressBar);

/* SCROLL HEAT MAP */
function updateHeat() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = total > 0 ? scrollY / total : 0;
  const heat = pct < 0.7 ? pct * 1.4 : Math.max(0, (1 - pct) * 3.3);
  document.documentElement.style.setProperty('--heat', Math.min(heat, 1));
}

window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', scrollY > 80);
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrollY / total * 100) + '%';
  updateHeat();
}, { passive: true });

updateHeat();

/* CURSOR */
const cur = document.getElementById('cur');
if (cur && window.innerWidth > 768) {
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cx;

  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    cur.classList.add('visible');
  });

  document.addEventListener('mouseleave', () => cur.classList.remove('visible'));

  function animateCursor() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    cur.style.left = cx + 'px';
    cur.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .preview-card, .spec-card, .pizza-row, .time-slot').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hovered'));
  });
}

/* EMBER TRAIL */
if (!prefersReducedMotion && window.innerWidth > 768) {
  let emberTimer = 0;
  document.addEventListener('mousemove', e => {
    if (Date.now() - emberTimer < 40) return;
    emberTimer = Date.now();
    const ember = document.createElement('div');
    ember.className = 'ember-particle';
    const size = 2 + Math.random() * 3;
    ember.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX}px;top:${e.clientY}px;opacity:${0.4 + Math.random() * 0.4};`;
    document.body.appendChild(ember);
    const driftX = (Math.random() - 0.5) * 20;
    const driftY = -(20 + Math.random() * 30);
    ember.animate([
      { transform: 'translateY(0) translateX(0) scale(1)', opacity: 1 },
      { transform: `translateY(${driftY}px) translateX(${driftX}px) scale(0)`, opacity: 0 }
    ], { duration: 600 + Math.random() * 400, easing: 'ease-out' }).onfinish = () => ember.remove();
  });
}

/* EMBER BURST ON INTERACT */
function burstEmbers(x, y, container) {
  const count = 6 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'ember-burst';
    const size = 3 + Math.random() * 3;
    const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
    const dist = 30 + Math.random() * 50;
    p.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;opacity:${0.6 + Math.random() * 0.4};`;
    container.appendChild(p);
    p.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`, opacity: 0 }
    ], { duration: 500 + Math.random() * 300, easing: 'ease-out' }).onfinish = () => p.remove();
  }
}

if (!prefersReducedMotion) document.querySelectorAll('.btn-primary, .btn-secondary, .btn-next, .btn-back, .preview-card, .spec-card').forEach(el => {
  el.addEventListener('mouseenter', e => {
    const rect = el.getBoundingClientRect();
    burstEmbers(Math.random() * rect.width, Math.random() * rect.height, el);
  });
});

/* MOBILE MENU */
function toggleMob() {
  const menu = document.getElementById('mobMenu');
  const ham  = document.getElementById('ham');
  if (!menu || !ham) return;
  const open = !menu.classList.contains('open');
  menu.classList.toggle('open');
  ham.classList.toggle('open');
  document.body.style.overflow = open ? 'hidden' : '';
  ham.setAttribute('aria-expanded', open);
  ham.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
}
function closeMob() {
  const menu = document.getElementById('mobMenu');
  const ham  = document.getElementById('ham');
  if (!menu || !ham) return;
  menu.classList.remove('open');
  ham.classList.remove('open');
  ham.setAttribute('aria-expanded', 'false');
  ham.setAttribute('aria-label', 'Apri menu');
  document.body.style.overflow = '';
}

/* OBSERVERS */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: .08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
document.querySelectorAll('.burn-reveal').forEach(el => obs.observe(el));

const imgRevealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      imgRevealObs.unobserve(e.target);
    }
  });
}, { threshold: .1 });

document.querySelectorAll('.img-reveal').forEach(el => imgRevealObs.observe(el));

/* PARALLAX */
function onScroll() {
  const p1 = document.getElementById('pImg1');
  const p2 = document.getElementById('pImg2');
  if (p1 && window.innerWidth > 768) {
    const r = p1.parentElement.getBoundingClientRect();
    const pct = (window.innerHeight / 2 - r.top - r.height / 2) / window.innerHeight;
    p1.style.transform = `translateY(${pct * 60}px)`;
  }
  if (p2 && window.innerWidth > 768) {
    const r = p2.parentElement.getBoundingClientRect();
    const pct = (window.innerHeight / 2 - r.top - r.height / 2) / window.innerHeight;
    p2.style.transform = `translateY(${pct * 60}px)`;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

window.addEventListener('scroll', () => {
  const tabsBar = document.getElementById('menuTabsBar');
  if (!tabsBar) return;
  tabsBar.style.top = scrollY > 80 ? '56px' : '88px';
}, { passive: true });

/* LOADING SHIMMER */
const shimmer = document.createElement('div');
shimmer.className = 'loading-shimmer';
shimmer.innerHTML = '<div class="loading-shimmer-inner"></div>';
document.body.prepend(shimmer);

let pageLoaded = false;

window.addEventListener('load', () => {
  pageLoaded = true;
  setTimeout(() => {
    document.body.classList.add('loaded');
    document.querySelectorAll('.marquee-track').forEach(track => {
      track.style.animationPlayState = 'running';
    });
    shimmer.classList.add('fade-out');
    setTimeout(() => shimmer.remove(), 600);
  }, 400);
});

setTimeout(() => {
  if (!pageLoaded) {
    shimmer.classList.add('fade-out');
    setTimeout(() => shimmer.remove(), 600);
  }
}, 3000);

/* PAGE TRANSITIONS */
const transOverlay = document.getElementById('pageOverlay');
if (transOverlay) {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel:') && href.endsWith('.html')) {
      link.addEventListener('click', e => {
        if (e.ctrlKey || e.metaKey || e.button === 1) return;
        e.preventDefault();
        transOverlay.style.opacity = '1';
        transOverlay.style.pointerEvents = 'all';
        setTimeout(() => window.location.href = href, 450);
      });
    }
  });
}

/* COUNTER ANIMATION */
function animateCounter(el, target, suffix) {
  suffix = suffix || '';
  const duration = 1800;
  const start = Date.now();
  const isFloat = target % 1 !== 0;

  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = isFloat ? (target * eased).toFixed(1) : Math.round(target * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const numEl = e.target.querySelector('.stat-number');
      if (numEl && !numEl.dataset.animated) {
        numEl.dataset.animated = '1';
        const raw = numEl.textContent.trim();
        const match = raw.match(/^([\d.]+)(.*)$/);
        if (match) {
          const num = parseFloat(match[1]);
          const suffix = match[2] || '';
          animateCounter(numEl, num, suffix);
        }
      }
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: .3 });

document.querySelectorAll('.stat-item').forEach(el => counterObs.observe(el));

/* MAGNETIC BUTTONS */
if (window.innerWidth > 768) {
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-next').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), background .25s, letter-spacing .25s';
      setTimeout(() => btn.style.transition = '', 500);
    });
  });
}

/* PIZZA NAME HOVER */
document.querySelectorAll('.pizza-name').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.color = 'var(--signal)';
    el.style.transition = 'color .3s';
  });
  el.addEventListener('mouseleave', () => {
    el.style.color = '';
  });
});

/* RIPPLE */
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-next, .btn-back').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

/* 3D TILT */
if (!prefersReducedMotion && window.innerWidth > 768) {
  function initTilt(selector, innerSelector) {
    document.querySelectorAll(selector).forEach(card => {
      const inner = card.querySelector(innerSelector) || card;
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        inner.style.transform = `rotateX(${y * -6}deg) rotateY(${x * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        inner.style.transform = '';
        inner.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
        setTimeout(() => inner.style.transition = '', 500);
      });
    });
  }
  initTilt('.preview-card', '.preview-card-inner');
  initTilt('.spec-card', '.spec-card-inner');
}

/* HERO PARTICLES */
if (!prefersReducedMotion) {
  const hero = document.querySelector('#hero');
  if (hero) {
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    hero.appendChild(p);
  }
}
}

/* NAV ACTIVE STATE */
(function() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();

/* DIETARY BADGE TOOLTIPS */
(function() {
  const labels = { veg: 'Vegetariana', spicy: 'Piccante', fish: 'Pesce', chef: 'Chef\'s Pick', special: 'Pizza ripiena' };
  document.querySelectorAll('.diet-badge').forEach(b => {
    for (const [cls, label] of Object.entries(labels)) {
      if (b.classList.contains(cls)) { b.setAttribute('data-tip', label); break; }
    }
  });
})();

/* BOOKING FORM ENTER KEY */
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const step2 = document.getElementById('booking-step-2');
      if (step2 && step2.classList.contains('active')) {
        submitBooking();
      }
    }
  });
}
