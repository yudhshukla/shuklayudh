const TYPE_SPEED = 60000 / (440 * 5); //

function typeElement(el, text, msPerChar, onComplete) {
  const runId = (el._typeRunId = (el._typeRunId || 0) + 1);
  el.textContent = '';
  el.classList.remove('pre-type');
  el.classList.add('typing-cursor');
  let i = 0;
  (function step() {
    if (el._typeRunId !== runId) return; // a newer run has taken over
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      const jitter = msPerChar * (0.75 + Math.random() * 0.5);
      setTimeout(step, jitter);
    } else {
      el.classList.remove('typing-cursor');
      if (onComplete) onComplete();
    }
  })();
}

const heroHeading = document.getElementById('heroHeading');
const heroLead = document.getElementById('heroLead');

if (heroHeading && heroLead) {
  const headingText = heroHeading.textContent;
  const leadText = heroLead.textContent;
  heroHeading.style.minHeight = heroHeading.getBoundingClientRect().height + 'px';
  heroLead.style.minHeight = heroLead.getBoundingClientRect().height + 'px';

  typeElement(heroHeading, headingText, TYPE_SPEED, () => {
    typeElement(heroLead, leadText, TYPE_SPEED, () => {
      const bubble = document.getElementById('heroBubble');
      if (bubble) setTimeout(() => bubble.classList.add('show'), 1000);
    });
  });
}

const cardReveals = document.querySelectorAll('.card-reveal');

if (cardReveals.length) {
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  cardReveals.forEach((card, i) => {
    card.style.transitionDelay = (i % 2) * 0.08 + 's';
    cardObserver.observe(card);
  });
}

const timeline = document.querySelector('.timeline');

if (timeline) {
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  timelineObserver.observe(timeline);
}

const postitRows = document.querySelectorAll('.postit-row');

if (postitRows.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  postitRows.forEach((row) => revealObserver.observe(row));
}

// Chapter nav on the case-study page: highlights whichever section is
// crossing the vertical center of the viewport, and fills the track
// to match how far the reader has gotten through .case-body overall.
const chapterNav = document.querySelector('.chapter-nav');

if (chapterNav) {
  const chapterFill = document.getElementById('chapterFill');
  const dots = [...chapterNav.querySelectorAll('.chapter-dot')];
  const sections = dots
    .map((dot) => document.querySelector(dot.getAttribute('href')))
    .filter(Boolean);

  let flashTimeout;
  let activeId = null;

  const setActive = (id) => {
    if (id === activeId) return;
    activeId = id;
    dots.forEach((dot) => dot.classList.toggle('active', dot.getAttribute('href') === `#${id}`));

    const label = chapterNav.querySelector('.chapter-dot.active + .chapter-label');
    chapterNav.querySelectorAll('.chapter-label.flash').forEach((el) => el.classList.remove('flash'));
    clearTimeout(flashTimeout);
    if (label) {
      label.classList.add('flash');
      flashTimeout = setTimeout(() => label.classList.remove('flash'), 1800);
    }
  };

  const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => chapterObserver.observe(section));

  const updateChapterFill = () => {
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atBottom) {
      chapterFill.style.height = '100%';
      setActive(sections[sections.length - 1].id);
      return;
    }
    const firstTop = sections[0].getBoundingClientRect().top + window.scrollY;
    const lastBottom = sections[sections.length - 1].getBoundingClientRect().bottom + window.scrollY;
    const scrolled = window.scrollY + window.innerHeight / 2 - firstTop;
    const pct = Math.min(100, Math.max(0, (scrolled / (lastBottom - firstTop)) * 100));
    chapterFill.style.height = `${pct}%`;
  };

  window.addEventListener('scroll', updateChapterFill, { passive: true });
  updateChapterFill();
}

document.querySelectorAll('.project-card').forEach((card) => {
  const dialogueText = card.querySelector('.dialogue-box p');
  if (!dialogueText) return;

  const fullText = dialogueText.textContent;
  dialogueText.textContent = '';

  const play = () => typeElement(dialogueText, fullText, TYPE_SPEED);
  const reset = () => {
    dialogueText._typeRunId = (dialogueText._typeRunId || 0) + 1;
    dialogueText.textContent = '';
    dialogueText.classList.remove('typing-cursor');
  };

  card.addEventListener('mouseenter', play);
  card.addEventListener('mouseleave', reset);
  card.addEventListener('focusin', play);
  card.addEventListener('focusout', (e) => {
    if (!card.contains(e.relatedTarget)) reset();
  });
});

// Sweep transition into a project: a full-screen block in the
// clicked card's own color wipes across, then the destination page
// (project-template.html's inline pre-cover script snaps its overlay
// to already-covering, in that same color, before first paint) keeps
// the same wipe moving outward to reveal itself — reads as one
// continuous block sliding across, not two separate animations.
const pageSweep = document.getElementById('pageSweep');

document.querySelectorAll('.project-card a').forEach((link) => {
  link.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || !pageSweep) return;
    e.preventDefault();
    const href = link.href;
    const color = getComputedStyle(link.closest('.project-card')).backgroundColor;

    sessionStorage.setItem('sweepColor', color);

    pageSweep.style.transition = 'none';
    pageSweep.style.background = color;
    pageSweep.style.transformOrigin = 'left';
    pageSweep.style.transform = 'scaleX(0)';
    pageSweep.offsetHeight; // force reflow before enabling the transition
    pageSweep.style.transition = 'transform 0.4s steps(10, end)';
    pageSweep.style.transform = 'scaleX(1)';

    setTimeout(() => { window.location.href = href; }, 420);
  });
});

if (pageSweep && sessionStorage.getItem('sweepColor')) {
  sessionStorage.removeItem('sweepColor');
  requestAnimationFrame(() => {
    setTimeout(() => {
      pageSweep.style.transition = 'transform 0.4s steps(10, end)';
      pageSweep.style.transform = 'scaleX(0)';
    }, 100);
  });
}

// Back/forward navigation often restores the page from the browser's
// bfcache instead of reloading it — meaning it reappears frozen in
// whatever DOM state it was left in, mid-sweep, overlay still
// covering the screen. Force it back to hidden whenever that happens.
window.addEventListener('pageshow', (e) => {
  if (e.persisted && pageSweep) {
    pageSweep.style.transition = 'none';
    pageSweep.style.transform = 'scaleX(0)';
  }
});
