const vocal = document.getElementById('audio-vocal');
const instr = document.getElementById('audio-instr');
const btnPlay = document.getElementById('btn-play');
const btnToggle = document.getElementById('btn-toggle');
const lyricsContainer = document.getElementById('lyrics-container');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

let activeTrack = vocal;
let lyrics = [];
let currentIndex = -1;
let offset = 0.0;

fetch('lyrics.json')
  .then(r => r.json())
  .then(data => {
    lyrics = data;
    renderLyrics();
  });

function renderLyrics() {
  lyricsContainer.innerHTML = '';
  lyrics.forEach((line, i) => {
    const el = document.createElement('p');
    el.textContent = line.text;
    el.dataset.index = i;
    el.addEventListener('click', () => seekTo(line.start));
    lyricsContainer.appendChild(el);
  });
}

btnPlay.addEventListener('click', () => {
  if (activeTrack.paused) {
    activeTrack.play();
    btnPlay.textContent = '⏸';
  } else {
    activeTrack.pause();
    btnPlay.textContent = '▶';
  }
});

btnToggle.addEventListener('click', () => {
  const time = activeTrack.currentTime;
  const playing = !activeTrack.paused;
  activeTrack.pause();
  activeTrack = activeTrack === vocal ? instr : vocal;
  activeTrack.currentTime = time;
  if (playing) activeTrack.play();
  btnToggle.textContent = activeTrack === vocal ? ' Con voz' : ' Sin voz';
});

activeTrack.addEventListener('timeupdate', syncLyrics);

function syncLyrics() {
  const t = activeTrack.currentTime + offset;

  // Progress bar general
  const pct = (t / activeTrack.duration) * 100;
  progressFill.style.width = pct + '%';

  currentTimeEl.textContent = formatTime(t);
  totalTimeEl.textContent = formatTime(activeTrack.duration);

  // Buscar línea activa usando start y end
  let idx = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (t >= lyrics[i].start && t <= lyrics[i].end) {
      idx = i;
      break;
    }
  }

  // Highlight y clases
  document.querySelectorAll('#lyrics-container p').forEach((el, i) => {
    const line = lyrics[i];
    const isPast = t > line.end;
    const isActive = i === idx;

    el.classList.toggle('active', isActive);
    el.classList.toggle('past', isPast && !isActive);
    el.classList.remove('inactive');
    if (!isActive && !isPast) el.classList.add('inactive');
  });

  // Scroll automático
  if (idx !== currentIndex) {
    currentIndex = idx;
    const activeEl = lyricsContainer.querySelector('.active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

document.getElementById('progress-bar').addEventListener('click', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  activeTrack.currentTime = pct * activeTrack.duration;
});

function seekTo(time) {
  activeTrack.currentTime = time;
  if (activeTrack.paused) {
    activeTrack.play();
    btnPlay.textContent = '⏸';
  }
}

function formatTime(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}