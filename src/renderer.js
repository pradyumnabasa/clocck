const { ipcRenderer } = require('electron');

// --- Elements ---
const dateDisplay = document.getElementById('date-display');
const quoteDisplay = document.getElementById('quote-display');
const cardHours = document.getElementById('card-hours');
const cardMinutes = document.getElementById('card-minutes');
const cardSeconds = document.getElementById('card-seconds');
const clockContainer = document.getElementById('clock-container');
const overlay = document.getElementById('screensaver-overlay');

// --- State ---
let clockInterval;
let isScreensaver = false;

// --- Funny Quotes Logic ---
const funnyQuotes = [
  "\"Procrastination is the art of keeping up with yesterday.\"",
  "\"I'm not lazy, I'm just on energy-saving mode.\"",
  "\"I put my phone in airplane mode, but it's not flying.\"",
  "\"My favorite exercise is a cross between a lunge and a crunch... I call it lunch.\"",
  "\"I have a lot of growing up to do. I realized that the other day inside my fort.\"",
  "\"I can resist everything except temptation.\"",
  "\"I love deadlines. I love the whooshing noise they make as they go by.\"",
  "\"The only thing standing between you and your goal is the bullshit story you keep telling yourself as to why you can't achieve it.\"",
  "\"I am so clever that sometimes I don't understand a single word of what I am saying.\"",
  "\"People say nothing is impossible, but I do nothing every day.\""
];

function updateQuote() {
  const randomIndex = Math.floor(Math.random() * funnyQuotes.length);
  quoteDisplay.style.opacity = 0; // Fade out
  
  setTimeout(() => {
    quoteDisplay.innerText = funnyQuotes[randomIndex];
    quoteDisplay.style.opacity = 0.9; // Fade in
  }, 500); // Wait for fade out to complete
}

// Update quote every 1 minute
setInterval(updateQuote, 60000);
updateQuote(); // Initial call

// --- Clock Logic ---
function formatNumber(num) {
  return num.toString().padStart(2, '0');
}

function updateDate() {
  const now = new Date();
  const options = { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' };
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

  const flipperTop = document.createElement('div');
  flipperTop.classList.add('flipper-top');
  flipperTop.innerText = currentValue;

  const flipperBottom = document.createElement('div');
  flipperBottom.classList.add('flipper-bottom');
  flipperBottom.innerText = newValue;

  topHalf.innerText = newValue;

  cardElement.appendChild(flipperTop);
  cardElement.appendChild(flipperBottom);

  setTimeout(() => {
    bottomHalf.innerText = newValue;
    if(flipperTop.parentNode) flipperTop.remove();
    if(flipperBottom.parentNode) flipperBottom.remove();
  }, 1000);
}

function updateClock() {
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
