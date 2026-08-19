const TYPE_SPEED = 60000 / (340 * 5); // ~340 wpm, 5 chars/word

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
    typeElement(heroLead, leadText, TYPE_SPEED);
  });
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
