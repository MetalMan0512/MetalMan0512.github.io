/* ── Daniel Hillhouse — shared site scripts ─────────────────────── */

/* Auto dark mode — system preference or time of day (7pm–7am) */
(function () {
  const root = document.documentElement;
  const hour = new Date().getHours();
  const isNight = hour >= 19 || hour < 7;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isNight || prefersDark) root.setAttribute('data-theme', 'dark');
})();

const FORM_ENDPOINT = 'https://formspree.io/f/xojowbek';

/* Navbar shadow + scroll-spy (single rAF-throttled listener) */
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a:not(.nav-cta)');
let scrollScheduled = false;

function handleScroll() {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navAs.forEach(a => {
    a.classList.toggle('nav-active', a.getAttribute('href') === '#' + current);
  });
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(handleScroll);
  }
});
handleScroll();

/* Mobile nav toggle */
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* FAQ accordion */
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach((q, i) => {
  const answer = q.nextElementSibling;
  if (!answer.id) answer.id = 'faq-answer-' + (i + 1);
  q.setAttribute('aria-expanded', 'false');
  q.setAttribute('aria-controls', answer.id);
  q.addEventListener('click', () => toggleFaq(q));
});

function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  faqQuestions.forEach(q => {
    q.classList.remove('open');
    q.setAttribute('aria-expanded', 'false');
    q.nextElementSibling.classList.remove('open');
  });
  if (!isOpen) {
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    answer.classList.add('open');
  }
}

/* Contact form */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements['_gotcha'].value) return; // honeypot

    const btn = form.querySelector('.form-submit');
    const status = document.getElementById('formStatus');
    const fail = (msg) => {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      if (status) status.textContent = msg;
    };

    if (status) status.textContent = '';
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const data = {
      'First Name': form.elements['firstName'].value.trim(),
      'Last Name':  form.elements['lastName'].value.trim(),
      'Email':      form.elements['email'].value.trim(),
      'Phone':      form.elements['phone'].value.trim(),
      'Company':    form.elements['company'].value.trim(),
      'Reason':     form.elements['service'].value,
      'Message':    form.elements['message'].value.trim(),
    };

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        form.style.display = 'none';
        const success = document.getElementById('formSuccess');
        success.style.display = 'block';
        const heading = success.querySelector('h3');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      } else {
        fail('Something went wrong. Please try again, or reach out via LinkedIn.');
      }
    } catch (err) {
      fail('Something went wrong. Please check your connection and try again.');
    }
  });
}
