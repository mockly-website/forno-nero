const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed; top: 0; left: 0; height: 2px;
  background: linear-gradient(90deg, #c9963a, #e8b86d);
  z-index: 9999; width: 0%; transition: width .1s linear;
  pointer-events: none;
`;
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', scrollY > 80);
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrollY / total * 100) + '%';
}, { passive: true });

const cur = document.getElementById('cur');
if (cur && window.innerWidth > 768) {
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;

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

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: .08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

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
  tabsBar.style.top = scrollY > 80 ? '57px' : '68px';
}, { passive: true });

const transOverlay = document.createElement('div');
transOverlay.style.cssText = `
  position: fixed; inset: 0;
  background: var(--void);
  z-index: 10000;
  pointer-events: none;
  opacity: 0;
  transition: opacity .35s cubic-bezier(.16,1,.3,1);
`;
document.body.append(transOverlay);

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
    document.querySelectorAll('.marquee-track').forEach(track => {
      track.style.animationPlayState = 'running';
    });
  });
});

document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel:') && href.endsWith('.html')) {
    link.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.button === 1) return;
      e.preventDefault();
      transOverlay.style.opacity = '1';
      transOverlay.style.pointerEvents = 'all';
      setTimeout(() => window.location.href = href, 350);
    });
  }
});

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

document.querySelectorAll('.pizza-name').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.color = 'var(--signal)';
    el.style.transition = 'color .3s';
  });
  el.addEventListener('mouseleave', () => {
    el.style.color = '';
  });
});
