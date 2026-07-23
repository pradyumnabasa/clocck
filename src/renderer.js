const { ipcRenderer } = require('electron');

// --- Elements ---
const dateDisplay = document.getElementById('date-display');
const cardHours = document.getElementById('card-hours');
const cardMinutes = document.getElementById('card-minutes');
const cardSeconds = document.getElementById('card-seconds');

const tabClock = document.getElementById('tab-clock');
const tabPomodoro = document.getElementById('tab-pomodoro');
const tabTimer = document.getElementById('tab-timer');

const clockContainer = document.getElementById('clock-container');
const timerContainer = document.getElementById('timer-container');
const timerDisplay = document.getElementById('timer-display');
const btnTimerStart = document.getElementById('btn-timer-start');
const btnTimerReset = document.getElementById('btn-timer-reset');

const overlay = document.getElementById('screensaver-overlay');

// --- State ---
let clockInterval;
let timerInterval;
let currentMode = 'clock'; // 'clock', 'pomodoro', 'timer'
let timerSeconds = 25 * 60; // default 25 min
let timerRunning = false;
let isScreensaver = false;

// --- Clock Logic ---
function formatNumber(num) {
  return num.toString().padStart(2, '0');
}

function updateDate() {
  const now = new Date();
  const options = { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' };
  // e.g. "22 Jul 2026 Wed"
  const dateStr = now.toLocaleDateString('en-GB', options).replace(/,/g, '');
  
  // Custom format to match requirement "22 Jul 2026 Wed" exactly if needed.
  // toLocaleDateString('en-GB') gives "Wed, 22 Jul 2026". We can manually format:
  const day = formatNumber(now.getDate());
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();
  const weekday = now.toLocaleString('en-US', { weekday: 'short' });
  dateDisplay.innerText = `${day} ${month} ${year} ${weekday}`;
}

function flip(cardElement, newValue) {
  const topHalf = cardElement.querySelector('.digit-top');
  const bottomHalf = cardElement.querySelector('.digit-bottom');
  const currentValue = topHalf.innerText;

  if (currentValue === newValue) return;

  // Set top half to new value immediately for next state, but we cover it with flipper
  const flipperTop = document.createElement('div');
  flipperTop.classList.add('flipper-top');
  flipperTop.innerText = currentValue;

  const flipperBottom = document.createElement('div');
  flipperBottom.classList.add('flipper-bottom');
  flipperBottom.innerText = newValue;

  topHalf.innerText = newValue; // Update static top to new value (behind flipper)

  cardElement.appendChild(flipperTop);
  cardElement.appendChild(flipperBottom);

  // Clean up flippers after animation (0.5s + 0.5s = 1s total roughly)
  setTimeout(() => {
    bottomHalf.innerText = newValue;
    if(flipperTop.parentNode) flipperTop.remove();
    if(flipperBottom.parentNode) flipperBottom.remove();
  }, 1000);
}

function updateClock() {
  if (currentMode !== 'clock') return;
  const now = new Date();
  const h = formatNumber(now.getHours());
  const m = formatNumber(now.getMinutes());
  const s = formatNumber(now.getSeconds());

  flip(cardHours, h);
  flip(cardMinutes, m);
  flip(cardSeconds, s);
}

function startClock() {
  updateDate();
  updateClock();
  clockInterval = setInterval(() => {
    if (new Date().getSeconds() === 0) updateDate();
    updateClock();
  }, 1000);
}

// --- Tabs & Modes ---
function switchMode(mode) {
  currentMode = mode;
  tabClock.classList.remove('active');
  tabPomodoro.classList.remove('active');
  tabTimer.classList.remove('active');

  clockContainer.style.display = 'none';
  timerContainer.style.display = 'none';

  if (mode === 'clock') {
    tabClock.classList.add('active');
    clockContainer.style.display = 'flex';
  } else if (mode === 'pomodoro') {
    tabPomodoro.classList.add('active');
    timerContainer.style.display = 'flex';
    timerSeconds = 25 * 60;
    updateTimerDisplay();
  } else if (mode === 'timer') {
    tabTimer.classList.add('active');
    timerContainer.style.display = 'flex';
    timerSeconds = 15 * 60; // Default 15 min timer
    updateTimerDisplay();
  }
}

tabClock.addEventListener('click', () => switchMode('clock'));
tabPomodoro.addEventListener('click', () => switchMode('pomodoro'));
tabTimer.addEventListener('click', () => switchMode('timer'));

// --- Timer / Pomodoro Logic ---
function updateTimerDisplay() {
  const m = formatNumber(Math.floor(timerSeconds / 60));
  const s = formatNumber(timerSeconds % 60);
  timerDisplay.innerText = `${m}:${s}`;
}

btnTimerStart.addEventListener('click', () => {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    btnTimerStart.innerText = 'Start';
  } else {
    timerRunning = true;
    btnTimerStart.innerText = 'Pause';
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        timerRunning = false;
        btnTimerStart.innerText = 'Start';
        // Play notification sound here
      }
    }, 1000);
  }
});

btnTimerReset.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
  btnTimerStart.innerText = 'Start';
  timerSeconds = currentMode === 'pomodoro' ? 25 * 60 : 15 * 60;
  updateTimerDisplay();
});

// --- Initialization ---
startClock();

// --- Screensaver Mode ---
ipcRenderer.on('screensaver-mode', (event, active) => {
  isScreensaver = active;
  if (isScreensaver) {
    overlay.style.display = 'block';
    
    // Hide cursor after 3 seconds of inactivity
    let cursorTimer;
    document.onmousemove = function(e) {
      document.body.style.cursor = 'default';
      clearTimeout(cursorTimer);
      cursorTimer = setTimeout(() => {
        document.body.style.cursor = 'none';
      }, 3000);
    };

    // Exit on interaction
    const exitScreensaver = () => {
      ipcRenderer.send('exit-screensaver');
    };
    
    // Require substantial mouse movement to avoid accidental exits
    let startX, startY;
    document.addEventListener('mousemove', (e) => {
      if(startX === undefined) {
        startX = e.clientX;
        startY = e.clientY;
      }
      if(Math.abs(e.clientX - startX) > 50 || Math.abs(e.clientY - startY) > 50) {
        exitScreensaver();
      }
    });

    document.addEventListener('mousedown', exitScreensaver);
    document.addEventListener('keydown', exitScreensaver);
  }
});
