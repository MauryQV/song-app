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

// Cargar letras
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
    el.addEventListener('click', () => seekTo(line.time));
    lyricsContainer.appendChild(el);
  });
}

// Play / Pause
btnPlay.addEventListener('click', () => {
  if (activeTrack.paused) {
    activeTrack.play();
    btnPlay.textContent = '⏸';
  } else {
    activeTrack.pause();
    btnPlay.textContent = '▶';
  }
});

// Toggle vocal / instrumental
btnToggle.addEventListener('click', () => {
  const time = activeTrack.currentTime;
  const playing = !activeTrack.paused;
  activeTrack.pause();
  activeTrack = activeTrack === vocal ? instr : vocal;
  activeTrack.currentTime = time;
  if (playing) activeTrack.play();
  btnToggle.textContent = activeTrack === vocal ? '🎤 Con voz' : '🎵 Sin voz';
});

// Sincronización de letras
activeTrack.addEventListener('timeupdate', syncLyrics);

function syncLyrics() {
  const t = activeTrack.currentTime;

  // Progress bar
  const pct = (t / activeTrack.duration) * 100;
  progressFill.style.width = pct + '%';

  // Tiempo
  currentTimeEl.textContent = formatTime(t);
  totalTimeEl.textContent = formatTime(activeTrack.duration);

  // Línea activa
  let idx = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (t >= lyrics[i].time) { idx = i; break; }
  }

  if (idx !== currentIndex) {
    currentIndex = idx;
    document.querySelectorAll('#lyrics-container p').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
      el.classList.toggle('past', i < idx);
    });
    // Scroll automático
    const activeEl = lyricsContainer.querySelector('.active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// Clic en progress bar para navegar
document.getElementById('progress-bar').addEventListener('click', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  activeTrack.currentTime = pct * activeTrack.duration;
});

// Clic en línea para saltar al momento
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

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}