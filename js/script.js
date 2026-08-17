document.getElementById('year').textContent = new Date().getFullYear();

function typeElement(el, msPerChar, onComplete) {
  const text = el.textContent;
  el.textContent = '';
  el.classList.add('typing-cursor');
  let i = 0;
  (function step() {
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
  const msPerChar = 60000 / (340 * 5); // ~260 wpm, 5 chars/word
  typeElement(heroHeading, msPerChar, () => {
    typeElement(heroLead, msPerChar);
  });
}
