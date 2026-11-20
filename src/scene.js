import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/*  Canvas helpers                                                     */
/* ------------------------------------------------------------------ */
function canvas2d(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function drawSpaced(ctx, text, x, y, size, spacing, color, weight = 600) {
  ctx.save();
  ctx.font = `${weight} ${size}px "Manrope", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  let cx = x - total / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cx, y);
    cx += widths[i];
  });
  ctx.restore();
}

function drawLeaf(ctx, cx, cy, len, rot, color, alpha, vein = 'rgba(245,240,220,.22)') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -len / 2);
  ctx.bezierCurveTo(len * 0.34, -len * 0.18, len * 0.3, len * 0.3, 0, len / 2);
  ctx.bezierCurveTo(-len * 0.3, len * 0.3, -len * 0.34, -len * 0.18, 0, -len / 2);
  ctx.fill();
  ctx.strokeStyle = vein;
  ctx.lineWidth = Math.max(1, len * 0.006);
  ctx.beginPath();
  ctx.moveTo(0, -len / 2);
  ctx.lineTo(0, len / 2);
  for (let i = -3; i <= 3; i++) {
    const y = i * len * 0.11;
    if (!i) continue;
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(len * (i > 0 ? 0.16 : 0.13), y - len * 0.05, len * (i > 0 ? 0.24 : 0.22), y - len * 0.13);
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(-len * (i > 0 ? 0.13 : 0.16), y - len * 0.05, -len * (i > 0 ? 0.22 : 0.24), y - len * 0.13);
  }
  ctx.stroke();
  ctx.restore();
}

function makeLabelTexture(logo, kind) {
  const wide = kind === 'jar';
  const W = wide ? 3072 : 2048;
  const H = wide ? 760 : 620;
  const [c, ctx] = canvas2d(W, H);

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#061f15');
  bg.addColorStop(0.28, '#0d3524');
  bg.addColorStop(0.52, '#0b2d1e');
  bg.addColorStop(0.75, '#0a2a1c');
  bg.addColorStop(1, '#061c13');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // The paper grain
  for (let i = 0; i < 5500; i++) {
    const a = Math.random() * 0.035;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 0.8})`;
    const s = Math.random() * 2 + 0.4;
    ctx.fillRect(Math.random() * W, Math.random() * H, s, s);
  }

  // Botanical line-work, kept away from the front panel
  const leafColor = '#77a982';
  drawLeaf(ctx, W * 0.12, H * 0.78, H * 0.6, -0.65, leafColor, 0.13);
  drawLeaf(ctx, W * 0.19, H * 0.9, H * 0.48, 0.7, leafColor, 0.09);
  drawLeaf(ctx, W * 0.88, H * 0.82, H * 0.62, 0.55, leafColor, 0.12);
  drawLeaf(ctx, W * 0.81, H * 0.94, H * 0.45, -0.75, leafColor, 0.08);

  // Gold hairlines
  ctx.strokeStyle = 'rgba(214, 178, 113, 0.36)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.04, 26);
  ctx.lineTo(W * 0.96, 26);
  ctx.moveTo(W * 0.04, H - 26);
  ctx.lineTo(W * 0.96, H - 26);
  ctx.stroke();

  const cx = W / 2;
  const gold = '#d8ba7d';
  const cream = '#f2e8d2';

  if (wide) {
    const lw = 700;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, cx - lw / 2, 54, lw, lh);
    drawSpaced(ctx, 'PURE STEVIA EXTRACT', cx, 315, 25, 10, gold, 600);
    ctx.fillStyle = 'rgba(214,178,113,.5)';
    ctx.fillRect(cx - 190, 350, 380, 1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = cream;
    ctx.font = '500 66px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('100% Natural Sweetener', cx, 430);
    ctx.fillText('Zero Calories', cx, 508);
    drawSpaced(ctx, 'SWEETENED BY NATURE  ·  NURTURED BY SCIENCE', cx, 660, 17, 5.5, 'rgba(216,186,125,.78)', 600);
    drawSpaced(ctx, '100 g  ·  1 SCOOP = 1 TSP SUGAR', cx, 705, 12, 3.6, 'rgba(242,232,210,.5)', 600);
  } else {
    const lw = 560;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, cx - lw / 2, 46, lw, lh);
    drawSpaced(ctx, 'PURE STEVIA EXTRACT', cx, 238, 17, 7, gold, 600);
    ctx.fillStyle = 'rgba(214,178,113,.5)';
    ctx.fillRect(cx - 120, 264, 240, 1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = cream;
    ctx.font = '500 40px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('100% Natural Sweetener', cx, 316);
    ctx.fillText('Zero Calories', cx, 362);
    drawSpaced(ctx, 'SWEETENED BY NATURE  ·  NURTURED BY SCIENCE', cx, 500, 11, 4, 'rgba(216,186,125,.72)', 600);
    drawSpaced(ctx, '30 ml', cx, 558, 18, 4, 'rgba(242,232,210,.7)', 600);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function makeNoiseTexture(size = 256) {
  const [c, ctx] = canvas2d(size, size);
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 120 + Math.random() * 135;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function makeRidgedTexture() {
  const [c, ctx] = canvas2d(1024, 256);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 1024, 256);
  for (let x = 0; x < 1024; x += 8) {
    ctx.fillStyle = x % 16 === 0 ? '#b8b8b8' : '#585858';
    ctx.fillRect(x, 0, 3, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(6, 1);
  return tex;
}

function makeBackdropTexture() {
  const [c, ctx] = canvas2d(1400, 1000);
  const bg = ctx.createLinearGradient(0, 0, 400, 1000);
  bg.addColorStop(0, '#eaf7ef');
  bg.addColorStop(0.45, '#f2f8ee');
  bg.addColorStop(1, '#f7f3e7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1400, 1000);

  const glow = ctx.createRadialGradient(900, 430, 30, 900, 430, 560);
  glow.addColorStop(0, 'rgba(255, 252, 241, .95)');
  glow.addColorStop(0.45, 'rgba(250, 243, 223, .45)');
  glow.addColorStop(1, 'rgba(247, 243, 231, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1400, 1000);

  const mint = ctx.createRadialGradient(120, 780, 20, 120, 780, 520);
  mint.addColorStop(0, 'rgba(157, 218, 184, .32)');
  mint.addColorStop(1, 'rgba(157, 218, 184, 0)');
  ctx.fillStyle = mint;
  ctx.fillRect(0, 0, 1400, 1000);

  const gold = ctx.createRadialGradient(1120, 830, 20, 1120, 830, 420);
  gold.addColorStop(0, 'rgba(226, 195, 131, .22)');
  gold.addColorStop(1, 'rgba(226, 195, 131, 0)');
  ctx.fillStyle = gold;
  ctx.fillRect(0, 0, 1400, 1000);

  // faint botanical lines
  ctx.strokeStyle = 'rgba(10,42,29,.05)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(1070, 470, 220 + i * 42, 0, Math.PI * 2);
    ctx.stroke();
  }

  // fade the backdrop to transparent at the edges so the canvas never shows a hard rectangle
  const fade = ctx.createRadialGradient(700, 500, 200, 700, 500, 780);
  fade.addColorStop(0, 'rgba(0,0,0,1)');
  fade.addColorStop(0.6, 'rgba(0,0,0,1)');
  fade.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, 1400, 1000);
  ctx.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeLeafTexture() {
  const [c, ctx] = canvas2d(320, 640);
  ctx.clearRect(0, 0, 320, 640);
  ctx.save();
  ctx.translate(160, 320);
  const g = ctx.createLinearGradient(-80, 0, 100, 0);
  g.addColorStop(0, '#1f5d3b');
  g.addColorStop(0.45, '#4f9e5f');
  g.addColorStop(0.78, '#8ecb63');
  g.addColorStop(1, '#3f8a4c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -290);
  ctx.bezierCurveTo(120, -200, 112, 120, 0, 300);
  ctx.bezierCurveTo(-112, 120, -120, -200, 0, -290);
  ctx.fill();
  ctx.strokeStyle = 'rgba(232, 246, 212, .4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -280);
  ctx.lineTo(0, 292);
  for (let i = -5; i <= 5; i++) {
    const y = i * 48;
    if (!i) continue;
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(40, y - 24, 76, y - 58);
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(-40, y - 24, -76, y - 58);
  }
  ctx.stroke();
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeDotTexture() {
  const [c, ctx] = canvas2d(64, 64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,244,214,.9)');
  g.addColorStop(1, 'rgba(255,244,214,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function makeShadowTexture() {
  const [c, ctx] = canvas2d(512, 512);
  const g = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
  g.addColorStop(0, 'rgba(6,28,19,.45)');
  g.addColorStop(0.45, 'rgba(6,28,19,.18)');
  g.addColorStop(1, 'rgba(6,28,19,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(c);
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* ------------------------------------------------------------------ */
/*  Main scene                                                         */
/* ------------------------------------------------------------------ */
export async function initScene(canvas) {
  const parent = canvas.parentElement;
  if (!parent) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
  } catch (err) {
    parent.classList.add('no-webgl');
    return null;
  }

  const maxDpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(maxDpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.18, 8.1);

  // Environment for glass + metal reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.62;

  // Backdrop plane (also what the glass refracts)
  const backdropTex = makeBackdropTexture();
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 22),
    new THREE.MeshBasicMaterial({ map: backdropTex, depthWrite: false, toneMapped: false, transparent: true })
  );
  backdrop.position.set(0, 0, -7);
  scene.add(backdrop);

  // Lights
  scene.add(new THREE.AmbientLight(0xfff8ec, 0.55));
  const key = new THREE.DirectionalLight(0xfff2dd, 2.9);
  key.position.set(4.5, 6, 5.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9f0da, 1.7);
  fill.position.set(-5, 1.5, 3);
  scene.add(fill);
  const rim = new THREE.PointLight(0xffd49b, 26, 14, 2);
  rim.position.set(-2.5, 3.2, -2.5);
  scene.add(rim);
  const rim2 = new THREE.PointLight(0xa8e6c8, 16, 12, 2);
  rim2.position.set(4.2, 0.2, 2.6);
  scene.add(rim2);

  // Podium + rings
  const podiumMat = new THREE.MeshStandardMaterial({ color: 0xf1e8d5, roughness: 0.82, metalness: 0.02 });
  const podium = new THREE.Mesh(new THREE.CylinderGeometry(2.42, 2.52, 0.18, 96), podiumMat);
  podium.position.y = -1.6;
  scene.add(podium);
  const podiumEdge = new THREE.Mesh(
    new THREE.TorusGeometry(2.45, 0.012, 6, 140),
    new THREE.MeshStandardMaterial({ color: 0xc9a25e, metalness: 1, roughness: 0.28 })
  );
  podiumEdge.rotation.x = Math.PI / 2;
  podiumEdge.position.y = -1.51;
  scene.add(podiumEdge);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 4.6),
    new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false, opacity: 0.9 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.5;
  scene.add(shadow);

  const halo = new THREE.Group();
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xb08a4b, transparent: true, opacity: 0.36, depthWrite: false });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.72, 0.007, 6, 200), ringMat);
  ring1.position.set(0.15, 0.28, -1.1);
  ring1.rotation.x = 0.12;
  halo.add(ring1);
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(3.18, 0.005, 6, 200),
    new THREE.MeshBasicMaterial({ color: 0xb08a4b, transparent: true, opacity: 0.18, depthWrite: false })
  );
  ring2.position.set(0.3, 0.4, -2.1);
  ring2.rotation.x = -0.08;
  halo.add(ring2);
  scene.add(halo);

  // Product rig
  const pivot = new THREE.Group();
  pivot.position.y = -0.44;
  const spin = new THREE.Group();
  pivot.add(spin);
  scene.add(pivot);

  // Logo + assets
  const [logo, sachetImg] = await Promise.all([
    loadImage('/assets/logo-gold.png'),
    loadImage('/assets/sachet.webp'),
    document.fonts.ready
  ]);

  const fallbackLogo = document.createElement('canvas');
  if (!logo) {
    fallbackLogo.width = 900;
    fallbackLogo.height = 200;
    const fctx = fallbackLogo.getContext('2d');
    fctx.fillStyle = '#d8ba7d';
    fctx.font = 'italic 500 120px "Cormorant Garamond", serif';
    fctx.textAlign = 'center';
    fctx.fillText('Sugar-0%', 450, 135);
  }
  const logoSource = logo || fallbackLogo;

  const jarLabelTex = makeLabelTexture(logoSource, 'jar');
  const dropLabelTex = makeLabelTexture(logoSource, 'drop');
  const noiseTex = makeNoiseTexture();
  const ridgeTex = makeRidgedTexture();

  /* ---------------------------- JAR ---------------------------- */
  const jar = new THREE.Group();
  jar.visible = false;

  const glassProfile = [
    [0.012, -1.06], [0.7, -1.06], [0.94, -1.05], [1.015, -0.99], [1.045, -0.88],
    [1.045, 0.79], [1.02, 0.92], [0.89, 1.06], [0.855, 1.14], [0.87, 1.22],
    [0.9, 1.27], [0.9, 1.3]
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.055,
    transmission: 0.99,
    thickness: 0.55,
    ior: 1.46,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.15,
    side: THREE.DoubleSide,
    transparent: true
  });
  const glass = new THREE.Mesh(new THREE.LatheGeometry(glassProfile, 96), glassMat);
  jar.add(glass);

  // Powder body
  const powderMat = new THREE.MeshStandardMaterial({
    color: 0xf5f1e7,
    roughness: 0.96,
    metalness: 0,
    bumpMap: noiseTex,
    bumpScale: 0.035
  });
  const powder = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.98, 1.72, 72), powderMat);
  powder.position.y = -0.18;
  jar.add(powder);

  // Crystals on top
  const crystalGeo = new THREE.DodecahedronGeometry(0.042, 0);
  const crystalMat = new THREE.MeshStandardMaterial({ color: 0xfbf8ef, roughness: 0.55, metalness: 0.02 });
  const crystals = new THREE.InstancedMesh(crystalGeo, crystalMat, 210);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 210; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 0.86;
    dummy.position.set(Math.cos(a) * r, 0.68 + Math.random() * 0.09, Math.sin(a) * r);
    dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    const s = 0.55 + Math.random() * 1.15;
    dummy.scale.set(s, s * (0.6 + Math.random() * 0.6), s);
    dummy.updateMatrix();
    crystals.setMatrixAt(i, dummy.matrix);
  }
  jar.add(crystals);

  // Label
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(1.052, 1.052, 1.42, 96, 1, true),
    new THREE.MeshStandardMaterial({ map: jarLabelTex, roughness: 0.5, metalness: 0.12, envMapIntensity: 0.4 })
  );
  label.position.y = -0.19;
  label.rotation.y = Math.PI;
  jar.add(label);

  // Lid
  const lidProfile = [
    [0.86, 1.19], [0.96, 1.22], [1.01, 1.27], [1.02, 1.34], [1.02, 1.58],
    [1.005, 1.625], [0.97, 1.64], [0.9, 1.65], [0, 1.66]
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xbc7550,
    metalness: 1,
    roughness: 0.31,
    bumpMap: ridgeTex,
    bumpScale: 0.018,
    envMapIntensity: 1.35
  });
  const lid = new THREE.Mesh(new THREE.LatheGeometry(lidProfile, 96), copperMat);
  jar.add(lid);
  const lidRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.995, 0.011, 8, 120),
    new THREE.MeshStandardMaterial({ color: 0xe0b276, metalness: 1, roughness: 0.22 })
  );
  lidRim.rotation.x = Math.PI / 2;
  lidRim.position.y = 1.245;
  jar.add(lidRim);

  // A small mound of powder on the podium
  const mound = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf8f5ec, roughness: 1, bumpMap: noiseTex, bumpScale: 0.05 })
  );
  mound.scale.set(1.2, 0.22, 1);
  mound.position.set(1.65, -1.5, 0.65);
  jar.add(mound);

  spin.add(jar);

  /* --------------------------- SACHET -------------------------- */
  const sachetGroup = new THREE.Group();
  sachetGroup.visible = false;
  const sachetTex = sachetImg ? new THREE.Texture(sachetImg) : null;
  if (sachetTex) {
    sachetTex.colorSpace = THREE.SRGBColorSpace;
    sachetTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    sachetTex.needsUpdate = true;
  }
  const sachetGeo = new THREE.PlaneGeometry(1.55, 2.36, 20, 28);
  {
    const pos = sachetGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const edge = Math.pow(Math.abs(x) / 0.775, 8) * 0.055;
      const z = Math.cos(x * 4.2) * 0.012 + Math.sin(y * 3.2 + 0.5) * 0.014 - edge;
      pos.setZ(i, z);
    }
    sachetGeo.computeVertexNormals();
  }
  const sachetMat = new THREE.MeshStandardMaterial({
    map: sachetTex,
    transparent: true,
    alphaTest: 0.03,
    roughness: 0.58,
    metalness: 0.1,
    side: THREE.DoubleSide,
    envMapIntensity: 0.3
  });
  const sachet = new THREE.Mesh(sachetGeo, sachetMat);
  sachet.position.y = 0.12;
  sachet.rotation.set(0.015, -0.16, 0.015);
  sachetGroup.add(sachet);

  const sachetBack = new THREE.Mesh(sachetGeo.clone(), sachetMat.clone());
  sachetBack.material.opacity = 0.85;
  sachetBack.scale.setScalar(0.94);
  sachetBack.position.set(-0.52, 0.06, -0.35);
  sachetBack.rotation.set(0.02, 0.24, -0.035);
  sachetGroup.add(sachetBack);

  const sachetShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.4),
    new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, opacity: 0.35, depthWrite: false })
  );
  sachetShadow.rotation.x = -Math.PI / 2;
  sachetShadow.position.y = -1.0;
  sachetGroup.add(sachetShadow);
  spin.add(sachetGroup);

  /* --------------------------- DROPS --------------------------- */
  const drops = new THREE.Group();
  drops.visible = false;
  drops.scale.setScalar(1.05);

  const dropProfile = [
    [0.012, -1.0], [0.46, -1.0], [0.53, -0.95], [0.56, -0.83], [0.56, -0.08],
    [0.53, 0.03], [0.34, 0.16], [0.285, 0.24], [0.285, 0.38], [0.32, 0.42],
    [0.32, 0.47], [0.012, 0.47]
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const dropGlass = new THREE.Mesh(
    new THREE.LatheGeometry(dropProfile, 80),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.04,
      metalness: 0,
      transmission: 0.99,
      thickness: 0.35,
      ior: 1.46,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.2,
      side: THREE.DoubleSide,
      transparent: true
    })
  );
  drops.add(dropGlass);

  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.49, 0.51, 0.78, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0xd6b365,
      roughness: 0.18,
      metalness: 0,
      transmission: 0.72,
      thickness: 0.5,
      ior: 1.36,
      transparent: true,
      opacity: 0.86
    })
  );
  liquid.position.y = -0.56;
  drops.add(liquid);

  const dropLabel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.567, 0.567, 0.58, 80, 1, true),
    new THREE.MeshStandardMaterial({ map: dropLabelTex, roughness: 0.5, metalness: 0.12 })
  );
  dropLabel.position.y = -0.53;
  dropLabel.rotation.y = Math.PI;
  drops.add(dropLabel);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.315, 0.315, 0.17, 48),
    new THREE.MeshStandardMaterial({ color: 0xc9a25e, metalness: 1, roughness: 0.26, bumpMap: ridgeTex, bumpScale: 0.012 })
  );
  collar.position.y = 0.53;
  drops.add(collar);
  const collarRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.315, 0.012, 8, 60),
    new THREE.MeshStandardMaterial({ color: 0xe3c187, metalness: 1, roughness: 0.2 })
  );
  collarRing.rotation.x = Math.PI / 2;
  collarRing.position.y = 0.445;
  drops.add(collarRing);

  const bulb = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.155, 0.27, 12, 24),
    new THREE.MeshStandardMaterial({ color: 0xc9a25e, metalness: 0.95, roughness: 0.34 })
  );
  bulb.position.y = 0.77;
  bulb.scale.y = 1.05;
  drops.add(bulb);

  const pipette = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 1.0, 12),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, transmission: 0.9, thickness: 0.1, transparent: true })
  );
  pipette.position.y = -0.15;
  drops.add(pipette);

  spin.add(drops);

  /* --------------------------- LEAVES -------------------------- */
  const leafTex = makeLeafTexture();
  const leaves = [];
  const leafMat = new THREE.MeshBasicMaterial({
    map: leafTex,
    transparent: true,
    alphaTest: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const leafData = [
    [-2.6, 1.3, -1.0, 0.9, -0.5], [-2.2, 0.2, 0.6, 0.7, 1.4], [-2.9, -0.5, -0.4, 0.68, 2.4],
    [2.7, 1.55, -1.4, 0.95, 0.5], [2.9, 0.55, 0.1, 0.6, -1.1], [2.4, -0.7, 1.1, 0.8, -2.0],
    [-1.8, 1.9, 1.6, 0.5, 2.8], [1.75, 2.0, 1.4, 0.48, -0.7], [0.3, 2.2, -1.9, 0.55, 0.2],
    [-3.1, 1.6, -2.3, 0.72, 1.1], [3.2, -0.3, -2.0, 0.62, 2.2]
  ];
  leafData.forEach(([x, y, z, s, r], i) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.84), leafMat);
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(s);
    mesh.rotation.set(0.2 * Math.sin(i), r, 0.4 * Math.sin(i * 2));
    mesh.userData = { base: mesh.position.clone(), phase: i * 0.9, speed: 0.22 + Math.random() * 0.2, rot: r };
    leaves.push(mesh);
    scene.add(mesh);
  });

  /* --------------------------- DUST ---------------------------- */
  const dustCount = 240;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  const dustBase = [];
  for (let i = 0; i < dustCount; i++) {
    const x = (Math.random() - 0.5) * 7.5;
    const y = (Math.random() - 0.3) * 4.8;
    const z = (Math.random() - 0.5) * 4.5;
    dustPos[i * 3] = x;
    dustPos[i * 3 + 1] = y;
    dustPos[i * 3 + 2] = z;
    dustBase.push({ x, y, z, p: Math.random() * Math.PI * 2, s: 0.12 + Math.random() * 0.3 });
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      size: 0.035,
      map: makeDotTexture(),
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xd9b06a,
      sizeAttenuation: true
    })
  );
  scene.add(dust);

  /* ------------------------- INTERACTION ----------------------- */
  let pointer = { x: 0, y: 0 };
  let parallax = { x: 0, y: 0 };
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let velocity = 0;
  let spinVelocity = 0;
  let active = 'jar';
  let isVisible = true;
  let started = false;
  const clock = new THREE.Clock();

  function setProduct(key, instant = false) {
    if (!['jar', 'sachet', 'drops'].includes(key)) return;
    if (key === active && !instant) return;
    const groups = { jar, sachet: sachetGroup, drops };
    const next = groups[key];
    const prev = groups[active];
    active = key;
    if (instant) {
      Object.values(groups).forEach((g) => { g.visible = g === next; g.scale.setScalar(1); });
      next.rotation.set(0, 0, 0);
      spin.rotation.set(0, 0, 0);
      return;
    }
    gsap.killTweensOf([spin.rotation, next.scale, next.rotation, prev.scale, prev.rotation]);
    spinVelocity = 0;
    velocity = 0;

    gsap.timeline()
      .to(prev.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.38, ease: 'power2.in' }, 0)
      .to(prev.rotation, { y: prev.rotation.y + 0.65, duration: 0.38, ease: 'power2.in' }, 0)
      .to(halo.scale, { x: 0.94, y: 0.94, z: 0.94, duration: 0.38, ease: 'power2.in' }, 0)
      .call(() => {
        prev.visible = false;
        next.visible = true;
        next.scale.setScalar(0.55);
        next.rotation.set(0, -0.55, 0);
        spin.rotation.set(0, 0, 0);
      })
      .to(next.scale, { x: 1, y: 1, z: 1, duration: 0.72, ease: 'power3.out' })
      .to(next.rotation, { y: 0, duration: 0.85, ease: 'power3.out' }, '<')
      .to(halo.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'elastic.out(1, 0.6)' }, '<');
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    velocity = 0;
    parent.classList.add('is-dragging');
    try { canvas.setPointerCapture(e.pointerId); } catch { /* noop */ }
  }
  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    spin.rotation.y += dx * 0.008;
    spin.rotation.x = THREE.MathUtils.clamp(spin.rotation.x + dy * 0.004, -0.28, 0.28);
    velocity = dx * 0.008;
    spinVelocity = dx * 0.0009;
  }
  function onPointerUp(e) {
    dragging = false;
    parent.classList.remove('is-dragging');
    try { canvas.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  function resize() {
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 620 ? 36 : 30;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(parent);

  // Pause offscreen
  const io = new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; }, { threshold: 0.02 });
  io.observe(parent);
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden && isVisible;
  });

  let scrollY = 0;
  function setScroll(y) {
    scrollY = y;
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (!dragging) {
      velocity *= 0.94;
      spin.rotation.y += velocity + (REDUCED ? 0 : 0.0009);
      spin.rotation.x += (0 - spin.rotation.x) * 0.02;
    }
    if (!REDUCED) {
      spin.position.y = Math.sin(t * 0.8) * 0.022;
      halo.rotation.z = Math.sin(t * 0.2) * 0.02;
      dust.rotation.y = t * 0.016;
      leaves.forEach((leaf, i) => {
        const d = leaf.userData;
        leaf.position.y = d.base.y + Math.sin(t * d.speed + d.phase) * 0.12;
        leaf.position.x = d.base.x + Math.cos(t * d.speed * 0.8 + d.phase) * 0.07;
        leaf.rotation.z = 0.4 * Math.sin(i * 2) + Math.sin(t * 0.35 + d.phase) * 0.12;
      });
      const pos = dustGeo.attributes.position;
      for (let i = 0; i < dustCount; i++) {
        const b = dustBase[i];
        pos.setX(i, b.x + Math.sin(t * b.s + b.p) * 0.16);
        pos.setY(i, b.y + Math.cos(t * b.s * 0.8 + b.p) * 0.2);
        pos.setZ(i, b.z + Math.cos(t * b.s * 0.6 + b.p) * 0.12);
      }
      pos.needsUpdate = true;
    }

    // Gentle mouse parallax on camera and rig
    parallax.x += (pointer.x * 0.32 - parallax.x) * 0.04;
    parallax.y += (-pointer.y * 0.18 - parallax.y) * 0.04;
    camera.position.x = parallax.x;
    camera.position.y = 0.18 + parallax.y;
    camera.lookAt(0.05, 0.1, 0);
    pivot.rotation.z = parallax.x * 0.02;
    pivot.position.y = -0.44;

    renderer.render(scene, camera);
  }

  // Intro
  pivot.scale.setScalar(0.001);
  pivot.rotation.y = -0.35;
  function start() {
    if (started) return;
    started = true;
    setProduct('jar', true);
    jar.scale.setScalar(1);
    if (REDUCED) {
      pivot.scale.setScalar(1);
      pivot.rotation.y = 0;
    } else {
      gsap.to(pivot.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: 'power4.out', delay: 0.15 });
      gsap.to(pivot.rotation, { y: 0, duration: 1.8, ease: 'power3.out', delay: 0.15 });
    }
    animate();
  }

  return {
    start,
    setProduct,
    setScroll,
    renderOnce: () => renderer.render(scene, camera),
    getCanvas: () => canvas,
    debug: () => ({ started, active, isVisible, scale: pivot.scale.x, rotationY: spin.rotation.y, render: { ...renderer.info.render }, cam: camera.position.toArray(), pivot: pivot.position.toArray(), renderer }),
    dispose() {
      ro.disconnect();
      io.disconnect();
      renderer.dispose();
    }
  };
}
