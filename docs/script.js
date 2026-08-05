// Tweak script.js: slower timings, deck labels with suits, centered visuals, delayed attempts increment, lorem match %.

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  startUUIDLoop();
  startDeckLoop();
  startLoremLoop();
  initVisitorSatire();
});

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

/* Satirical visitor */
function initVisitorSatire(){
  const el = document.getElementById('visitorCount');
  try{
    const k='mve_satire_visitor_v1';
    let v = sessionStorage.getItem(k);
    if(!v){v = String(420 + Math.floor(Math.random()*41580)); sessionStorage.setItem(k,v)}
    el.textContent = `${Number(v).toLocaleString()} (probably)`;
  }catch(e){ el.textContent='a humongous number (probably)'; }
}

/* Utilities */
function randomUUIDv4(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c=>{
    const r = (Math.random()*16)|0; const v = c==='x' ? r : (r&0x3|0x8); return v.toString(16);
  });
}

/* ---------------- UUID ---------------- */
async function startUUIDLoop(){
  const aEl = document.getElementById('uuid-a');
  const bEl = document.getElementById('uuid-b');
  const attemptsEl = document.getElementById('uuid-attempts');
  const matchesEl = document.getElementById('uuid-matches');
  const resultEl = document.getElementById('uuid-result');

  let attempts=0, matches=0;
  const charDelay = 60; // slower typing for streams
  const postRunWait = 1000; // 1s pause before attempts increment

  async function runOnce(){
    const a = randomUUIDv4();
    const b = randomUUIDv4();

    // reveal A
    aEl.textContent='';
    for(let i=0;i<a.length;i++){ aEl.textContent += a[i]; await sleep(charDelay); }
    await sleep(120);
    // reveal B
    bEl.textContent='';
    for(let i=0;i<b.length;i++){ bEl.textContent += b[i]; await sleep(charDelay); }

    // compute result
    if(a===b){ matches++; matchesEl.textContent = matches; resultEl.textContent = 'MATCH!'; resultEl.style.color = '#ffd54f'; }
    else { resultEl.textContent = 'No match'; resultEl.style.color = '#cfeee6'; }

    // wait, then increment attempts
    await sleep(postRunWait);
    attempts++; attemptsEl.textContent = attempts;
    // clear result after brief time
    await sleep(600); resultEl.textContent='';
  }

  while(true){ try{ await runOnce(); }catch(e){console.error(e); await sleep(1000);} }
}

/* ---------------- Deck ---------------- */
// map index 0..51 to rank+suit (♣♦♥♠) - using standard order clubs, diamonds, hearts, spades
const SUITS = ['♣','♦','♥','♠'];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
function cardLabel(index){
  const suit = Math.floor(index/13); // 0..3
  const rankIndex = index % 13;
  return {label: RANKS[rankIndex], suit: SUITS[suit], color: (suit===1||suit===2)?'red':'black'}; // diamonds/hearts red
}

function makeDeck(){
  const arr = Array.from({length:52}, (_,i)=>i);
  for(let i=arr.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

async function startDeckLoop(){
  const canvas = document.getElementById('deck-canvas');
  const attemptsEl = document.getElementById('deck-attempts');
  const lastMatchesEl = document.getElementById('deck-last-matches');
  const resultEl = document.getElementById('deck-result');

  const DPR = window.devicePixelRatio || 1;
  function resize(){
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * DPR;
    canvas.height = rect.height * DPR;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }
  resize(); window.addEventListener('resize', resize);
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  const postRunWait = 1000;
  const perCardDelay = 140; // slower for stream

  function clearCanvas(){ ctx.clearRect(0,0,canvas.width/DPR,canvas.height/DPR); }

  function drawCardFace(x,y,w,h,rank,suit,color){
    // face
    roundRect(ctx,x,y,w,h,8,true,true);
    // rank and suit
    ctx.fillStyle = color==='red' ? '#c62828' : '#081018';
    ctx.font = '14px ui-monospace, monospace';
    ctx.textBaseline = 'middle';
    // small top-left
    ctx.fillText(rank + suit, x + 8, y + 12 + 2);
    // centered big label
    ctx.font = '16px ui-monospace, monospace';
    ctx.fillText(rank + suit, x + w/2 - (rank.length>1?14:6), y + h/2 + 4);
  }

  function roundRect(ctx,x,y,w,h,r,fill,stroke){ if(!r)r=6; ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill){ ctx.fillStyle='#ffffff'; ctx.fill(); } if(stroke){ ctx.strokeStyle='rgba(0,0,0,0.08)'; ctx.lineWidth=1; ctx.stroke(); } }

  function drawBackground(){
    ctx.clearRect(0,0,canvas.width/DPR,canvas.height/DPR);
    ctx.fillStyle = 'rgba(0,0,0,0.02)'; ctx.fillRect(0,0,canvas.width/DPR,canvas.height/DPR);
  }

  let attempts=0;
  while(true){
    try{
      const d1 = makeDeck();
      const d2 = makeDeck();

      // layout calculations
      const rect = canvas.getBoundingClientRect();
      const W = rect.width; const H = rect.height;
      const padding = 10;
      const cols = 13;
      const cardW = Math.min(56, (W - padding*2) / cols - 6);
      const cardH = 40;
      const spacingX = cardW + 6;
      const rowY1 = 12;
      const rowY2 = rowY1 + cardH + 12;

      drawBackground();
      // draw all cards progressively but keep previous ones visible
      for(let i=0;i<52;i++){
        const col = i % cols;
        const x = padding + col * spacingX;
        // draw for deck1
        const c1 = cardLabel(d1[i]);
        ctx.save();
        drawCardFace(x, rowY1, cardW, cardH, c1.label, c1.suit, c1.color);
        ctx.restore();
        // draw for deck2
        const c2 = cardLabel(d2[i]);
        ctx.save();
        drawCardFace(x, rowY2, cardW, cardH, c2.label, c2.suit, c2.color);
        ctx.restore();
        await sleep(perCardDelay + Math.random()*20);
      }

      // compare
      let matches=0;
      for(let i=0;i<52;i++){ if(d1[i]===d2[i]) matches++; }
      lastMatchesEl.textContent = matches;
      resultEl.textContent = matches===52 ? 'FULL MATCH! (inconceivable!)' : `${matches} positional matches`;

      // wait, then increment attempts
      await sleep(postRunWait);
      attempts++; attemptsEl.textContent = attempts;

      // keep visible briefly then clear
      await sleep(800);
      resultEl.textContent='';
      clearCanvas();

    }catch(e){ console.error(e); await sleep(800); }
  }
}

/* ---------------- Lorem ---------------- */
const LOREM_TARGET = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

async function startLoremLoop(){
  const display = document.getElementById('lorem-display');
  const attemptsEl = document.getElementById('lorem-attempts');
  const matchesEl = document.getElementById('lorem-matches');
  const percentEl = document.getElementById('lorem-percent-val');
  const resultEl = document.getElementById('lorem-result');

  const alphabet = "abcdefghijklmnopqrstuvwxyz ,.!?;:'\"-()".split('');
  const charDelay = 12;
  const postRunWait = 1000;

  let attempts = 0, matches = 0;

  async function runOnce(){
    let typed = '';
    display.textContent = '';
    for(let i=0;i<LOREM_TARGET.length;i++){
      const ch = alphabet[Math.floor(Math.random()*alphabet.length)];
      typed += ch;
      display.textContent = typed;
      await sleep(charDelay);
    }

    // compute per-character positional matches
    let same = 0;
    const total = LOREM_TARGET.length;
    for(let i=0;i<total;i++){ if(typed[i] === LOREM_TARGET[i]) same++; }
    const pct = (same/total)*100;
    percentEl.textContent = pct.toFixed(4) + '%';

    if(typed === LOREM_TARGET){ matches++; matchesEl.textContent = matches; resultEl.textContent = 'Exact match!'; }
    else { resultEl.textContent = 'No match'; }

    // wait then increment attempts
    await sleep(postRunWait);
    attempts++; attemptsEl.textContent = attempts;

    // keep result briefly
    await sleep(600); resultEl.textContent='';
  }

  while(true){ try{ await runOnce(); }catch(e){console.error(e); await sleep(1000);} }
}
