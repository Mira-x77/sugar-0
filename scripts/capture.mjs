import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'C:\\Users\\Admin\\AppData\\Local\\Temp\\opencode';
const PORT = 9333;
const URL = 'http://localhost:5173/';

await fs.mkdir(OUT, { recursive: true });
const profile = `${OUT}\\cdp-profile-${Date.now()}`;

const proc = spawn(EDGE, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--hide-scrollbars',
  '--use-angle=swiftshader',
  '--window-size=1440,1000',
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jsonList() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  return res.json();
}

let targets = null;
for (let i = 0; i < 80; i++) {
  try {
    targets = await jsonList();
    if (targets?.length) break;
  } catch {}
  await sleep(250);
}
if (!targets?.length) throw new Error('no CDP targets');

const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let seq = 0;
const pending = new Map();
const events = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
    return;
  }
  if (msg.method && events.has(msg.method)) {
    for (const fn of events.get(msg.method)) fn(msg.params);
  }
};

function send(method, params = {}) {
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
function once(method) {
  return new Promise((resolve) => {
    const fn = (params) => { events.get(method).delete(fn); resolve(params); };
    if (!events.has(method)) events.set(method, new Set());
    events.get(method).add(fn);
  });
}
async function evaluate(expression) {
  const { result } = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return result?.value;
}

await send('Page.enable');
await send('Runtime.enable');

const loaded = once('Page.loadEventFired');
await send('Page.navigate', { url: URL });
await loaded;
await sleep(5500);

async function resize(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await sleep(600);
}

async function scrollToSelector(selector, offset = 80) {
  await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - ${offset});
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
    window.dispatchEvent(new Event('resize'));
    return y;
  })()`);
  await sleep(1400);
}

async function capture(name, clip) {
  const params = { format: 'png', fromSurface: true };
  if (clip) params.clip = { ...clip, scale: 1 };
  const { data } = await send('Page.captureScreenshot', params);
  const file = `${OUT}\\${name}.png`;
  await fs.writeFile(file, Buffer.from(data, 'base64'));
  console.log('saved', file);
}

async function sectionShot(name, selector) {
  await scrollToSelector(selector);
  const box = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    const r = el.getBoundingClientRect();
    return { y: Math.round(r.top + window.scrollY), h: Math.round(r.height), w: innerWidth };
  })()`);
  await capture(name, { x: 0, y: box.y, width: box.w, height: Math.min(box.h, 2200) });
  return box;
}

/* Desktop */
await resize(1440, 1000);
await evaluate('window.scrollTo(0,0); window.__lenis?.scrollTo(0,{immediate:true}); window.scrollTo(0,0);');
await sleep(900);
await capture('hero-1440');

await sectionShot('studio-1440', '#studio');
await sectionShot('why-1440', '#why');

/* Mobile */
await resize(390, 844);
await evaluate('window.scrollTo(0,0); window.__lenis?.scrollTo(0,{immediate:true}); window.scrollTo(0,0);');
await sleep(900);
await capture('hero-390');
await sectionShot('studio-390', '#studio');
await sectionShot('why-390', '#why');

ws.close();
proc.kill();
await sleep(400);
process.exit(0);
