/* ============================
   PORTFOLIO JAVASCRIPT
   ============================ */

// ── Cursor Glow ──
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', e => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});

// ── Particle Canvas ──
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.r  = Math.random() * 1.5 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.6 + 0.1;
    const colors = ['#6c63ff','#f43f5e','#06b6d4','#a78bfa'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function initParticles(count = 120) {
  particles = [];
  for (let i = 0; i < count; i++) particles.push(new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(108,99,255,${0.08 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();

// ── Typing Animation ──
const roles = [
  'Developer & Creator',
  'AI/ML Enthusiast',
  'Founder of BillSnap',
  'Hackathon Winner 🏆',
  'B.Tech CSE (AIML) @ RIT Roorkee'
];
let roleIdx = 0, charIdx = 0, deleting = false;
const typingEl = document.getElementById('typingText');

function typeEffect() {
  const current = roles[roleIdx];
  if (!deleting) {
    typingEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeEffect, 2000);
      return;
    }
  } else {
    typingEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }
  }
  setTimeout(typeEffect, deleting ? 50 : 90);
}
typeEffect();

// ── Navbar Scroll Effect ──
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 50);
  backToTop.classList.toggle('visible', scrollY > 400);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Hamburger Menu ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// ── Project Filter ──
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.display = match ? '' : 'none';
      card.style.animation = match ? 'fadeSlide 0.4s ease' : '';
    });
  });
});

// ── Scroll Fade-In ──
const fadeEls = document.querySelectorAll(
  '.section-header, .project-card, .skill-category, .about-text, .about-details, .contact-card, .contact-form, .stat-card, .detail-card'
);
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.style.transitionDelay = entry.target.dataset.delay || '0s';
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach((el, i) => {
  el.classList.add('fade-in');
  el.dataset.delay = `${(i % 4) * 0.1}s`;
  observer.observe(el);
});

// ── Counter Animation ──
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(timer);
  }, 40);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numEl = entry.target.querySelector('.stat-num');
      if (numEl && !numEl.dataset.animated) {
        numEl.dataset.animated = true;
        const text = numEl.textContent;
        const num  = parseInt(text.replace(/\D/g, ''), 10);
        const suffix = text.replace(/[0-9]/g, '');
        animateCounter(numEl, num, suffix);
      }
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-card').forEach(el => statsObserver.observe(el));

// ── Contact Form ──
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    btn.disabled = false;
    success.classList.add('show');
    document.getElementById('contactForm').reset();
    setTimeout(() => success.classList.remove('show'), 5000);
  }, 1800);
}

// ── Active Nav Link on Scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
  });
  navLinkEls.forEach(link => {
    link.classList.toggle('active-link', link.getAttribute('href') === '#' + current);
  });
});

// ── Smooth Parallax for hero visual ──
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 15;
    const y = (e.clientY / window.innerHeight - 0.5) * 15;
    heroVisual.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// ── CSS animation for project filter ──
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeSlide {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .nav-link.active-link {
    color: var(--text-primary);
  }
  .nav-link.active-link::after {
    width: 100%;
  }
`;
document.head.appendChild(style);

console.log('%c🚀 Portfolio Loaded!', 'color:#6c63ff;font-size:1.2rem;font-weight:bold;');
