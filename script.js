/* ===========================================================
   HOCHZEITSDATUM
   Hier das Datum und die Uhrzeit der Trauung eintragen.
   Format: 'JJJJ-MM-TTTHH:MM:SS'
   =========================================================== */
const WEDDING_DATE = new Date('2026-12-11T14:00:00');

/* ===========================================================
   FOTOS FÜR "UNSERE GEMEINSAME REISE"
   So fügst du eigene Fotos hinzu:
   1. Lade deine Bilder in den Ordner  images/gallery/  hoch.
   2. Trage jeden Dateinamen unten in die Liste ein — ca. 20-25
      Fotos sehen am besten aus, es dürfen aber auch mehr oder
      weniger sein.
   Diese eine Liste wird automatisch auf drei Banner verteilt:
   oben läuft es nach links, in der Mitte nach rechts, unten
   wieder nach links — jeweils versetzt, damit es nicht wie drei
   identische Reihen aussieht.
   =========================================================== */
const JOURNEY_PHOTOS = [
  'foto1.jpg',
  'foto2.jpg',
  'foto3.jpg',
  'foto4.jpg',
  'foto5.jpg',
  'foto6.jpg',
  'foto7.jpg',
  'foto8.jpg',
  'foto9.jpg',
  'foto10.jpg',
  'foto1.jpg',
  'foto2.jpg',
  'foto3.jpg',
  'foto4.jpg',
  'foto5.jpg',
  'foto6.jpg',
  'foto7.jpg',
  'foto8.jpg',
  'foto9.jpg',
  'foto10.jpg',
  'foto1.jpg',
  'foto2.jpg',
  'foto3.jpg',
  'foto4.jpg',
];

/* Ungefähre Laufzeit pro Foto in Sekunden — größerer Wert = langsamer */
const SECONDS_PER_PHOTO = 2.6;

/* ===========================================================
   FOTOS FÜR "UNSERE GEMEINSAME ZUKUNFT"
   Genau 3 Fotos, die nebeneinander (nicht laufend) angezeigt
   werden — z. B. Verlobung, ein Zukunftsmoment, ein Zukunftstraum.
   =========================================================== */
const FUTURE_PHOTOS = [
  'images/gallery/foto8.jpg',
  'images/gallery/foto9.jpg',
  'images/gallery/foto10.jpg',
];

/* ---------- Hilfsfunktionen ---------- */
function cloneTemplate(id) {
  const tpl = document.getElementById(id);
  return tpl.content.firstElementChild.cloneNode(true);
}

function rotateArray(arr, offset) {
  const n = arr.length;
  const o = ((offset % n) + n) % n;
  return arr.slice(o).concat(arr.slice(0, o));
}

function buildJourneyPage(photos) {
  const page = document.createElement('div');
  page.className = 'page page--timeline';

  const inner = document.createElement('div');
  inner.className = 'page__inner page__inner--timeline';

  const label = document.createElement('p');
  label.className = 'section-label';
  label.textContent = 'Unsere gemeinsame Reise';
  inner.appendChild(label);

  const rowsWrap = document.createElement('div');
  rowsWrap.className = 'timeline-rows';

  // Drei Reihen, jeweils versetzt und mit wechselnder Richtung:
  // oben nach links, Mitte nach rechts, unten wieder nach links.
  const rowConfigs = [
    { offset: 0, reverse: false, speedFactor: 1 },
    { offset: Math.floor(photos.length / 3), reverse: true, speedFactor: 1.15 },
    { offset: Math.floor((photos.length * 2) / 3), reverse: false, speedFactor: 0.9 },
  ];

  rowConfigs.forEach((config) => {
    const rowPhotos = rotateArray(photos, config.offset);

    const rowEl = document.createElement('div');
    rowEl.className = 'timeline-row';

    const track = document.createElement('div');
    track.className = 'timeline-row__track';
    if (config.reverse) track.classList.add('timeline-row__track--reverse');

    // Reihe verdoppeln für eine nahtlose Endlosschleife.
    for (let copy = 0; copy < 2; copy++) {
      rowPhotos.forEach((src) => {
        const img = document.createElement('img');
        img.className = 'timeline-photo';
        img.src = src;
        img.alt = 'Steven und Svenja';
        img.loading = 'lazy';
        track.appendChild(img);
      });
    }

    const duration = rowPhotos.length * SECONDS_PER_PHOTO * config.speedFactor;
    track.style.animationDuration = `${duration.toFixed(1)}s`;

    rowEl.appendChild(track);
    rowsWrap.appendChild(rowEl);
  });

  inner.appendChild(rowsWrap);
  page.appendChild(inner);
  return page;
}

function fillFuturePhotos(pageEl, photos) {
  const slot = pageEl.querySelector('.future-photos');
  photos.forEach((src) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Steven und Svenja';
    img.loading = 'lazy';
    slot.appendChild(img);
  });
  return pageEl;
}

/* ---------- Buchseiten zusammensetzen ---------- */
const pageEls = [];
pageEls.push(cloneTemplate('tpl-hero'));
pageEls.push(cloneTemplate('tpl-story'));
pageEls.push(buildJourneyPage(JOURNEY_PHOTOS));
pageEls.push(fillFuturePhotos(cloneTemplate('tpl-future'), FUTURE_PHOTOS));
pageEls.push(cloneTemplate('tpl-schedule'));
pageEls.push(cloneTemplate('tpl-footer'));

const book = document.getElementById('book');
const totalPages = pageEls.length;

pageEls.forEach((el, i) => {
  el.style.zIndex = String(totalPages - i); // Seite 0 liegt zu Beginn oben auf
  book.appendChild(el);
});

/* ---------- Blätter-Logik ---------- */
const prevBtn = document.getElementById('nav-prev');
const nextBtn = document.getElementById('nav-next');
const counterEl = document.getElementById('nav-counter');
const lightbox = document.getElementById('lightbox');

let currentIndex = 0;   // Index der obersten noch nicht umgeblätterten Seite
let isAnimating = false;

function updateNav() {
  counterEl.textContent = `${currentIndex + 1} / ${totalPages}`;
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex >= totalPages - 1;
}

function lightboxIsOpen() {
  return lightbox && lightbox.classList.contains('is-open');
}

function goNext() {
  if (isAnimating || lightboxIsOpen() || currentIndex >= totalPages - 1) return;
  isAnimating = true;

  const flippingIndex = currentIndex;
  const page = pageEls[flippingIndex];
  page.style.zIndex = String(totalPages + 10); // während der Animation ganz oben

  requestAnimationFrame(() => {
    page.classList.add('is-flipped');
  });

  const onEnd = (e) => {
    if (e.propertyName !== 'transform') return;
    page.removeEventListener('transitionend', onEnd);
    page.style.zIndex = String(flippingIndex); // Formel für umgeblätterte Seiten (linker Stapel)
    currentIndex = flippingIndex + 1;
    isAnimating = false;
    updateNav();
  };
  page.addEventListener('transitionend', onEnd);
}

function goPrev() {
  if (isAnimating || lightboxIsOpen() || currentIndex <= 0) return;
  isAnimating = true;

  const flippingIndex = currentIndex - 1;
  const page = pageEls[flippingIndex];
  page.style.zIndex = String(totalPages + 10); // während der Animation ganz oben

  requestAnimationFrame(() => {
    page.classList.remove('is-flipped');
  });

  const onEnd = (e) => {
    if (e.propertyName !== 'transform') return;
    page.removeEventListener('transitionend', onEnd);
    page.style.zIndex = String(totalPages - flippingIndex); // Formel für nicht umgeblätterte Seiten (rechter Stapel)
    currentIndex = flippingIndex;
    isAnimating = false;
    updateNav();
  };
  page.addEventListener('transitionend', onEnd);
}

prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') goNext();
  if (e.key === 'ArrowLeft') goPrev();
});

/* ---------- Wischen auf Mobilgeräten ---------- */
let touchStartX = null;
let touchStartY = null;

book.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

book.addEventListener('touchend', (e) => {
  if (touchStartX === null || lightboxIsOpen()) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const threshold = 50;

  // Nur horizontale Wischgesten werten, damit vertikales Scrollen
  // innerhalb einer Seite (z. B. lange Texte) nicht stört.
  if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) goNext();
    else goPrev();
  }
  touchStartX = null;
  touchStartY = null;
}, { passive: true });

updateNav();

/* ---------- Countdown ---------- */
function updateCountdown() {
  const now = new Date();
  const diff = WEDDING_DATE - now;

  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds'),
  };
  if (!els.days) return;

  if (diff <= 0) {
    els.days.textContent = '00';
    els.hours.textContent = '00';
    els.minutes.textContent = '00';
    els.seconds.textContent = '00';
    return;
  }

  const pad = (n) => String(n).padStart(2, '0');
  const totalSeconds = Math.floor(diff / 1000);
  els.days.textContent = pad(Math.floor(totalSeconds / 86400));
  els.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
  els.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
  els.seconds.textContent = pad(totalSeconds % 60);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ---------- Lightbox für Fotos ---------- */
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

book.addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG' && e.target.closest('.page--timeline, .page--future')) {
    lightboxImg.src = e.target.src;
    lightboxImg.alt = e.target.alt;
    lightbox.classList.add('is-open');
  }
});

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightboxImg.src = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
