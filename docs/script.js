// Continuous live visuals for the three absurd computations.
// Starts all three loops automatically on page load.

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  startUUIDLoop();
  startDeckLoop();
  startLoremLoop();
  initVisitorSatire();
});

/* -------------------------
   Utility functions
   ------------------------- */
function randomUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random()*16)|0;
    const v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

/* -------------------------
   Satirical visitor counter
   ------------------------- */
function initVisitorSatire() {
  const el = document.getElementById('visitorCount');
  try {
    const KEY = 'mve_satire_visitor_v1';
    let v = sessionStorage.getItem(KEY);
    if (!v) {
      v = String(420 + Math.floor(Math.random() * 41580));
      sessionStorage.setItem(KEY, v);
    }
    el.textContent = `${Number(v).toLocaleString()} (probably)`;
  } catch (e) {
    el.textContent = 'a humongous number (probably)';
  }
}

/* -------------------------
   UUID continuous loop
   ------------------------- */
async function startUUIDLoop() {
  const aEl = document.getElementById('uuid-a');
  const bEl = document.getElementById('uuid-b');
  const attemptsEl = document.getElementById('uuid-attempts');
  const matchesEl = document.getElementById('uuid-matches');
  const resultEl = document.getElementById('uuid-result');

  let attempts = 0, matches = 0;

  async function runOnce() {
    attempts++;
    attemptsEl.textContent = attempts;

    const a = randomUUIDv4();
    const b = randomUUIDv4();

    // Typewriter style reveal for A then B
    aEl.textContent = '';
    for (let i=0;i<a.length;i++){
      aEl.textContent += a[i];
      await sleep(12);
    }
    await sleep(80);

    bEl.textContent = '';
    for (let i=0;i<b.length;i++){
      bEl.textContent += b[i];
      await sleep(12);
    }
    await sleep(80);

    if (a === b) {
      matches++;
      matchesEl.textContent = matches;
      resultEl.textContent = 'MATCH! (rare)';
    } else {
      resultEl.textContent = 'No match';
    }

    // brief pause, then clear result and continue
    await sleep(700 + Math.random()*800);
    // keep last two UUIDs visible but fade result
    resultEl.textContent = '';
  }

  // continuous loop
  while (true) {
    try { await runOnce(); } catch(e) { console.error(e); await sleep(500); }
  }
}

/* -------------------------
   Deck continuous loop & visuals (canvas)
   - Two independent shuffles
   - Animates placing of cards into two rows; when 52 done compares positions
   ------------------------- */
function makeDeck() {
  const deck = Array.from({length:52}, (_,i)=>i+1);
  for (let i=deck.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

async function startDeckLoop() {
  const canvas = document.getElementById('deck-canvas');
  const attemptsEl = document.getElementById('deck-attempts');
  const lastMatchesEl = document.getElementById('deck-last-matches');
  const resultEl = document.getElementById('deck-result');

  const DPR = window.devicePixelRatio || 1;
  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(420, rect.width) * DPR;
    canvas.height = Math.max(160, rect.height) * DPR;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  let attempts = 0;

  function drawBackground(){
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0,0,rect.width,rect.height);
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    ctx.fillRect(0,0,rect.width,rect.height);
  }

  function drawCard(x, y, w, h, label, color='#ffffff') {
    ctx.fillStyle = '#08363a';
    ctx.strokeStyle = '#0ea391';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, w, h, 6, true, true);
    ctx.fillStyle = '#dbeff0';
    ctx.font = '12px ui-monospace, monospace';
    ctx.fillText(label, x + 6, y + h/2 + 4);
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  async function runOnce() {
    attempts++;
    attemptsEl.textContent = attempts;

    const d1 = makeDeck();
    const d2 = makeDeck();

    // animate placing cards left-to-right in two rows
    const rect = canvas.getBoundingClientRect();
    const padding = 8;
    const cardW = Math.min(48, (rect.width - padding*2) / 13 - 4); // 13 per row visually
    const cardH = 26;
    const spacingX = cardW + 6;
    const rowY1 = 16;
    const rowY2 = 16 + cardH + 10;

    drawBackground();

    // progressively draw cards
    for (let i=0;i<52;i++){
      const col = i % 13;
      const x = padding + col * spacingX;
      // left deck row (d1)
      drawCard(x, rowY1, cardW, cardH, `#${d1[i]}`);
      // right deck row (d2)
      drawCard(x, rowY2, cardW, cardH, `#${d2[i]}`);
      await sleep(30 + Math.random()*20);
      // small highlight for last placed card
      if (i % 8 === 0) { /* occasional repaint to reduce flicker */ }
    }

    // compare positions
    let matches = 0;
    for (let i=0;i<52;i++){
      if (d1[i] === d2[i]) matches++;
    }
    lastMatchesEl.textContent = matches;
    resultEl.textContent = matches === 52 ? 'FULL MATCH! (inconceivable!)' : `${matches} positional matches`;
    // pause before next attempt
    await sleep(1200 + Math.random()*800);
    resultEl.textContent = '';
    // clear canvas for next run
    drawBackground();
  }

  // loop forever
  drawBackground();
  while (true) {
    try { await runOnce(); } catch(e){ console.error(e); await sleep(500); }
  }
}

/* -------------------------
   Lorem Ipsum continuous loop
   - Typewriter display; randomly typed attempts pool characters and compare exact match
   ------------------------- */
const LOREM_TARGET = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

async function startLoremLoop(){
  const displayEl = document.getElementById('lorem-display');
  const attemptsEl = document.getElementById('lorem-attempts');
  const matchesEl = document.getElementById('lorem-matches');
  const resultEl = document.getElementById('lorem-result');

  let attempts = 0, matches = 0;

  const alphabet = "abcdefghijklmnopqrstuvwxyz ,.!?;:'\"-()".split('');

  async function runOnce(){
    attempts++; attemptsEl.textContent = attempts;
    // typewriter-style random typing
    let typed = '';
    for (let i=0;i<LOREM_TARGET.length;i++){
      // choose random character from alphabet (biased to letters and space but almost impossible to match)
      const ch = alphabet[Math.floor(Math.random()*alphabet.length)];
      typed += ch;
      displayEl.textContent = typed;
      // emulate typing speed
      await sleep(8 + Math.random()*24);
    }
    // after finishing, compare exact match
    if (typed === LOREM_TARGET) {
      matches++; matchesEl.textContent = matches;
      resultEl.textContent = 'Exact match! (astronomical)';
    } else {
      resultEl.textContent = 'No match';
    }
    // brief pause, then continue
    await sleep(900 + Math.random()*1200);
    resultEl.textContent = '';
  }

  while (true){
    try { await runOnce(); } catch(e){ console.error(e); await sleep(500); }
  }
}
