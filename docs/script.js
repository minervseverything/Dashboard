// script.js
// Interactive computations and UI logic for MinerVsEverything static site
// Visitor counter is currently a satirical random estimate ("probably") until a global counter is added.

// -------- Utilities for big probabilities and formatting ----------
function formatScientific(log10Val) {
  if (!isFinite(log10Val)) return "0";
  const sign = log10Val < 0 ? -1 : 1;
  const abs = Math.abs(log10Val);
  const mant = Math.pow(10, abs - Math.floor(abs));
  const exp = Math.floor(abs) * sign;
  return mant.toFixed(3) + "e" + (exp >= 0 ? "+" + exp : exp);
}

function ratioToMiner(log10Event, log10Miner) {
  const log10ratio = log10Event - log10Miner;
  if (!isFinite(log10ratio)) return "—";
  if (log10ratio > 0) {
    return `~10^${log10ratio.toFixed(2)}× more likely`;
  } else {
    return `~10^${log10ratio.toFixed(2)}× less likely`;
  }
}

// -------- Miner probability calculations ----------
function computeMinerPerBlockLog10(minerHashRateHps, networkEh) {
  const networkHps = Number(networkEh) * 1e18;
  const p = minerHashRateHps / networkHps;
  return Math.log10(p);
}

// -------- Specific event math (log10 of probabilities) --------
function uuidPairLog10() {
  const log10 = -122 * Math.log10(2);
  return log10;
}

function deckSameOrderLog10() {
  let s = 0;
  for (let k = 2; k <= 52; k++) s += Math.log10(k);
  return -s;
}

function loremExactLog10(text) {
  const Lfull = text.length;
  const alphabetSize = 27; // a-z + space (approx)
  const log10 = -Lfull * Math.log10(alphabetSize);
  return { log10, Lfull, alphabetSize };
}

// -------- UI & visuals --------
document.addEventListener("DOMContentLoaded", () => {
  const visitorCountEl = document.getElementById("visitorCount");
  const yearEl = document.getElementById("year");
  yearEl.textContent = new Date().getFullYear();

  const minerHashInput = document.getElementById("minerHash");
  const minerUnit = document.getElementById("minerUnit");
  const networkHash = document.getElementById("networkHash");
  const applyBtn = document.getElementById("applySettings");

  const uuidProbEl = document.getElementById("uuid-prob");
  const uuidCompareEl = document.getElementById("uuid-compare");
  const deckProbEl = document.getElementById("deck-prob");
  const deckCompareEl = document.getElementById("deck-compare");
  const loremProbEl = document.getElementById("lorem-prob");
  const loremCompareEl = document.getElementById("lorem-compare");

  const uuidCanvas = document.getElementById("uuid-canvas");
  const deckCanvas = document.getElementById("deck-canvas");
  const loremCanvas = document.getElementById("lorem-canvas");

  const uuidResult = document.getElementById("uuid-result");
  const deckResult = document.getElementById("deck-result");
  const loremResult = document.getElementById("lorem-result");

  const uuidSim = document.getElementById("uuid-simulate");
  const uuidRun = document.getElementById("uuid-run");
  const deckSim = document.getElementById("deck-simulate");
  const deckRun = document.getElementById("deck-run");
  const loremSim = document.getElementById("lorem-simulate");
  const loremRun = document.getElementById("lorem-run");

  const loremText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

  // Satirical random visitor estimate:
  function initVisitorSatire() {
    // generate a random but stable-ish number per browser session to avoid jumping every reload
    const KEY = "mve_satire_visitor_v1";
    try {
      let value = sessionStorage.getItem(KEY);
      if (!value) {
        // pick between 420 and 42,000 for comedic effect
        const rnd = Math.floor(420 + Math.random() * 41580);
        value = rnd.toString();
        sessionStorage.setItem(KEY, value);
      }
      visitorCountEl.textContent = `${Number(value).toLocaleString()} (probably)`;
    } catch (e) {
      visitorCountEl.textContent = "a humongous number (probably)";
    }
  }

  initVisitorSatire();

  function getMinerLog10() {
    const minerVal = Number(minerHashInput.value) || 1;
    const unit = Number(minerUnit.value) || 1e12;
    const minerHps = minerVal * unit;
    const networkEH = Number(networkHash.value) || 400;
    return computeMinerPerBlockLog10(minerHps, networkEH);
  }

  function updateAllDisplays() {
    const minerLog10 = getMinerLog10();
    const uuidLog10 = uuidPairLog10();
    uuidProbEl.textContent = `≈ 10^${uuidLog10.toFixed(2)}  (≈ ${Math.pow(10, uuidLog10).toExponential(3)})`;
    uuidCompareEl.textContent = ratioToMiner(uuidLog10, minerLog10);

    const deckLog10 = deckSameOrderLog10();
    deckProbEl.textContent = `≈ 10^${deckLog10.toFixed(2)}  (≈ ${Math.pow(10, deckLog10).toExponential(3)})`;
    deckCompareEl.textContent = ratioToMiner(deckLog10, minerLog10);

    const loremData = loremExactLog10(loremText);
    loremProbEl.textContent = `≈ 10^${loremData.log10.toFixed(2)}  (alphabet=${loremData.alphabetSize}, L=${loremData.Lfull})`;
    loremCompareEl.textContent = ratioToMiner(loremData.log10, minerLog10);
  }

  updateAllDisplays();
  applyBtn.addEventListener("click", () => updateAllDisplays());

  function drawPulse(canvas, color) {
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    let t = 0;
    let raf;
    function step() {
      t += 0.03;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0,0,w,h);
      const r = Math.min(w,h)/2 - 6;
      const cx = w/2, cy=h/2;
      ctx.beginPath();
      ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fill();
      const alpha = (Math.sin(t)*0.5+0.5)*0.6;
      ctx.beginPath();
      ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${alpha})`;
      ctx.stroke();
      raf = requestAnimationFrame(step);
    }
    step();
    return () => cancelAnimationFrame(raf);
  }

  const stopUuid = drawPulse(uuidCanvas, {r:0,g:209,b:178});
  const stopDeck = drawPulse(deckCanvas, {r:107,g:75,b:209});
  const stopLorem = drawPulse(loremCanvas, {r:255,g:183,b:77});

  function randomUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random()*16)|0;
      const v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  uuidSim.addEventListener("click", async () => {
    uuidResult.textContent = "Animating UUID generation (look for collisions)…";
    let shown = 0;
    for (let i=0;i<200;i++){
      const u = randomUUIDv4();
      shown++;
      uuidResult.textContent = `Generated ${shown} UUIDs — none matched (expected)`;
      await new Promise(r => setTimeout(r, 18));
    }
    uuidResult.textContent = `Generated ${shown} UUIDs — no collisions observed (this is expected; probability≈${formatScientific(uuidPairLog10())})`;
  });

  uuidRun.addEventListener("click", async () => {
    uuidResult.textContent = "Running Monte Carlo (10,000 pairs)…";
    let collisions = 0;
    const trials = 10000;
    for (let i=0;i<trials;i++){
      const a = randomUUIDv4();
      const b = randomUUIDv4();
      if (a === b) collisions++;
      if (i % 500 === 0) await new Promise(r => setTimeout(r, 2));
    }
    uuidResult.textContent = `Out of ${trials} random pairs: collisions=${collisions}. (Expected 0 — theoretical prob per pair ≈10^${uuidPairLog10().toFixed(2)})`;
  });

  deckSim.addEventListener("click", async () => {
    deckResult.textContent = "Animating two shuffles…";
    function shuffleDeck(){
      const deck = Array.from({length:52},(_,i)=>i+1);
      for (let i=deck.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
    }
    let cycles = 8;
    while (cycles-->0){
      const d1 = shuffleDeck();
      const d2 = shuffleDeck();
      deckResult.textContent = `Comparing top 8 cards: ${d1.slice(0,8).join(",")} vs ${d2.slice(0,8).join(",")}`;
      await new Promise(r => setTimeout(r, 300));
    }
    deckResult.textContent = `Full-shuffle animation complete. Exact deck-order matches extremely unlikely (prob ≈10^${deckSameOrderLog10().toFixed(2)})`;
  });

  deckRun.addEventListener("click", async () => {
    deckResult.textContent = "Monte Carlo on full-order equality (this will run 1,000 trials)…";
    function shuffleDeck(){
      const deck = Array.from({length:52},(_,i)=>i+1);
      for (let i=deck.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
    }
    let matches = 0;
    const trials = 1000;
    for (let t=0;t<trials;t++){
      const a = shuffleDeck().join(",");
      const b = shuffleDeck().join(",");
      if (a === b) matches++;
      if (t % 100 === 0) await new Promise(r => setTimeout(r, 2));
    }
    deckResult.textContent = `Out of ${trials} independent shuffles: exact matches = ${matches}. (Theoretical ≈10^${deckSameOrderLog10().toFixed(2)})`;
  });

  loremSim.addEventListener("click", async () => {
    loremResult.textContent = "Simulating random typing…";
    let typed = "";
    for (let i = 0; i < loremText.length; i++) {
      const chars = "abcdefghijklmnopqrstuvwxyz ";
      typed += chars.charAt(Math.floor(Math.random() * chars.length));
      loremResult.textContent = typed;
      await new Promise(r => setTimeout(r, 12));
    }
    loremResult.textContent = "Random typing produced an unlikely string — exact lorem match probability is astronomically small.";
  });

  loremRun.addEventListener("click", () => {
    const ld = loremExactLog10(loremText);
    loremResult.textContent = `Assuming 27 symbols (a-z + space), length=${ld.Lfull}: log10(prob) ≈ ${ld.log10.toFixed(2)} → probability ≈ 10^${ld.log10.toFixed(2)}`;
  });

  updateAllDisplays();
});
